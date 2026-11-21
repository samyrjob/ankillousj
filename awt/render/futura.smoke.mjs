/** Boots the compiled game headlessly and reports what happens. */
import { WEB } from './paths.mjs'
import { createRequire } from 'node:module'
import { installDom } from './dom-stub.mjs'
const require = createRequire(import.meta.url)

const dom = installDom({ width: 1280, height: 720 })
const logs = []
globalThis.__ankLog = (m) => logs.push(m)
globalThis.XMLHttpRequest = class {
  open() {} setRequestHeader() {} overrideMimeType() {}
  send() { this.status = 404; this.responseText = '' }
}
globalThis.fetch = () => Promise.reject(new Error('offline'))

let err = null
try {
  require(WEB + 'futura.js').main([])
} catch (e) {
  err = e
}
await dom.settle(200)
dom.pump(5)

console.log('java log:')
for (const l of logs) console.log('   ' + l)
if (err) {
  console.log('\nthrew: ' + (err.stack || err).toString().split('\n').slice(0, 6).join('\n'))
} else {
  console.log('\nno exception')
}
console.log(`\ncanvas ops issued: ${Object.values(dom.counts).reduce((a, b) => a + b, 0)}`)
