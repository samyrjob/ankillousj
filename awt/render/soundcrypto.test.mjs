/** Audio and crypto shims. */
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
const a = dom.audios[0]
check('an Audio element was created', !!a)
check('the URL reached the element', a && a.src === '/res/sound/theme.mp3')
check('loop(LOOP_CONTINUOUSLY) set loop on the element', a && a.loopHistory.includes(true))
check('close() cleared loop again', a && a.loop === false)
check('close() paused the element', a && a.paused === true)

reportAndExit('sound + crypto shims', dom.results,
  /clip|gain|dB|silence|unity|rewind|MASTER_GAIN|stream overload|Signature|KeyFactory|payload|header|claim|expired|malformed|null token|Audio element|URL reached|loop\(|close\(\)/)
