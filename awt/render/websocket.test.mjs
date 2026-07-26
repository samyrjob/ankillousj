/** WebSocket shim, driven through a stub browser socket. */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { installDom, reportAndExit } from './dom-stub.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const dom = installDom()
require(join(here, '..', 'web', 'proof.js')).main([])
await dom.settle(60)

const check = (n, ok) => dom.results.push((ok ? 'PASS ' : 'FAIL ') + n)
const ws = dom.sockets[0]

check('a browser WebSocket was constructed', !!ws)
check('header moved into the query string', ws.url.includes('X-Game-Version=1.4.2'))
check('original path preserved', ws.url.startsWith('wss://example.test/socket?'))

// the stub throws on send-before-open, so the shim's queueing is load-bearing
let threw = false
try { ws.send('probe') } catch { threw = true }
check('stub rejects send before open', threw)

ws._open()
await dom.settle(20)
check('queued send reached the socket after open', ws.sent.includes('hello'))

ws._message('ping')
await dom.settle(20)
check('sendClose closed with the given code',
  ws.closed && ws.closed.code === 1000 && ws.closed.reason === 'bye')

reportAndExit('websocket shim', dom.results,
  /WebSocket|header|path preserved|send before open|queued send|sendClose|onText|buildAsync|future|isInputClosed|isOutputClosed/)
