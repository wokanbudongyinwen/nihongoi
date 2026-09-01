/**
 * tomoshi-dict-open.db 检查脚本：node inspect-tomoshi.mjs
 * 1) 解压 cache/tomoshi.db.zst → cache/tomoshi.db（Node zlib zstd，实验特性）
 * 2) 打印表清单与关键表（zh_defs / verb_pairs / vocab_jlpt / freq_rank）schema + 样本
 */
import { DatabaseSync } from 'node:sqlite'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ZST = join(__dirname, 'cache', 'tomoshi.db.zst')
const DB = join(__dirname, 'cache', 'tomoshi.db')

if (!existsSync(DB)) {
  console.log('解压 zstd …（570MB，稍候）')
  const compressed = readFileSync(ZST)
  const raw = zlib.zstdDecompressSync(compressed)
  writeFileSync(DB, raw)
  console.log(`解压完成 ${(raw.length / 1024 / 1024).toFixed(1)}MB`)
}

const db = new DatabaseSync(DB, { readOnly: true })

console.log('\n========== 表清单 ==========')
for (const r of db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all()) {
  console.log(`  ${r.name}`)
}

const showTable = (name, limit = 5) => {
  console.log(`\n========== ${name} 结构 ==========`)
  const cols = db.prepare(`PRAGMA table_info(${name})`).all()
  console.log('  ' + cols.map((c) => `${c.name}:${c.type}`).join(' | '))
  const cnt = db.prepare(`SELECT COUNT(*) n FROM ${name}`).get().n
  console.log(`  行数 ${cnt}`)
  console.log(`  样本 ${limit} 条：`)
  for (const r of db.prepare(`SELECT * FROM ${name} LIMIT ${limit}`).all()) {
    const s = JSON.stringify(r)
    console.log('  ' + (s.length > 200 ? s.slice(0, 200) + '…' : s))
  }
}

for (const t of ['zh_defs', 'verb_pairs', 'vocab_jlpt', 'freq_rank', 'entries', 'forms']) {
  try {
    showTable(t)
  } catch (e) {
    console.log(`\n  [${t}] 读取失败: ${e.message}`)
  }
}

db.close()
