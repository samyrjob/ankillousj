/**
 * The case that actually matters: a dialog opened while the game loop is
 * running. Frames must keep coming.
 */
import { createRequire } from 'node:module'
import { readFileSync, existsSync } from 'node:fs'
import { installDom, reportAndExit } from './dom-stub.mjs'
import { Image as RealImage } from '@napi-rs/canvas'
const require = createRequire(import.meta.url)

const ROOT = '/home/claude/full/web/'
const dom = installDom({ width: 1280, height: 720, traceCanvas: true })

// assets + REST, same as the render harness
globalThis.XMLHttpRequest = class {
  open(m, url, a) { this.url = url.replace(/^\//, ''); this.async = a !== false }
  setRequestHeader() {} overrideMimeType() {} abort() {}
  getAllResponseHeaders() { return '' }
  set responseType(t) { this._rt = t }
  get responseType() { return this._rt || '' }
  send() {
    const p = ROOT + this.url
    let bytes = null
    if (!this.url.startsWith('http') && existsSync(p)) { bytes = readFileSync(p); this.status = 200 }
    else this.status = 404
    this.responseText = bytes ? bytes.toString('latin1') : ''
    this.response = this._rt === 'arraybuffer'
      ? (bytes ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) : new ArrayBuffer(0))
      : this.responseText
    this.readyState = 4
    const fire = () => { this.onreadystatechange?.(); this.onload?.(); this.onloadend?.() }
    this.async ? setTimeout(fire, 0) : fire()
  }
}
globalThis.fetch = () => Promise.reject(new Error('offline'))
const blobs = new Map(); let seq = 0
globalThis.URL = { createObjectURL: (b) => { const id = 'blob:' + (++seq); blobs.set(id, b); return id } }
globalThis.Blob = class { constructor(p) { this.parts = p } }
globalThis.Image = class {
  constructor() { this._l = {}; this.width = 0; this.height = 0 }
  addEventListener(t, f) { (this._l[t] ||= []).push(f) }
  set src(v) {
    let b = null
    if (v.startsWith('blob:')) { const x = blobs.get(v); if (x) b = Buffer.from(x.parts[0]) }
    else { const p = ROOT + v.replace(/^\//, ''); if (existsSync(p)) b = readFileSync(p) }
    if (!b) { setTimeout(() => (this._l.error || []).forEach(f => f()), 0); return }
    const i = new RealImage(); i.src = b
    this._real = i; this.width = i.width; this.height = i.height
    setTimeout(() => (this._l.load || []).forEach(f => f()), 0)
  }
}
const raw = dom.ctx.drawImage.bind(dom.ctx)
dom.ctx.drawImage = (im, ...r) => raw(im && im._real ? im._real : im, ...r)

// a body that records dialogs
const appended = []
const realCreate = globalThis.document.createElement
globalThis.document.head = { appendChild: () => {} }
globalThis.document.body = {
  appendChild: (c) => { appended.push(c); return c },
  removeChild: () => {},
}
globalThis.document.createElement = (t) => ({
  tagName: t.toUpperCase(), className: '', innerHTML: '', textContent: '',
  style: {}, value: '', _l: {},
  appendChild() {}, removeChild() {},
  addEventListener(k, f) { (this._l[k] ||= []).push(f) },
  setAttribute() {}, hasAttribute: () => false, focus() {},
  querySelector: () => globalThis.document.createElement('div'),
  querySelectorAll: () => [],
})

globalThis.location = { search: '?midrun' }
const quiet = console.log
console.log = () => {}
require(ROOT + 'futura.js').main([])
await new Promise((r) => setTimeout(r, 800))
for (let i = 0; i < 10; i++) { dom.pump(2); await new Promise((r) => setTimeout(r, 30)) }
console.log = quiet

const results = []
const check = (n, ok) => results.push((ok ? 'PASS ' : 'FAIL ') + n)

const opsBefore = Object.values(dom.counts).reduce((a, b) => a + b, 0)
check('the game is rendering before the dialog  (' + opsBefore + ' ops)', opsBefore > 1000)
// the Java side opens one 300 ms in; keep pumping across that point
for (let i = 0; i < 20; i++) { dom.pump(2); await new Promise((r) => setTimeout(r, 30)) }
check('a dialog was opened mid-run', appended.length > 0)
const opsAfter = Object.values(dom.counts).reduce((a, b) => a + b, 0)
check('frames kept coming with the dialog open  (+' + (opsAfter - opsBefore) + ' ops)',
  opsAfter > opsBefore)

let turned = false
setTimeout(() => { turned = true }, 0)
await new Promise((r) => setTimeout(r, 30))
check('the event loop still turns', turned)

reportAndExit('dialogs do not stall the running game', results)
