/** Concurrency shims: executors, futures, SwingUtilities. */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { installDom, reportAndExit } from './dom-stub.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const dom = installDom()
require(join(here, '..', 'web', 'proof.js')).main([])
await dom.settle(120)

reportAndExit('concurrency shims', dom.results,
  /executor|submit|shutdown|execute|schedule|fixed-rate|thenApply|whenComplete|completeException|exceptionally|join\(\)|invokeLater|EventDispatch|invokeAndWait|supplyAsync|FIFO/)
