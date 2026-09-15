#!/usr/bin/env node
// Regenerate the rule table in SPEC.md from scripts/cases.mjs, so the two never drift.
//
//   node scripts/spec.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CASES } from './cases.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SPEC = path.join(ROOT, 'SPEC.md')

const BEGIN = '<!-- BEGIN RULES -->'
const END = '<!-- END RULES -->'

const groups = []
for (const c of CASES) {
  let g = groups.find((x) => x.name === c.group)
  if (!g) { g = { name: c.group, cases: [] }; groups.push(g) }
  g.cases.push(c)
}

const lines = []
for (const g of groups) {
  lines.push(`### ${g.name}`, '')
  lines.push('| Id | Severity | Rule |')
  lines.push('|---|---|---|')
  for (const c of g.cases) lines.push(`| \`${c.id}\` | ${c.severity} | ${c.rule} |`)
  lines.push('')
}

const counts = CASES.reduce((m, c) => ({ ...m, [c.severity]: (m[c.severity] || 0) + 1 }), {})
lines.push(`${CASES.length} rules: ${counts.critical} critical, ${counts.major} major, ${counts.minor} minor.`)

const spec = fs.readFileSync(SPEC, 'utf8')
const before = spec.slice(0, spec.indexOf(BEGIN) + BEGIN.length)
const after = spec.slice(spec.indexOf(END))
fs.writeFileSync(SPEC, `${before}\n\n${lines.join('\n')}\n\n${after}`)
console.log(`SPEC.md rule table regenerated (${CASES.length} rules).`)
