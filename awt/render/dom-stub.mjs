/**
 * One DOM stub for every test.
 *
 * These files each grew their own copy, and the moment a new shim touched an
 * API the others didn't stub, three suites broke at once. Shared stub, one
 * place to extend.
 */
import { createCanvas } from '@napi-rs/canvas'

export function installDom({ width = 560, height = 200, traceCanvas = false } = {}) {
  const canvas = createCanvas(width, height)
  const raw = canvas.getContext('2d')

  const counts = {}
  const ctx = traceCanvas
    ? new Proxy(raw, {
        get(t, p) {
          const v = t[p]
          return typeof v === 'function'
            ? (...a) => { counts[p] = (counts[p] || 0) + 1; return v.apply(t, a) }
            : v
        },
        set(t, p, v) { counts['set:' + p] = (counts['set:' + p] || 0) + 1; t[p] = v; return true },
      })
    : raw

  const listeners = {}
  const el = {
    getContext: () => ctx,
    get width() { return canvas.width }, set width(v) { canvas.width = v },
    get height() { return canvas.height }, set height(v) { canvas.height = v },
    style: {},
    hasAttribute: () => true,
    setAttribute: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width, height }),
    addEventListener: (t, f) => { (listeners[t] ||= []).push(f) },
    focus: () => {},
  }

  let rafQueue = []
  globalThis.document = {
    getElementById: (id) => (id === 'c' ? el : null),
    querySelector: () => el,
    createElement: () => el,
  }
  globalThis.window = { devicePixelRatio: 1, addEventListener: () => {} }
  globalThis.requestAnimationFrame = (cb) => { rafQueue.push(cb); return 1 }

  // --- stub browser WebSocket ---
  const sockets = []
  globalThis.WebSocket = class {
    constructor(url) {
      this.url = url; this.readyState = 0; this.sent = []; this.closed = null
      sockets.push(this)
    }
    send(text) {
      if (this.readyState !== 1) throw new Error('InvalidStateError: still CONNECTING')
      this.sent.push(text)
    }
    close(code, reason) {
      this.readyState = 3; this.closed = { code, reason }
      if (this.onclose) this.onclose({ code, reason })
    }
    _open()     { this.readyState = 1; if (this.onopen) this.onopen() }
    _message(d) { if (this.onmessage) this.onmessage({ data: d }) }
  }

  // --- stub Image: decodes only when the test says so ---
  const images = []
  globalThis.Image = class {
    constructor() {
      this.src = ''; this.width = 0; this.height = 0; this.complete = false
      this._listeners = {}
      images.push(this)
    }
    addEventListener(t, f) { (this._listeners[t] ||= []).push(f) }
    _load(w, h) {
      this.width = w; this.height = h; this.complete = true
      ;(this._listeners.load || []).forEach((f) => f())
    }
    _fail() {
      this.complete = true
      ;(this._listeners.error || []).forEach((f) => f())
    }
  }

  // --- stub HTMLAudioElement ---
  const audios = []
  globalThis.Audio = class {
    constructor(url) {
      this.src = url; this.paused = true; this.ended = false
      this.volume = 1; this.currentTime = 0; this.duration = 120
      this._loop = false
      this.loopHistory = []      // close() clears loop, so record every change
      audios.push(this)
    }
    get loop() { return this._loop }
    set loop(v) { this._loop = v; this.loopHistory.push(v) }
    play() { this.paused = false; return Promise.resolve() }
    pause() { this.paused = true }
  }

  const results = []
  globalThis.__ankTest = (m) => results.push(m)
  globalThis.__ankLog = () => {}

  return {
    canvas, ctx, el, listeners, sockets, images, audios, results, counts,
    pump(n = 3) {
      for (let i = 0; i < n; i++) { const q = rafQueue; rafQueue = []; q.forEach((f) => f()) }
    },
    fire(type, props = {}) {
      (listeners[type] || []).forEach((f) => f({
        clientX: 0, clientY: 0, button: 0, detail: 1, deltaY: 0,
        shiftKey: false, ctrlKey: false, altKey: false, metaKey: false,
        key: '', keyCode: 0, preventDefault() {}, ...props,
      }))
    },
    settle: (ms = 40) => new Promise((r) => setTimeout(r, ms)),
  }
}

/** Prints PASS/FAIL lines and exits with the right code. */
export function reportAndExit(title, results, filter = null) {
  console.log(`${title}\n`)
  let pass = 0, fail = 0
  for (const r of results) {
    if (filter && !filter.test(r)) continue
    const ok = r.startsWith('PASS')
    console.log(`  ${ok ? '\u2713' : '\u2717'} ${r.slice(5)}`)
    ok ? pass++ : fail++
  }
  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail === 0 ? 0 : 1)
}
