/**
 * 找 する 相关词条的原始 XML：node peek-suru.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const xml = gunzipSync(readFileSync(join(__dirname, 'cache', 'JMdict_e.gz'))).toString('utf-8')

const entryRe = /<entry>([\s\S]*?)<\/entry>/g
let m
let found = 0
while ((m = entryRe.exec(xml)) !== null) {
  const body = m[1]
  if (!/(<keb>為る<\/keb>|<keb>する<\/keb>|<reb>する<\/reb>)/.test(body)) continue
  found++
  if (found > 3) break
  console.log('====== entry ======')
  // 截断 sense 部分只留头部
  const head = body.replace(/<sense>[\s\S]*<\/sense>/, '<sense>…(略)</sense>')
  console.log(head)
}
console.log(`\n共 ${found} 个匹配`)
