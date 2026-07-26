/**
 * Runs the TeaVM-compiled Java in Node against a real Canvas2D implementation,
 * then writes the result to PNG. Same compiled output would run in a browser —
 * the only difference is where globalThis.__ankCtx comes from.
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { writeFileSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
const here = dirname(fileURLToPath(import.meta.url))

const W = 420, H = 140
const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

// --- instrument the context so we can prove which AWT calls got translated ---
const calls = []
const traced = new Proxy(ctx, {
  get(target, prop) {
    const v = target[prop]
    if (typeof v === 'function') {
      return (...args) => {
        calls.push(String(prop))
        return v.apply(target, args)
      }
    }
    return v
  },
  set(target, prop, value) {
    calls.push(`set:${String(prop)}`)
    target[prop] = value
    return true
  },
})

globalThis.__ankCtx = traced
globalThis.__ankLog = (m) => console.log('  [java]', m)

// TeaVM emits a UMD module; load it via require
const require = createRequire(import.meta.url)
const mod = require(join(here,'..','web','proof.js'))

const entry = mod.main ?? mod.default?.main ?? globalThis.main
if (typeof entry !== 'function') {
  console.error('exports:', Object.keys(mod))
  process.exit(1)
}

console.log('running compiled Java...')
entry([])

writeFileSync(join(here,'card.png'), canvas.toBuffer('image/png'))

// --- report ---
const counts = calls.reduce((m, c) => (m[c] = (m[c] || 0) + 1, m), {})
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
console.log(`\nCanvas2D operations issued by the Java code: ${calls.length}`)
for (const [k, v] of sorted) console.log(`  ${k.padEnd(24)} ${v}`)
console.log('\nwrote card.png')
