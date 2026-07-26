#!/usr/bin/env node
/**
 * AWT surface scanner.
 *
 * Walks a Java source tree, inventories every Graphics2D / FontMetrics call
 * site, and diffs the result against the methods the awt.Graphics2D shim
 * actually implements. The output is the porting backlog, per method, with
 * the files that will break if it stays unimplemented.
 *
 *   node scan-awt.mjs <java-source-root> [--shim <Graphics2D.java>] [--json out.json]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2)
if (argv.length === 0) {
  console.error('usage: node scan-awt.mjs <java-source-root> [--shim <Graphics2D.java>] [--json out.json]')
  process.exit(1)
}
const ROOT = argv[0]
// --shim may be given multiple times, or point at a directory of shim classes
const shimPaths = []
argv.forEach((a, i) => { if (a === '--shim') shimPaths.push(argv[i + 1]) })
const jsonPath = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null

// ---------------------------------------------------------------------------
// collect sources
// ---------------------------------------------------------------------------
function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, acc)
    else if (extname(p) === '.java') acc.push(p)
  }
  return acc
}
const files = walk(ROOT)

// ---------------------------------------------------------------------------
// what the shim implements
// ---------------------------------------------------------------------------
let implemented = new Set()
for (const sp of shimPaths) {
  const targets = statSync(sp).isDirectory() ? walk(sp) : [sp]
  for (const t of targets) {
    const shim = readFileSync(t, 'utf8')
    for (const m of shim.matchAll(/^\s+public\s+[\w[\]<>.]+\s+(\w+)\s*\(/gm)) {
      implemented.add(m[1])
    }
  }
}

// ---------------------------------------------------------------------------
// find Graphics2D-typed receivers per file, then their call sites
// ---------------------------------------------------------------------------
const RECEIVER_HINTS = /\b(?:Graphics2D|Graphics)\s+(\w+)\s*[;=)]/g
const FONTMETRICS = /\bFontMetrics\s+(\w+)\s*[;=]/g

const methodCalls = new Map()   // method -> { count, files:Set }
const awtTypes = new Map()      // imported java.awt type -> count
const bump = (map, key, file) => {
  if (!map.has(key)) map.set(key, { count: 0, files: new Set() })
  const e = map.get(key)
  e.count++
  if (file) e.files.add(file)
}

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  const rel = relative(ROOT, f)

  // imported AWT types
  for (const m of src.matchAll(/^import\s+(java\.awt[\w.]*)\.(\w+|\*);/gm)) {
    bump(awtTypes, m[2] === '*' ? m[1] + '.*' : m[2], rel)
  }

  // receivers declared as Graphics/Graphics2D in this file
  const receivers = new Set()
  for (const m of src.matchAll(RECEIVER_HINTS)) receivers.add(m[1])
  for (const m of src.matchAll(FONTMETRICS)) receivers.add(m[1])
  // common conventions even without a visible declaration
  for (const n of ['g2d', 'g2', 'g', 'gg', 'graphics', 'fm']) {
    if (new RegExp(`\\b${n}\\s*\\.\\s*\\w+\\s*\\(`).test(src)) receivers.add(n)
  }

  if (receivers.size === 0) continue
  const alt = [...receivers].map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const callRe = new RegExp(`\\b(?:${alt})\\s*\\.\\s*(\\w+)\\s*\\(`, 'g')
  for (const m of src.matchAll(callRe)) bump(methodCalls, m[1], rel)
}

// Drop obvious non-AWT noise picked up by the single-letter `g` receiver
const NOISE = new Set([
  'get', 'getKey', 'getValue', 'equals', 'hashCode', 'toString', 'length',
  'size', 'add', 'put', 'run', 'start', 'stop', 'accept', 'apply', 'test',
  'getTab',
])
for (const k of [...methodCalls.keys()]) if (NOISE.has(k)) methodCalls.delete(k)

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const rows = [...methodCalls.entries()]
  .map(([name, e]) => ({ name, count: e.count, files: [...e.files].sort(), done: implemented.has(name) }))
  .sort((a, b) => b.count - a.count)

const done = rows.filter((r) => r.done)
const todo = rows.filter((r) => !r.done)
const totalCalls = rows.reduce((s, r) => s + r.count, 0)
const doneCalls = done.reduce((s, r) => s + r.count, 0)

const bar = (pct, w = 32) => '█'.repeat(Math.round((pct / 100) * w)).padEnd(w, '░')
const pct = totalCalls ? (100 * doneCalls) / totalCalls : 0

console.log('='.repeat(72))
console.log('AWT SURFACE SCAN')
console.log('='.repeat(72))
console.log(`source root      ${ROOT}`)
console.log(`shim             ${shimPaths.join(', ') || '(none)'}`)
console.log(`java files       ${files.length}`)
console.log(`distinct methods ${rows.length}   (${done.length} implemented, ${todo.length} to do)`)
console.log(`call sites       ${totalCalls}   (${doneCalls} covered)`)
console.log()
console.log(`coverage  ${bar(pct)}  ${pct.toFixed(1)}%`)
console.log()

if (todo.length) {
  console.log('TO DO — ranked by call sites'.padEnd(52) + 'calls  files')
  console.log('-'.repeat(72))
  for (const r of todo) {
    console.log(`  ${r.name.padEnd(48)} ${String(r.count).padStart(5)}  ${r.files.length}`)
    for (const f of r.files.slice(0, 3)) console.log(`      ${f}`)
    if (r.files.length > 3) console.log(`      ... and ${r.files.length - 3} more`)
  }
  console.log()
}

console.log('DONE'.padEnd(52) + 'calls')
console.log('-'.repeat(72))
for (const r of done) console.log(`  ${r.name.padEnd(48)} ${String(r.count).padStart(5)}`)
console.log()

console.log('java.awt TYPES REFERENCED')
console.log('-'.repeat(72))
const types = [...awtTypes.entries()].sort((a, b) => b[1].count - a[1].count)
for (const [t, e] of types) console.log(`  ${t.padEnd(48)} ${String(e.count).padStart(5)} file(s)`)
console.log()

if (jsonPath) {
  writeFileSync(jsonPath, JSON.stringify({ root: ROOT, files: files.length, rows, types: types.map(([t, e]) => ({ type: t, files: e.count })) }, null, 2))
  console.log(`wrote ${jsonPath}`)
}
