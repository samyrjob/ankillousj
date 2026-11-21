/**
 * The full loop, with nothing stubbed in the middle.
 *
 *   compiled game (JS)  ->  net.Socket  ->  real WebSocket
 *        ->  AnkillousJ gateway (real)  ->  TCP  ->  protocol server (real)
 *
 * The only stub is the DOM, because Node has no browser. The socket is a
 * genuine WebSocket connection over the loopback interface.
 */
import { WEB, OUT } from './paths.mjs'
import { createRequire } from 'node:module'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { installDom } from './dom-stub.mjs'
import { Image as RealImage } from '@napi-rs/canvas'
import WS from 'ws'
const require = createRequire(import.meta.url)

const ROOT = WEB
const dom = installDom({ width: 1280, height: 720, traceCanvas: true })
const logs = []
globalThis.__ankLog = (m) => logs.push(m)

// --- assets from disk, async like a real server ---
globalThis.XMLHttpRequest = class {
  constructor() { this.readyState = 0; this.status = 0; this.responseText = '' }
  open(m, url, async) { this.url = url.replace(/^\//, ''); this.async = async !== false }
  // TeaVM's HttpURLConnection asks for an ArrayBuffer, so both forms are set
  set responseType(t) { this._rt = t }
  get responseType() { return this._rt || '' }
  setRequestHeader() {} overrideMimeType() {} abort() {}
  getAllResponseHeaders() { return '' }
  getResponseHeader() { return null }
  send() {
    let bytes = null
    const rest = restStub(this.url)
    if (rest !== null) { bytes = Buffer.from(rest, 'utf8'); this.status = 200 }
    else {
      const p = ROOT + this.url
      if (this.url.startsWith('http') || !existsSync(p)) { this.status = 404 }
      else { bytes = readFileSync(p); this.status = 200 }
    }
    if (bytes) {
      this.responseText = bytes.toString('latin1')
      this.response = this._rt === 'arraybuffer'
        ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
        : this.responseText
    } else {
      this.responseText = ''
      this.response = this._rt === 'arraybuffer' ? new ArrayBuffer(0) : ''
    }
    this.readyState = 4
    const fire = () => { this.onreadystatechange?.(); this.onload?.(); this.onloadend?.() }
    this.async ? setTimeout(fire, 0) : fire()
  }
}
globalThis.fetch = () => Promise.reject(new Error('offline'))

/**
 * Stands in for the REST backend on :9090. The room endpoints are the ones
 * that matter — without a spawn room the client refuses to join, by its own
 * design.
 */
const LOBBY = {
  roomId: 'lobby', roomName: 'Futura Lobby', ownerUsername: 'system',
  roomType: 'PUBLIC', description: 'The starting room', maxPlayers: 50,
  currentPlayerCount: 1, width: 12, height: 12,
  freePlacement: false, hideWalls: false, hideFloor: false,
  tileMap: Array.from({ length: 12 }, () => Array(12).fill(0)),
  owners: ['system'],
}
function restStub(url) {
  if (!url.includes('9090')) return null
  // Order matters: /api/rooms/lobby/enter must not be mistaken for a room fetch
  if (url.includes('/enter'))             return JSON.stringify({ success: true, message: 'ok' })
  if (url.includes('/leave'))             return JSON.stringify({ success: true, message: 'ok' })
  if (url.includes('/api/system/default-lobby')) return JSON.stringify({ roomId: 'lobby' })
  if (url.includes('/api/rooms/public'))  return JSON.stringify([LOBBY])
  if (url.includes('/api/rooms/my'))      return JSON.stringify([])
  if (url.includes('/furniture'))         return JSON.stringify([])
  if (url.includes('/inventory'))         return JSON.stringify([])
  if (url.includes('/api/friends'))       return JSON.stringify([])
  if (url.includes('/api/rooms/lobby'))   return JSON.stringify(LOBBY)
  return JSON.stringify({ success: true, message: 'stub' })
}

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

writeFileSync(OUT + 'futura-loop.png', dom.canvas.toBuffer('image/png'))

console.log('java log:')
for (const l of logs) console.log('   ' + l)
console.log('\nwire traffic (' + wire.length + ' lines):')
for (const w of wire.slice(0, 20)) console.log('   ' + w)
console.log('\ncanvas ops: ' + Object.values(dom.counts).reduce((a, b) => a + b, 0))
process.exit(0)
