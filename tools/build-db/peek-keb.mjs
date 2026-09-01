/**
 * 统计「多表记且存在 keb==reb」的词条（假名优先规则的影响面）：node peek-keb.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const xml = gunzipSync(readFileSync(join(__dirname, 'cache', 'JMdict_e.gz'))).toString('utf-8')

const entryRe = /<entry>([\s\S]*?)<\/entry>/g
let m
const affected = []
while ((m = entryRe.exec(xml)) !== null) {
  const body = m[1]
  const kebs = [...body.matchAll(/<keb>([^<]+)<\/keb>/g)].map((x) => x[1])
  if (kebs.length < 2) continue
  const rebs = [...body.matchAll(/<reb>([^<]+)<\/reb>/g)].map((x) => x[1])
  if (rebs.length == 0) continue
  const reb = rebs[0]
  const kanaKebs = kebs.filter((k) => k == reb)
  if (kanaKebs.length == 0) continue
  const pris = [...body.matchAll(/<(?:ke|re)_pri>([^<]+)<\/(?:ke|re)_pri>/g)].map((x) => x[1])
  const isCommon = pris.some((p) => /(ichi1|news1|spec1|gai1|nf0[1-9]|nf1[0-9]|nf2[0-4])/.test(p))
  if (!isCommon) continue
  affected.push({ first: kebs[0], kana: kanaKebs[0], all: kebs.join('/') })
}

console.log(`常用词中受影响词条：${affected.length}`)
for (const a of affected.slice(0, 40)) {
  console.log(`  首表记 ${a.first.padEnd(8)} → 假名形 ${a.kana.padEnd(8)}（全部：${a.all}）`)
}
