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

// The browser permits exactly three channels. Each socket below was opened
// with a different one; check the value actually travels.
const [sQuery, sProto, sFirst, sBoth] = dom.sockets

check('QUERY: value is in the URL', sQuery.url.includes('X-Game-Version=1.4.2'))
check('QUERY: nothing offered as a subprotocol', sProto && sQuery.protocols.length === 0)

check('SUBPROTOCOL: offered on the handshake',
  sProto && sProto.protocols.some((p) => p.includes('X-Game-Version')))
check('SUBPROTOCOL: URL left clean', sProto && !sProto.url.includes('X-Game-Version'))

check('FIRST_MESSAGE: URL left clean', sFirst && !sFirst.url.includes('X-Game-Version'))
sFirst._open()
await dom.settle(20)
check('FIRST_MESSAGE: sent as JSON once open',
  sFirst.sent.some((m) => m.includes('"X-Game-Version":"1.4.2"')))

check('QUERY_AND_FIRST_MESSAGE: in the URL', sBoth && sBoth.url.includes('X-Game-Version=1.4.2'))
sBoth._open()
await dom.settle(20)
check('QUERY_AND_FIRST_MESSAGE: also sent as JSON',
  sBoth.sent.some((m) => m.includes('"X-Game-Version"')))

reportAndExit('websocket shim', dom.results,
  /WebSocket|header|path preserved|send before open|queued send|sendClose|onText|buildAsync|future|isInputClosed|isOutputClosed|QUERY|SUBPROTOCOL|FIRST_MESSAGE/)
