/** Boots the game and records every asset it asks for. */
import { createRequire } from 'node:module'
import { installDom } from './dom-stub.mjs'
const require = createRequire(import.meta.url)

const dom = installDom({ width: 1280, height: 720 })
const requested = []
const logs = []
globalThis.__ankLog = (m) => logs.push(m)

globalThis.XMLHttpRequest = class {
  open(method, url) { this.url = url; requested.push('XHR  ' + url) }
  setRequestHeader() {} overrideMimeType() {}
  send() { this.status = 404; this.responseText = '' }
}
globalThis.fetch = (u) => { requested.push('fetch ' + u); return Promise.reject(new Error('offline')) }

// record what Image src values are set
const RealImage = globalThis.Image
globalThis.Image = class extends RealImage {
  set src(v) { requested.push('img  ' + v); super.src = v }
  get src() { return super.src }
}

try { require('/home/claude/full/web/futura.js').main([]) } catch (e) { /* expected */ }
await dom.settle(200)

const uniq = [...new Set(requested)].sort()
console.log(`${uniq.length} distinct assets requested\n`)
for (const r of uniq) console.log('  ' + r)
