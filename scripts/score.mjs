#!/usr/bin/env node
// Score an export against the conformance rules.
//
//   unzip export.zip -d out/some-app
//   node scripts/score.mjs out/some-app [--json] [--label "App name 1.2.3"]

import fs from 'node:fs'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import { CASES } from './cases.mjs'

const dir = process.argv[2]
if (!dir || !fs.existsSync(dir)) {
  console.error('usage: node scripts/score.mjs <exported-directory> [--json] [--label "..."]')
  process.exit(1)
}
const asJson = process.argv.includes('--json')
const labelIdx = process.argv.indexOf('--label')
const label = labelIdx >= 0 ? process.argv[labelIdx + 1] : path.basename(dir)

const md = new MarkdownIt({ html: true, linkify: false }).enable('table')

// ------------------------------------------------------------------ load

function walk(root, base = '') {
  const out = []
  for (const entry of fs.readdirSync(path.join(root, base), { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...walk(root, rel))
    else out.push(rel)
  }
  return out
}

const files = walk(dir).sort()
const mdFiles = files.filter((f) => /\.(md|markdown)$/i.test(f))
const assetFiles = files.filter((f) => !/\.(md|markdown)$/i.test(f))

const byFile = new Map()
for (const f of mdFiles) byFile.set(f, fs.readFileSync(path.join(dir, f), 'utf8'))

const text = [...byFile.values()].join('\n\n')
const html = [...byFile.values()].map((t) => md.render(t)).join('\n')
const renderedText = decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/[ \t]+/g, ' ')

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

// ------------------------------------------------------------------ derived

const allTokens = [...byFile.values()].map((t) => md.parse(t, {}))

function fenceLanguages() {
  const out = []
  for (const toks of allTokens) {
    for (const t of toks) if (t.type === 'fence' && t.info) out.push(t.info.trim().split(/\s+/)[0].toLowerCase())
  }
  return out
}

function codeBlockContents() {
  const out = []
  for (const toks of allTokens) {
    for (const t of toks) if (t.type === 'fence' || t.type === 'code_block') out.push(t.content)
  }
  return out
}

function maxListDepth() {
  let best = 0
  for (const toks of allTokens) {
    let d = 0
    for (const t of toks) {
      if (t.type.endsWith('_list_open')) { d++; best = Math.max(best, d) }
      else if (t.type.endsWith('_list_close')) d--
    }
  }
  return best
}

/** How deep in lists a given phrase sits — 0 means it is not in a list at all. */
function listDepthOfText(needle) {
  let best = 0
  for (const toks of allTokens) {
    let d = 0
    for (const t of toks) {
      if (t.type.endsWith('_list_open')) d++
      else if (t.type.endsWith('_list_close')) d--
      else if (t.type === 'inline' && t.content.includes(needle)) best = Math.max(best, d)
    }
  }
  return best
}

/** Whether a fence whose content matches `re` sits inside a list item. */
function fenceInListMatching(re) {
  for (const toks of allTokens) {
    let d = 0
    for (const t of toks) {
      if (t.type.endsWith('_list_open')) d++
      else if (t.type.endsWith('_list_close')) d--
      else if ((t.type === 'fence' || t.type === 'code_block') && d > 0 && re.test(t.content)) return true
    }
  }
  return false
}

function blockInsideList(type) {
  for (const toks of allTokens) {
    let d = 0
    for (const t of toks) {
      if (t.type.endsWith('_list_open')) d++
      else if (t.type.endsWith('_list_close')) d--
      else if (t.type === type && d > 0) return true
    }
  }
  return false
}

function tableRows() {
  const rows = []
  for (const toks of allTokens) {
    let row = null
    for (const t of toks) {
      if (t.type === 'tr_open') row = []
      else if (t.type === 'tr_close') { if (row) rows.push(row); row = null }
      else if (t.type === 'inline' && row) row.push(t.content)
      else if ((t.type === 'th_close' || t.type === 'td_close') && row && row.length === 0) row.push('')
    }
  }
  // A cell with no inline token produced nothing; re-derive empties from the raw pipes.
  for (const t of text.split('\n')) {
    if (/^\s*\|/.test(t) && !/^\s*\|[\s:|-]+\|\s*$/.test(t)) {
      rows.push(t.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|'))
    }
  }
  return rows
}

function filesContaining(needle) {
  return mdFiles.filter((f) => byFile.get(f).includes(needle))
}

const ctx = {
  files, mdFiles, assetFiles, byFile, text, html, renderedText,
  has: (s) => text.includes(s),
  hasAll: (arr) => arr.every((s) => text.includes(s)),
  htmlHasAll: (arr) => arr.every((s) => html.includes(s)),
  hasFiles: (names) => names.every((n) => files.some((f) => path.basename(f) === n)),
  hasFileMatching: (re) => files.some((f) => re.test(f)),
  fenceLanguages, codeBlockContents, maxListDepth, blockInsideList, tableRows, filesContaining,
  listDepthOfText, fenceInListMatching,
  fileForContent: (needle, predicate) => {
    const hits = filesContaining(needle)
    return hits.length === 1 && predicate(hits[0])
  },
}

// ------------------------------------------------------------------ run

const results = CASES.map((c) => {
  let pass = false
  let error = null
  try { pass = Boolean(c.check(ctx)) } catch (e) { error = String(e).slice(0, 120) }
  return { ...c, check: undefined, pass, error }
})

const weight = { critical: 3, major: 2, minor: 1 }
const earned = results.filter((r) => r.pass).reduce((s, r) => s + weight[r.severity], 0)
const total = results.reduce((s, r) => s + weight[r.severity], 0)

if (asJson) {
  console.log(JSON.stringify({ label, files: files.length, mdFiles: mdFiles.length, earned, total, results }, null, 2))
} else {
  console.log(`\n# ${label}`)
  console.log(`${mdFiles.length} markdown files, ${assetFiles.length} other files\n`)
  let group = null
  for (const r of results) {
    if (r.group !== group) { group = r.group; console.log(`\n## ${group}`) }
    const mark = r.pass ? 'PASS' : r.severity === 'critical' ? 'FAIL!' : 'FAIL '
    console.log(`  ${mark}  ${r.id.padEnd(6)} ${r.rule}${r.error ? `  [check error: ${r.error}]` : ''}`)
  }
  const failed = results.filter((r) => !r.pass)
  const crit = failed.filter((r) => r.severity === 'critical').length
  console.log(`\n${results.length - failed.length}/${results.length} cases pass.`)
  console.log(`Weighted score ${earned}/${total} (${Math.round((earned / total) * 100)}%).`)
  console.log(`${crit} critical failure${crit === 1 ? '' : 's'}.`)
}
