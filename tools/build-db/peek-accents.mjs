import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const ls = readFileSync(join(__dirname, 'cache', 'accents.txt'), 'utf8').split('\n')
for (const t of ['ありがとう', 'する', 'きれい', 'たべる', 'ください']) {
  const hits = ls.filter((l) => l.includes(t)).slice(0, 3)
  console.log(`[${t}]`)
  for (const h of hits) console.log('  ' + JSON.stringify(h.split('\t')))
  if (hits.length == 0) console.log('  （无）')
}
