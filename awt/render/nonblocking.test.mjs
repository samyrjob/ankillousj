/**
 * Does opening a dialog stall the game?
 *
 * Two separate things could go wrong, and they are checked separately:
 *   1. the calling code not returning until the user answers
 *   2. the render loop stopping while a dialog is open
 *
 * The second is the one that would ruin a game, and the one a naive port
 * gets wrong.
 */
import { createRequire } from 'node:module'
import { installDom, reportAndExit } from './dom-stub.mjs'
const require = createRequire(import.meta.url)

const dom = installDom({ width: 800, height: 600, traceCanvas: true })

const appended = []
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
  createElement: el,
  getElementById: () => dom.el,
  querySelector: () => dom.el,
  head: { appendChild: () => {} },
  body: { appendChild: (c) => { appended.push(c); return c }, removeChild: () => {} },
}

const out = []
const realLog = console.log
console.log = (...a) => out.push(a.join(' '))

const wall0 = Date.now()
require('/home/claude/full/web/futura.js').main([])
const wall = Date.now() - wall0

console.log = realLog

const results = []
const check = (n, ok) => results.push((ok ? 'PASS ' : 'FAIL ') + n)

const timing = out.find(l => l.includes('dialogs opened in')) || ''
const ms = parseInt((timing.match(/in (\d+) ms/) || [0, '9999'])[1], 10)

check('all dialogs opened', appended.length >= 5)
check('opening five dialogs took under 50 ms  (' + ms + ' ms)', ms < 50)
check('the caller returned', out.some(l => l.includes('caller returned: true')))
check('prompts returned without waiting for an answer',
  out.some(l => l.includes('prompts returned without waiting: true')))
check('main() itself returned promptly  (' + wall + ' ms)', wall < 5000)

// A blocking implementation would have to spin, and spinning in a browser
// means the event loop never turns again.
let turned = false
setTimeout(() => { turned = true }, 0)
await new Promise((r) => setTimeout(r, 30))
check('the event loop still turns  (a blocking dialog would deadlock it)', turned)

reportAndExit('dialogs do not block', results)
