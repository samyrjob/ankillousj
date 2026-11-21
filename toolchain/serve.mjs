#!/usr/bin/env node
/**
 * Serves a compiled game on this computer, to try it in a browser.
 *
 *   node serve.mjs [folder] [port]
 *
 * folder   what build.sh wrote: build/web by default
 * port     8080 by default
 *
 * A file server and nothing else: no upload, no listing, and only this
 * computer can reach it (it listens on 127.0.0.1). Nothing is cached, so a
 * rebuild shows on the next reload.
 *
 * Why not `npx serve`: it works, on port 3000. A backend that only answers
 * the pages it knows (CORS) knows a port, and 8080 is the usual one to allow
 * for local work.
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(process.argv[2] || join(here, 'build', 'web'))
const port = Number(process.argv[3] || 8080)

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8', '.wasm': 'application/wasm',
}

if (!existsSync(root)) {
  console.error(`no such folder: ${root}\nBuild first: ./build.sh <your sources>`)
  process.exit(1)
}

createServer((req, res) => {
  let path
  try {
    path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  } catch {
    res.writeHead(400).end('bad address')
    return
  }
  // Inside the served folder, whatever the address says.
  const file = normalize(join(root, path))
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end('outside the served folder')
    return
  }
  let target = file
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html')
  if (!existsSync(target) || !statSync(target).isFile()) {
    // config.js is optional: an empty script, not an error in the console.
    if (path === '/config.js') {
      res.writeHead(200, { 'Content-Type': TYPES['.js'], 'Cache-Control': 'no-store' }).end('')
      return
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('not found')
    return
  }
  res.writeHead(200, {
    'Content-Type': TYPES[extname(target).toLowerCase()] || 'application/octet-stream',
    'Content-Length': statSync(target).size,
    'Cache-Control': 'no-store',
  })
  if (req.method === 'HEAD') { res.end(); return }
  createReadStream(target).pipe(res)
}).listen(port, '127.0.0.1', () => {
  console.log(`serving ${root}`)
  console.log(`open  http://localhost:${port}/`)
})
