/**
 * Generates stand-in assets at the paths the game asks for.
 *
 * The real art is not in the source drop, so these are simple coloured tiles
 * and glyphs at the right names and sizes. They exist to prove the loading
 * path works end to end and to produce a real frame — swapping in the actual
 * art changes nothing but the pixels.
 */
import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const BASE = '/home/claude/full/web/assets'

function tile(path, top, bottom, label) {
  const c = createCanvas(96, 48)
  const g = c.getContext('2d')
  // an isometric diamond, which is the shape the renderer expects
  const grad = g.createLinearGradient(0, 0, 0, 48)
  grad.addColorStop(0, top); grad.addColorStop(1, bottom)
  g.fillStyle = grad
  g.beginPath(); g.moveTo(48, 0); g.lineTo(96, 24); g.lineTo(48, 48); g.lineTo(0, 24); g.closePath(); g.fill()
  g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1; g.stroke()
  if (label) { g.fillStyle = 'rgba(255,255,255,0.5)'; g.font = '9px sans-serif'; g.textAlign = 'center'
               g.fillText(label, 48, 28) }
  write(path, c)
}

function square(path, size, color, glyph) {
  const c = createCanvas(size, size)
  const g = c.getContext('2d')
  g.fillStyle = color
  g.beginPath(); g.roundRect(1, 1, size - 2, size - 2, 4); g.fill()
  if (glyph) { g.fillStyle = '#0d0e1c'; g.font = `bold ${Math.round(size * 0.55)}px sans-serif`
               g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(glyph, size / 2, size / 2 + 1) }
  write(path, c)
}

function write(path, canvas) {
  const full = BASE + path
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, canvas.toBuffer('image/png'))
}

tile('/res/tile/wooden_floor_tile.png', '#8a5a2b', '#5c3a1a')
tile('/res/tile/grass00.png', '#4a7c3f', '#2f5228')
square('/res/icons/chat_icon.png', 32, '#e6c878', '\u2709')
square('/res/icons/chat_badge.png', 16, '#f5a623', '!')
square('/res/icons/app_icon.png', 64, '#6366f1', 'F')
square('/res/object/GoldenCred.png', 32, '#f5a623', '$')

// avatar sprites: the renderer builds these as look/<id>/sprite-<dir>.png
const dirs = ['front', 'back', 'left', 'right', 'isoxleft', 'isoxright']
const frames = ['', '-mov-1', '-mov-2']
for (const d of dirs) {
  for (const f of frames) {
    const c = createCanvas(32, 64)
    const g = c.getContext('2d')
    g.fillStyle = '#f5a623'
    g.beginPath(); g.ellipse(16, 14, 9, 10, 0, 0, Math.PI * 2); g.fill()
    g.fillStyle = '#6366f1'
    g.beginPath(); g.roundRect(6, 24, 20, 30, 6); g.fill()
    g.fillStyle = 'rgba(255,255,255,0.6)'; g.font = '7px sans-serif'; g.textAlign = 'center'
    g.fillText(d.slice(0, 4), 16, 62)
    write(`/res/looks/1/sprite-${d}${f}.png`, c)
    write(`/res/sprites/1/sprite-${d}${f}.png`, c)
  }
}
console.log('assets generated')
