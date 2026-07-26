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
  delete require.cache[require.resolve('/home/claude/proof/target/js/proof.js')]
  const mod = require('/home/claude/proof/target/js/proof.js')
  mod.main([])
  writeFileSync(`/home/claude/render/dpr${dpr}.png`, c.toBuffer('image/png'))
  console.log(`dpr=${dpr} -> ${c.width}x${c.height}`)
}
