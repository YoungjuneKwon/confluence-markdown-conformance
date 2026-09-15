#!/usr/bin/env node
// Check that the seeded space really holds every case before you blame an exporter.
//
//   node scripts/verify-seed.mjs [--space KEY]
//
// Confluence silently discards storage markup it does not accept. When that
// happens the page looks fine in a listing but the section is empty, and an
// exporter then gets blamed for content that was never there. This script reads
// the stored ADF back and reports any case heading whose section is empty.

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
  process.exit(1)
}
const AUTH = 'Basic ' + Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64')

const manifest = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'manifest.json'), 'utf8'))
const i = process.argv.indexOf('--space')
const spaceKey = i >= 0 ? process.argv[i + 1] : manifest.space.key

async function get(route) {
  const res = await fetch(`${BASE}${route}`, { headers: { Authorization: AUTH, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`GET ${route} → ${res.status}`)
  return res.json()
}

function* walk(node) {
  yield node
  for (const c of node.content || []) yield* walk(c)
}

function textOf(node) {
  let s = ''
  for (const n of walk(node)) if (n.type === 'text') s += n.text
  return s
}

// Split a document into sections keyed by the case id in each heading.
function sections(doc) {
  const out = []
  let current = null
  for (const node of doc.content || []) {
    const caseId = node.type === 'heading' ? (textOf(node).match(/\bC\d+\.\d+\b/) || [])[0] : null
    if (caseId) {
      // Only a heading that carries a case id opens a new section. Confluence
      // rewrites some macros into extra headings (a code macro title becomes an
      // h5), and those belong to the section they sit in.
      current = { id: caseId, title: textOf(node), nodes: [] }
      out.push(current)
    } else if (current) {
      current.nodes.push(node)
    }
  }
  return out
}

function isEmpty(nodes) {
  for (const n of nodes) {
    for (const d of walk(n)) {
      if (d.type === 'text' && d.text.trim()) return false
      if (['media', 'mediaSingle', 'mediaInline', 'table', 'codeBlock', 'extension', 'bodiedExtension',
        'inlineExtension', 'panel', 'expand', 'status', 'date', 'taskList', 'bulletList', 'orderedList',
        'rule', 'layoutSection', 'inlineCard', 'blockCard'].includes(d.type)) return false
    }
  }
  return true
}

// ------------------------------------------------------------------ run

const space = await get(`/wiki/rest/api/space/${encodeURIComponent(spaceKey)}`)
const list = await get(`/wiki/api/v2/spaces/${space.id}/pages?limit=250`)

const expectedTitles = manifest.pages.map((p) => p.title)
const seenTitles = list.results.map((p) => p.title)
const missingPages = expectedTitles.filter((t) => !seenTitles.includes(t))

let empties = 0
let checked = 0

for (const page of list.results) {
  const full = await get(`/wiki/api/v2/pages/${page.id}?body-format=atlas_doc_format`)
  const doc = JSON.parse(full.body.atlas_doc_format.value)
  for (const s of sections(doc)) {
    if (!s.id) continue
    checked++
    if (isEmpty(s.nodes)) {
      empties++
      console.log(`EMPTY  ${s.id.padEnd(6)} ${page.title} — "${s.title}"`)
    }
  }
}

for (const t of missingPages) console.log(`MISSING PAGE  ${t}`)

console.log(`\n${checked} case sections checked, ${empties} empty, ${missingPages.length} pages missing.`)
if (empties || missingPages.length) {
  console.log('\nConfluence did not store some fixture markup. Fix the fixture and re-seed —')
  console.log('do not score an exporter against content that is not actually on the page.')
  process.exit(1)
}
console.log('Seed is intact. Safe to export and score.')
