#!/usr/bin/env node
// Create the conformance corpus in a Confluence Cloud space.
//
//   CONFLUENCE_BASE_URL=https://your-site.atlassian.net \
//   CONFLUENCE_EMAIL=you@example.com \
//   CONFLUENCE_API_TOKEN=xxxx \
//   node scripts/seed.mjs [--space KEY]
//
// Re-running is safe: an existing space is reused and existing pages are updated
// in place rather than duplicated.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FIXTURES = path.join(ROOT, 'fixtures')

const BASE = (process.env.CONFLUENCE_BASE_URL || '').replace(/\/+$/, '')
const EMAIL = process.env.CONFLUENCE_EMAIL
const TOKEN = process.env.CONFLUENCE_API_TOKEN

if (!BASE || !EMAIL || !TOKEN) {
  console.error('Set CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL and CONFLUENCE_API_TOKEN.')
  console.error('An API token comes from https://id.atlassian.com/manage-profile/security/api-tokens')
  process.exit(1)
}

const AUTH = 'Basic ' + Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64')

async function api(method, route, body, extraHeaders = {}, attempt = 1) {
  const res = await fetch(`${BASE}${route}`, {
    method,
    headers: {
      Authorization: AUTH,
      Accept: 'application/json',
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* not json */ }
  if (!res.ok) {
    // A version conflict means someone (usually the previous run, still
    // settling) wrote first; rate limits and 5xx are worth one more go too.
    const retryable = [409, 429, 500, 502, 503, 504].includes(res.status)
    if (retryable && attempt < 4) {
      await new Promise((r) => setTimeout(r, 400 * 2 ** attempt))
      return api(method, route, body, extraHeaders, attempt + 1)
    }
    const err = new Error(`${method} ${route} → ${res.status}\n${text.slice(0, 500)}`)
    err.status = res.status
    err.json = json
    throw err
  }
  return json
}

const manifest = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'manifest.json'), 'utf8'))
const spaceKey = argValue('--space') || manifest.space.key

function argValue(flag) {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] : null
}

// ---------------------------------------------------------------- space

async function ensureSpace() {
  try {
    const found = await api('GET', `/wiki/rest/api/space/${encodeURIComponent(spaceKey)}?expand=homepage`)
    console.log(`space ${spaceKey} already exists (id ${found.id})`)
    return { id: String(found.id), homepageId: String(found.homepage.id) }
  } catch (e) {
    if (e.status !== 404) throw e
  }
  const created = await api('POST', '/wiki/rest/api/space', {
    key: spaceKey,
    name: manifest.space.name,
    description: { plain: { value: 'Seed corpus for confluence-markdown-conformance.', representation: 'plain' } },
  })
  console.log(`space ${spaceKey} created (id ${created.id})`)
  return { id: String(created.id), homepageId: String(created.homepage.id) }
}

// ---------------------------------------------------------------- pages

async function findPageByTitle(spaceId, title) {
  const res = await api('GET', `/wiki/api/v2/spaces/${spaceId}/pages?limit=250`)
  return (res.results || []).find((p) => p.title === title) || null
}

async function upsertPage({ spaceId, title, storage, parentId, existingId }) {
  const body = { representation: 'storage', value: storage }
  if (existingId) {
    const current = await api('GET', `/wiki/api/v2/pages/${existingId}`)
    return await api('PUT', `/wiki/api/v2/pages/${existingId}`, {
      id: existingId,
      status: 'current',
      title,
      body,
      version: { number: current.version.number + 1, message: 'conformance seed' },
      ...(parentId ? { parentId } : {}),
    })
  }
  return await api('POST', '/wiki/api/v2/pages', {
    spaceId,
    status: 'current',
    title,
    body,
    ...(parentId ? { parentId } : {}),
  })
}

// ---------------------------------------------------------------- attachments

async function uploadAttachment(pageId, filename) {
  const filePath = path.join(FIXTURES, 'attachments', filename)
  const data = fs.readFileSync(filePath)
  const form = new FormData()
  form.append('file', new Blob([data]), filename)
  form.append('minorEdit', 'true')
  // The v1 endpoint is the only one that accepts a multipart upload.
  await api('PUT', `/wiki/rest/api/content/${pageId}/child/attachment`, form, {
    'X-Atlassian-Token': 'nocheck',
  })
}

// ---------------------------------------------------------------- run

const space = await ensureSpace()
const idMap = new Map() // manifest id -> confluence page id

// Parents must exist before children, so walk the manifest in dependency order.
const pending = [...manifest.pages]
const done = new Set()
let guard = 0

while (pending.length) {
  if (guard++ > 1000) throw new Error('manifest has a parent cycle')
  const page = pending.shift()
  if (page.parent && !done.has(page.parent)) { pending.push(page); continue }

  const storage = fs.readFileSync(path.join(FIXTURES, 'pages', page.body), 'utf8')

  let pageId
  if (page.root) {
    // The space homepage already exists; rewrite it rather than adding a duplicate.
    pageId = space.homepageId
    await upsertPage({ spaceId: space.id, title: page.title, storage, existingId: pageId })
  } else {
    const parentId = page.parent ? idMap.get(page.parent) : space.homepageId
    const existing = await findPageByTitle(space.id, page.title)
    const saved = await upsertPage({
      spaceId: space.id,
      title: page.title,
      storage,
      parentId,
      existingId: existing ? existing.id : null,
    })
    pageId = String(saved.id)
  }

  idMap.set(page.id, pageId)
  done.add(page.id)
  console.log(`  page  ${page.title}  →  ${pageId}`)

  for (const filename of page.attachments || []) {
    await uploadAttachment(pageId, filename)
    console.log(`  file  ${filename}`)
  }
}

console.log(`\nSeeded ${done.size} pages into ${BASE}/wiki/spaces/${spaceKey}`)
console.log('Now export that page tree with the app under test, then run:')
console.log('  node scripts/score.mjs <exported-directory>')
