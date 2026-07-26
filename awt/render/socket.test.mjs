/**
 * The game's own Socket/BufferedReader/PrintWriter pattern, running against a
 * stub WebSocket. If this passes, NetworkManager and ServerMessageWatcher need
 * no changes at all.
 */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { installDom, reportAndExit } from './dom-stub.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const dom = installDom()
const mod = require(join(here, '..', 'web', 'proof.js'))
mod.main([])
await dom.settle(40)

const check = (n, ok) => dom.results.push((ok ? 'PASS ' : 'FAIL ') + n)

// The socket the game opened, as opposed to the ones the WebSocket shim opened
const gameSock = dom.sockets.find((s) => s.url.includes('5556'))
check('Socket("localhost", 5556) dialled ws://localhost:5556',
  gameSock && gameSock.url === 'ws://localhost:5556')

// Nothing should have been sent yet: the socket has not opened
check('nothing sent before the socket opens', gameSock && gameSock.sent.length === 0)

gameSock._open()
await dom.settle(40)

// PrintWriter.println should now have produced one message per line
check('println("join Player7") became one message',
  gameSock.sent.includes('join Player7'))
check('println("move ...") became one message',
  gameSock.sent.includes('move 3 4 down true'))
check('utf-8 line sent intact',
  gameSock.sent.some((m) => m === 'chat café 你好'))
check('one message per line, not one per byte', gameSock.sent.length === 3)

// Now reply, and see whether the blocking readLine() loop wakes up
gameSock._message('welcome')
await dom.settle(20)
gameSock._message('echo:join Player7')
await dom.settle(20)
gameSock._message('echo:chat café 你好')
await dom.settle(20)

// the Java side schedules its own assertions once the reader has resumed
await dom.settle(250)

// Closing must wake the parked reader with end-of-stream rather than leaving
// it suspended forever — that is the failure mode that would matter live.
gameSock.close(1000, 'bye')
await dom.settle(120)

reportAndExit('java.net.Socket over WebSocket', dom.results,
  /Socket|streams|println|nothing sent|one message|utf-8|readLine|greeting|second line|in order|stream ended|received:/)
