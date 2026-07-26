/** ImageIO shim: the decoding gap, and what happens once pixels arrive. */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { installDom, reportAndExit } from './dom-stub.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const dom = installDom()
require(join(here, '..', 'web', 'proof.js')).main([])
await dom.settle(40)

const check = (n, ok) => dom.results.push((ok ? 'PASS ' : 'FAIL ') + n)

check('an Image element was created per URL', dom.images.length >= 4)
const wall = dom.images.find((i) => i.src.endsWith('/res/tile/wall.png'))
check('resource base was prefixed', wall && wall.src === 'assets/res/tile/wall.png')
const cdn = dom.images.find((i) => i.src.startsWith('https://'))
check('absolute URL left untouched', cdn && cdn.src === 'https://cdn.test/sprite.png')

// settle everything, with one failure — preload must not stall on it
wall._load(64, 32)
dom.images.filter((i) => i !== wall).forEach((i, n) => (n === 0 ? i._fail() : i._load(16, 16)))
await dom.settle(40)

reportAndExit('imageio shim', dom.results,
  /decoding|shares one|bypass|loudly|preload|Image element|resource base|absolute URL|after load/)
