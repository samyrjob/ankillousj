/** Opens every dialog and checks what actually reaches the page. */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { installDom, reportAndExit } from './dom-stub.mjs'
const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))

const dom = installDom({ width: 800, height: 600 })

// A DOM that records structure, so "did a dialog appear" is answerable.
const appended = []
const styles = []
function el(tag) {
  return {
    tagName: tag.toUpperCase(), className: '', textContent: '', innerHTML: '',
    style: {}, value: '', _l: {},
    appendChild(c) { return c }, removeChild() {},
    addEventListener(t, f) { (this._l[t] ||= []).push(f) },
    setAttribute() {}, hasAttribute: () => false, focus() {},
    querySelector: () => el('div'), querySelectorAll: () => [],
  }
}
globalThis.location = { search: '?uidemo' }
globalThis.document = {
  createElement: (t) => el(t),
  getElementById: () => dom.el,
  querySelector: () => dom.el,
  head: { appendChild: (c) => styles.push(c) },
  body: {
    appendChild: (c) => { appended.push(c); return c },
    removeChild: (c) => { const i = appended.indexOf(c); if (i >= 0) appended.splice(i, 1) },
  },
}

const out = []
const realLog = console.log
console.log = (...a) => out.push(a.join(' '))
require('/home/claude/full/web/futura.js').main([])
console.log = realLog

const results = []
const check = (n, ok) => results.push((ok ? 'PASS ' : 'FAIL ') + n)
const html = appended.map(a => a.innerHTML || '').join('\n')

check('a stylesheet was injected once', styles.length === 1)
// at least the five from UiProof; NonBlockingProof opens more in the same run
check('every dialog reached the page  (' + appended.length + ')', appended.length >= 5)
check('error dialog rendered its message', html.includes('Could not reach the server'))
check('choice dialog listed its options', html.includes('>20<') && html.includes('>50<'))
check('room form has a name field', html.includes('data-name'))
check('room form listed the templates', html.includes('Ballroom') && html.includes('15'))
check('loading dialog has a progress bar', html.includes('data-bar'))
check('frozen overlay offered a resume button', html.includes('data-resume'))
check('markup is escaped, not raw', !html.includes('<script'))

reportAndExit('html dialogs', results)
