/**
 * The full loop, with nothing stubbed in the middle.
 *
 *   compiled game (JS)  ->  net.Socket  ->  real WebSocket
 *        ->  AnkillousJ gateway (real)  ->  TCP  ->  protocol server (real)
 *
 * The only stub is the DOM, because Node has no browser. The socket is a
 * genuine WebSocket connection over the loopback interface.
 */
import { createRequire } from 'node:module'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { installDom } from './dom-stub.mjs'
import { Image as RealImage } from '@napi-rs/canvas'
import WS from 'ws'
const require = createRequire(import.meta.url)

const ROOT = '/home/claude/full/web/'
const dom = installDom({ width: 1280, height: 720, traceCanvas: true })
const logs = []
globalThis.__ankLog = (m) => logs.push(m)

// --- assets from disk, async like a real server ---
globalThis.XMLHttpRequest = class {
  constructor() { this.readyState = 0; this.status = 0; this.responseText = '' }
  open(m, url, async) { this.url = url.replace(/^\//, ''); this.async = async !== false }
  setRequestHeader() {} overrideMimeType() {} abort() {}
  getAllResponseHeaders() { return '' }
  getResponseHeader() { return null }
  send() {
    const p = ROOT + this.url
    if (this.url.startsWith('http') || !existsSync(p)) { this.status = 404; this.responseText = '' }
    else { this.responseText = Buffer.from(readFileSync(p)).toString('latin1'); this.status = 200 }
    this.readyState = 4
    const fire = () => { this.onreadystatechange?.(); this.onload?.(); this.onloadend?.() }
    this.async ? setTimeout(fire, 0) : fire()
  }
}
globalThis.fetch = () => Promise.reject(new Error('offline'))

const blobs = new Map(); let seq = 0
globalThis.URL = { createObjectURL: (b) => { const id = 'blob:' + (++seq); blobs.set(id, b); return id } }
globalThis.Blob = class { constructor(parts) { this.parts = parts } }
globalThis.Image = class {
  constructor() { this._l = {}; this.width = 0; this.height = 0; this.complete = false }
  addEventListener(t, f) { (this._l[t] ||= []).push(f) }
  set src(v) {
    this._src = v
    let bytes = null
    if (v.startsWith('blob:')) { const b = blobs.get(v); if (b) bytes = Buffer.from(b.parts[0]) }
    else { const p = ROOT + v.replace(/^\//, ''); if (existsSync(p)) bytes = readFileSync(p) }
    if (!bytes) { setTimeout(() => (this._l.error || []).forEach(f => f()), 0); return }
    const img = new RealImage(); img.src = bytes
    this._real = img; this.width = img.width; this.height = img.height; this.complete = true
    setTimeout(() => (this._l.load || []).forEach(f => f()), 0)
  }
  get src() { return this._src }
}
const rawDraw = dom.ctx.drawImage.bind(dom.ctx)
dom.ctx.drawImage = (img, ...r) => rawDraw(img && img._real ? img._real : img, ...r)

// --- a REAL WebSocket, to the REAL gateway ---
const wire = []
globalThis.WebSocket = class {
  constructor(url) {
    this.url = url
    this.readyState = 0
    const s = new WS(url)
    this._s = s
    s.on('open', () => { this.readyState = 1; this.onopen?.() })
    s.on('message', (d) => { const t = d.toString(); wire.push('<- ' + t); this.onmessage?.({ data: t }) })
    s.on('close', (c, r) => { this.readyState = 3; this.onclose?.({ code: c, reason: String(r) }) })
    s.on('error', () => this.onerror?.())
  }
  send(t) { wire.push('-> ' + t); this._s.send(t) }
  close(c, r) { this._s.close(c, r) }
}

require(ROOT + 'futura.js').main([])

await new Promise((r) => setTimeout(r, 2500))
for (let i = 0; i < 40; i++) { dom.pump(2); await new Promise((r) => setTimeout(r, 40)) }

writeFileSync('/home/claude/render/futura-loop.png', dom.canvas.toBuffer('image/png'))

console.log('java log:')
for (const l of logs) console.log('   ' + l)
console.log('\nwire traffic (' + wire.length + ' lines):')
for (const w of wire.slice(0, 20)) console.log('   ' + w)
console.log('\ncanvas ops: ' + Object.values(dom.counts).reduce((a, b) => a + b, 0))
process.exit(0)
