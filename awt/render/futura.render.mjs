/**
 * Boots the compiled game with assets actually served, and writes the frame.
 *
 * The XHR stub reads from disk, which is what a web server would do — the
 * game cannot tell the difference.
 */
import { createRequire } from 'node:module'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { installDom } from './dom-stub.mjs'
import { createCanvas, Image as RealImage } from '@napi-rs/canvas'
const require = createRequire(import.meta.url)

const ROOT = '/home/claude/full/web/'
const dom = installDom({ width: 1280, height: 720, traceCanvas: true })
const logs = []
const missing = []
globalThis.__ankLog = (m) => logs.push(m)

globalThis.XMLHttpRequest = class {
  constructor() { this.readyState = 0; this.status = 0; this.responseText = '' }
  open(method, url, async) {
    this.method = method
    this.url = url.replace(/^\//, '')
    this.async = async !== false
    this.readyState = 1
  }
  setRequestHeader() {}
  overrideMimeType() {}
  getAllResponseHeaders() { return '' }
  getResponseHeader() { return null }
  abort() {}
  send() {
    const path = ROOT + this.url
    if (this.url.startsWith('http') || !existsSync(path)) {
      missing.push(this.url)
      this.status = 404
      this.responseText = ''
    } else {
      // responseText is read back as latin-1 bytes by the resource shim
      this.responseText = Buffer.from(readFileSync(path)).toString('latin1')
      this.response = this.responseText
      this.status = 200
    }
    this.readyState = 4
    // TeaVM's own HttpURLConnection issues an ASYNCHRONOUS request and
    // suspends until a callback arrives. A stub that only sets fields leaves
    // it parked forever — which is exactly what stalled the constructor here.
    const fire = () => {
      if (this.onreadystatechange) this.onreadystatechange()
      if (this.onload) this.onload()
      if (this.onloadend) this.onloadend()
    }
    if (this.async) setTimeout(fire, 0); else fire()
  }
}
globalThis.fetch = () => Promise.reject(new Error('offline'))

// The game connects to the server while constructing. net.Socket suspends on
// @Async until the socket opens, so without a peer the constructor parks
// forever — correct behaviour, but it means the harness has to answer.
// This stands in for the gateway: it opens, and echoes nothing.
const openSockets = []
globalThis.WebSocket = class {
  constructor(url) {
    this.url = url; this.readyState = 0; this.sent = []
    openSockets.push(this)
    setTimeout(() => { this.readyState = 1; if (this.onopen) this.onopen() }, 0)
  }
  send(text) { this.sent.push(text) }
  close(code, reason) {
    this.readyState = 3
    if (this.onclose) this.onclose({ code: code || 1000, reason: reason || '' })
  }
  reply(line) { if (this.onmessage) this.onmessage({ data: line }) }
}

// Images decode from a blob URL; resolve those against the bytes we handed out
const blobs = new Map()
let blobSeq = 0
globalThis.URL = { createObjectURL: (b) => { const id = 'blob:' + (++blobSeq); blobs.set(id, b); return id } }
globalThis.Blob = class { constructor(parts) { this.parts = parts } }

globalThis.Image = class {
  constructor() { this._listeners = {}; this.width = 0; this.height = 0; this.complete = false }
  addEventListener(t, f) { (this._listeners[t] ||= []).push(f) }
  set src(v) {
    this._src = v
    let bytes = null
    if (v.startsWith('blob:')) {
      const b = blobs.get(v)
      if (b) bytes = Buffer.from(b.parts[0])
    } else {
      const p = ROOT + v.replace(/^\//, '')
      if (existsSync(p)) bytes = readFileSync(p); else missing.push(v)
    }
    if (!bytes) { setTimeout(() => (this._listeners.error || []).forEach(f => f()), 0); return }
    const img = new RealImage()
    img.src = bytes
    this._real = img
    this.width = img.width; this.height = img.height; this.complete = true
    setTimeout(() => (this._listeners.load || []).forEach(f => f()), 0)
  }
  get src() { return this._src }
}
// drawImage must receive the decoded image, not our wrapper
const rawDraw = dom.ctx.drawImage.bind(dom.ctx)
dom.ctx.drawImage = (img, ...rest) => rawDraw(img && img._real ? img._real : img, ...rest)

try { require(ROOT + 'futura.js').main([]) } catch (e) { logs.push('THREW ' + e) }
await dom.settle(600)
// GamePanel drives its own thread; pump frames and let assets settle between
for (let i = 0; i < 30; i++) { dom.pump(2); await dom.settle(40) }

writeFileSync('/home/claude/render/futura-frame.png', dom.canvas.toBuffer('image/png'))

console.log('rAF callbacks queued: ' + (globalThis.__rafCount || 0))
console.log('java log:')
for (const l of logs) console.log('   ' + l)
console.log('\nsockets opened: ' + openSockets.length)
for (const s of openSockets) console.log('   ' + s.url + '  sent ' + s.sent.length + ' line(s)')
console.log('\nassets missing: ' + [...new Set(missing)].length)
for (const m of [...new Set(missing)].slice(0, 8)) console.log('   ' + m)
console.log('\ncanvas ops: ' + Object.values(dom.counts).reduce((a, b) => a + b, 0))
console.log('wrote futura-frame.png')
