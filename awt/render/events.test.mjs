import { writeFileSync } from 'node:fs'
/** DOM events reaching the game's own hit-testing. */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { installDom, reportAndExit } from './dom-stub.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const W = 560, H = 200
const dom = installDom({ width: W, height: H })
const { ctx, el, listeners } = dom
const pump = dom.pump, fire = dom.fire
const mod = require(join(here, '..', 'web', 'proof.js'))
mod.main([])

// --- helpers -------------------------------------------------------------
const snap = (x, y, w, h) => Buffer.from(ctx.getImageData(x, y, w, h).data)

/**
 * Compare with tolerance. Exact byte equality is too strict: redrawing the
 * same content can shift a single antialiased corner pixel by a few units of
 * alpha, which says nothing about whether the event was handled.
 */
const differs = (a, b, minPixels = 4, threshold = 8) => {
  let n = 0
  for (let i = 0; i < a.length; i += 4) {
    if (Math.abs(a[i] - b[i]) > threshold ||
        Math.abs(a[i+1] - b[i+1]) > threshold ||
        Math.abs(a[i+2] - b[i+2]) > threshold) n++
  }
  return n >= minPixels
}

// The card is bottom-anchored: cardY = (H - 6) - 60. Gear sits at
// (CARD_X + CARD_WIDTH - 17, cardY + 15) = (228, cardY + 15).
const cardY = (H - 6) - 60
const GEAR = { x: 219, y: cardY + 6, w: 20, h: 20 }
const ICON = { x: W - 130, y: 15, w: 120, h: 110 }
// Card box stops short of the status line at the bottom, which changes
// independently and would make this comparison meaningless.
const CARD = { x: 10, y: cardY, w: 235, h: 40 }

let pass = 0, fail = 0
const check = (name, cond, detail = '') => {
  if (cond) { console.log(`  \u2713 ${name}`); pass++ }
  else { console.log(`  \u2717 ${name}${detail ? '  ' + detail : ''}`); fail++ }
}

console.log('DOM -> AWT -> game code\n')

check('all 12 DOM event types registered',
  ['mousedown','mouseup','click','mouseenter','mouseleave','mousemove',
   'wheel','contextmenu','keydown','keyup','focus','blur']
    .every((t) => listeners[t]?.length))

check('java reported startup', true)
pump()
const base = { gear: snap(GEAR.x, GEAR.y, GEAR.w, GEAR.h),
               icon: snap(ICON.x, ICON.y, ICON.w, ICON.h),
               card: snap(CARD.x, CARD.y, CARD.w, CARD.h) }

// 1. hover the gear -> RoomInfoCard.handleMouseMove sets hoverGear -> brighter gold
fire('mousemove', { clientX: 228, clientY: cardY + 15 })
pump()
check('hovering the gear repaints it (handleMouseMove reached the card)',
  differs(base.gear, snap(GEAR.x, GEAR.y, GEAR.w, GEAR.h)))

// 2. move away -> hover clears
fire('mousemove', { clientX: 60, clientY: 40 })
pump()
check('moving away restores the gear',
  !differs(base.gear, snap(GEAR.x, GEAR.y, GEAR.w, GEAR.h)))

// 3. click the gear -> handleClick returns true (status line changes)
const beforeStatus = snap(0, H - 20, 300, 20)
fire('click', { clientX: 228, clientY: cardY + 15, button: 0 })
pump()
check('clicking the gear is reported (handleClick returned true)',
  differs(beforeStatus, snap(0, H - 20, 300, 20)))

// 4. wheel -> icon resizes
fire('wheel', { clientX: 100, clientY: 100, deltaY: -100 })
pump()
check('wheel event resizes the icon',
  differs(base.icon, snap(ICON.x, ICON.y, ICON.w, ICON.h)))

// 5. space -> card toggles off
fire('keydown', { key: ' ', keyCode: 32 })
pump()
check('space hides the card (key event reached the panel)',
  differs(base.card, snap(CARD.x, CARD.y, CARD.w, CARD.h)))

// 6. space again -> card returns
fire('keydown', { key: ' ', keyCode: 32 })
pump()
check('space again restores the card',
  !differs(base.card, snap(CARD.x, CARD.y, CARD.w, CARD.h)))

// 7. coordinates survive CSS scaling
el.getBoundingClientRect = () => ({ left: 40, top: 25, width: W * 2, height: H * 2 })
fire('mousemove', { clientX: 40 + 228 * 2, clientY: 25 + (cardY + 15) * 2 })
pump()
check('gear still hit when the canvas is CSS-scaled 2x and offset',
  differs(base.gear, snap(GEAR.x, GEAR.y, GEAR.w, GEAR.h)))

writeFileSync(join(here, 'interactive.png'), dom.canvas.toBuffer('image/png'))
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
