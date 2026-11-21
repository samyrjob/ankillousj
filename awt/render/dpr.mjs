import { PROOF_JS, OUT } from './paths.mjs'
import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

for (const dpr of [1, 2]) {
  const c = createCanvas(420 * dpr, 140 * dpr)
  const ctx = c.getContext('2d')
  ctx.scale(dpr, dpr)                 // Java keeps drawing in CSS pixels
  globalThis.__ankCtx = ctx
  globalThis.__ankLog = () => {}
  delete require.cache[require.resolve(PROOF_JS)]
  const mod = require(PROOF_JS)
  mod.main([])
  writeFileSync(OUT + `dpr${dpr}.png`, c.toBuffer('image/png'))
  console.log(`dpr=${dpr} -> ${c.width}x${c.height}`)
}
