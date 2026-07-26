/* Minimal DOM so we can exercise the *browser* branch without a browser:
   proves the event wiring builds and dispatches, and that coordinates land. */
import { createCanvas } from '@napi-rs/canvas'
import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'
const require = createRequire(import.meta.url)

const canvas = createCanvas(560, 200)
const ctx = canvas.getContext('2d')
const listeners = {}
let rafQueue = []

const el = {
  getContext: () => ctx,
  get width() { return canvas.width }, set width(v) { canvas.width = v },
  get height() { return canvas.height }, set height(v) { canvas.height = v },
  style: {},
  hasAttribute: () => true, setAttribute: () => {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 560, height: 200 }),
  addEventListener: (t, f) => { (listeners[t] ||= []).push(f) },
  focus: () => {},
}
globalThis.document = { getElementById: (id) => (id === 'c' ? el : null) }
globalThis.window = { devicePixelRatio: 1, addEventListener: () => {} }
globalThis.requestAnimationFrame = (cb) => { rafQueue.push(cb); return 1 }
const logs = []
globalThis.__ankLog = (m) => logs.push(m)

const mod = require('/home/claude/proof/target/js/proof.js')
mod.main([])

const pump = (n = 3) => { for (let i = 0; i < n; i++) { const q = rafQueue; rafQueue = []; q.forEach(f => f()) } }
const fire = (type, props) => (listeners[type] || []).forEach(f => f({
  clientX: 0, clientY: 0, button: 0, detail: 1, deltaY: 0,
  shiftKey: false, ctrlKey: false, altKey: false, metaKey: false,
  key: '', keyCode: 0, preventDefault(){}, ...props,
}))

console.log('registered DOM events:', Object.keys(listeners).join(' '))
pump()

// the gear sits near the top-right of the card, around x=238 y=145 at this size
fire('mousemove', { clientX: 238, clientY: 145 })
pump()
fire('click', { clientX: 238, clientY: 145, button: 0 })
pump()
fire('wheel', { clientX: 100, clientY: 100, deltaY: -100 })
pump()
fire('keydown', { key: ' ', keyCode: 32 })
pump()

writeFileSync('/home/claude/render/interactive.png', canvas.toBuffer('image/png'))
console.log('java logged:', logs.join(' | '))
console.log('wrote interactive.png')
