/**
 * Where the harness scripts find what they run and where they write.
 *
 * Every path can be given by the environment; the defaults are the places the
 * builds of this repository write to, so a plain `node futura.smoke.mjs` works
 * after `toolchain/build.sh <src>`.
 *
 *   ANK_WEB     the folder holding the compiled game (futura.js, assets/)
 *   ANK_PROOF   the compiled AWT proof (awt: mvn process-classes)
 *   ANK_OUT     where pictures are written
 */
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '..', '..')

const slash = (p) => (p.endsWith('/') || p.endsWith('\\') ? p : p + '/')

/** The compiled game's folder, with a trailing slash. */
export const WEB = slash(process.env.ANK_WEB || join(repo, 'toolchain', 'build', 'web'))

/** The compiled AWT proof, as Maven leaves it and as copied beside its page. */
export const PROOF_JS = process.env.ANK_PROOF || join(repo, 'awt', 'target', 'js', 'proof.js')
export const PROOF_WEB_JS = process.env.ANK_PROOF || join(repo, 'awt', 'web', 'proof.js')

/** Where pictures go, with a trailing slash. Made on first use. */
export const OUT = slash(process.env.ANK_OUT || join(here, 'out'))
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })
