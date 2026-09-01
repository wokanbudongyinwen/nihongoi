/**
 * 查看 tomoshi zh_defs 真实样例（多义项词条）：node peek-zh.mjs
 */
import { DatabaseSync } from 'node:sqlite'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(join(__dirname, 'cache', 'tomoshi.db'), { readOnly: true })

// 先按表记找 entry_id，再看其 zh_defs 全文
for (const term of ['食べる', '行く', 'する', '明るい', 'あの人', '先生', ' inaugurated']) {
  const rows = db.prepare(
    `SELECT f.entry_id, f.text FROM forms f WHERE f.text = ? AND f.is_kana = 0 LIMIT 3`
  ).all(term)
  if (rows.length == 0) {
    console.log(`[${term}] forms 未命中`)
    continue
  }
  for (const r of rows.slice(0, 1)) {
    console.log(`\n===== ${term}（entry ${r.entry_id}）=====`)
    const zh = db.prepare(`SELECT data FROM zh_defs WHERE entry_id = ?`).get(r.entry_id)
    if (zh == null) {
      console.log('  无中文释义')
      continue
    }
    const d = JSON.parse(zh.data)
    const keys = Object.keys(d.senses ?? {})
    for (const k of keys) {
      const g = (d.senses[k].glosses ?? []).map((x) => x.text).join('；')
      console.log(`  义项${k}: ${g}`)
    }
  }
}

// 统计：zh_defs 里多义项词条占比、gloss 平均长度
let multi = 0
let lens = []
for (const r of db.prepare('SELECT data FROM zh_defs LIMIT 5000').all()) {
  const d = JSON.parse(r.data)
  const keys = Object.keys(d.senses ?? {})
  if (keys.length > 1) multi++
  const txt = keys.map((k) => (d.senses[k].glosses ?? []).map((x) => x.text).join('；')).join('／')
  lens.push(txt.length)
}
lens.sort((a, b) => a - b)
console.log(`\n统计（5000 条采样）：多义项 ${multi}；释义长度 p50=${lens[2500]} p90=${lens[4500]} max=${lens[4999]}`)

db.close()
