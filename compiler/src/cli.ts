#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'
import { compileClass } from './compiler/compile.js'

function main(argv: string[]): number {
  const args = argv.slice(2)
  if (args.length === 0) {
    console.error('usage: ankillousj <Input.class> [-o output.wasm]')
    return 1
  }

  const input = args[0]
  const oIdx = args.indexOf('-o')
  const output = oIdx >= 0 ? args[oIdx + 1] : input.replace(/\.class$/, '.wasm')

  const data = new Uint8Array(readFileSync(input))
  const result = compileClass(data)

  writeFileSync(output, result.wasm)

  console.log(`class    ${result.className}`)
  console.log(`output   ${output} (${result.wasm.length} bytes)`)
  console.log(`compiled ${result.compiled.length} method(s)`)
  for (const m of result.compiled) console.log(`  \u2713 ${m}`)
  if (result.skipped.length > 0) {
    console.log(`skipped  ${result.skipped.length} method(s)`)
    for (const s of result.skipped) console.log(`  \u2717 ${s.method}: ${s.reason}`)
  }
  return 0
}

process.exit(main(process.argv))
