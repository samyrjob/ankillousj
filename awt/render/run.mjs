/**
 * Renders the compiled Java headlessly against a real Canvas2D and writes a
 * PNG, plus a trace of every Canvas2D call the Java code made.
 *
 * The same compiled output runs in a browser — the only difference is that
 * there the DOM is real.
 */
import { PROOF_WEB_JS } from './paths.mjs'
import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const W = 560, H = 200
const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

// Count every Canvas2D operation the Java issues
const counts = {}
const traced = new Proxy(ctx, {
  get(t, p) {
    const v = t[p]
    return typeof v === 'function'
      ? (...a) => { counts[p] = (counts[p] || 0) + 1; return v.apply(t, a) }
      : v
  },
  set(t, p, v) { counts['set:' + p] = (counts['set:' + p] || 0) + 1; t[p] = v; return true },
})

let rafQueue = []
const el = {
  getContext: () => traced,
  get width() { return canvas.width }, set width(v) { canvas.width = v },
  get height() { return canvas.height }, set height(v) { canvas.height = v },
  style: {},
  hasAttribute: () => true,
  setAttribute: () => {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: W, height: H }),
  addEventListener: () => {},
  focus: () => {},
}
globalThis.document = { getElementById: () => el, querySelector: () => el }
globalThis.window = { devicePixelRatio: 1, addEventListener: () => {} }
globalThis.requestAnimationFrame = (cb) => { rafQueue.push(cb); return 1 }
globalThis.__ankLog = (m) => console.log('  [java]', m)

console.log('running compiled Java...')
require(PROOF_WEB_JS).main([])

// Drive a few frames so the component paints
for (let i = 0; i < 3; i++) { const q = rafQueue; rafQueue = []; q.forEach((f) => f()) }

writeFileSync(join(here, 'card.png'), canvas.toBuffer('image/png'))

const total = Object.values(counts).reduce((a, b) => a + b, 0)
console.log(`\nCanvas2D operations issued by the Java code: ${total}`)
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(24)} ${v}`)
}
console.log('\nwrote card.png')
