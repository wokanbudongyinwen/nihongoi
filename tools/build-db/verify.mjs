/**
 * base.db 词库验证脚本：node verify.mjs
 * 检查字段格式合规性、关联完整度、常见词全字段抽查
 */
import { DatabaseSync } from 'node:sqlite'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(join(__dirname, 'base.db'), { readOnly: true })
const q = (sql) => db.prepare(sql).all()
const n = (sql) => db.prepare(sql).get().n

console.log('========== 一、字段格式合规性 ==========')
// 音调：应为纯数字逗号分隔（或空）
const badAccent = q(`SELECT id, term, accent FROM word WHERE accent != '' AND accent GLOB '*[^0-9,]*' LIMIT 5`)
console.log(`音调格式非法（非 数字,数字 型）：${n(`SELECT COUNT(*) n FROM word WHERE accent != '' AND accent GLOB '*[^0-9,]*'`)} 条`)
for (const r of badAccent) console.log(`  #${r.id} ${r.term} accent=[${r.accent}]`)
// 音调越界（>20 的带圈符号显示不了）
console.log(`音调值 >20（App 端回退显示原数字）：${n(`SELECT COUNT(*) n FROM word WHERE accent GLOB '*2[1-9]' OR accent GLOB '*[3-9][0-9]'`)} 条`)
// 词性枚举
console.log(`\npos 枚举值：`)
for (const r of q('SELECT pos, COUNT(*) c FROM word GROUP BY pos ORDER BY c DESC')) console.log(`  ${r.pos.padEnd(8)} ${r.c}`)
// verb_type 枚举
console.log(`\nverb_type 枚举值：${q(`SELECT DISTINCT verb_type FROM word WHERE verb_type != ''`).map((r) => r.verb_type).join(' / ')}`)
// extra_json 合法性 + 内容分布
let badJson = 0
let withJlpt = 0
let withFreq = 0
for (const r of q('SELECT extra_json FROM word')) {
  try {
    const o = JSON.parse(r.extra_json)
    if (o.jlpt) withJlpt++
    if (o.freq != null) withFreq++
  } catch { badJson++ }
}
console.log(`extra_json：非法 ${badJson} 条｜带 jlpt ${withJlpt}｜带 freq ${withFreq}`)

console.log('\n========== 二、动词活用派生前提（verb_type 覆盖） ==========')
const verbs = n(`SELECT COUNT(*) n FROM word WHERE pos GLOB '动词*'`)
const verbsTyped = n(`SELECT COUNT(*) n FROM word WHERE pos GLOB '动词*' AND verb_type != ''`)
console.log(`动词共 ${verbs}，带 verb_type（可派生 9 形态）${verbsTyped}（${(verbsTyped * 100 / verbs).toFixed(1)}%）`)
console.log(`无 verb_type 的动词（活用表格不显示）样本：`)
for (const r of q(`SELECT term, reading, pos, meaning FROM word WHERE pos GLOB '动词*' AND verb_type = '' ORDER BY RANDOM() LIMIT 6`)) {
  console.log(`  ${r.term}（${r.reading}）${r.pos}｜${r.meaning.slice(0, 20)}`)
}

console.log('\n========== 三、关联完整度 ==========')
for (const t of ['synonym', 'antonym', 'trans_intrans', 'custom']) {
  console.log(`${t.padEnd(14)} ${n(`SELECT COUNT(*) n FROM word_relation WHERE relation_type='${t}'`)}`)
}
console.log(`自他动词对样本（验证配对正确性）：`)
const pairSql = `
  SELECT a.term a_t, a.reading a_r, b.term b_t, b.reading b_r
  FROM word_relation r
  JOIN word a ON a.id = r.from_word_id
  JOIN word b ON b.id = r.to_word_id
  WHERE r.relation_type = 'trans_intrans' LIMIT 8`
for (const r of q(pairSql)) {
  console.log(`  [他]${r.a_t}（${r.a_r}） ↔ [自]${r.b_t}（${r.b_r}）`)
}
// 悬空关联（对端不存在）
console.log(`悬空关联（对端缺失）：${n(`SELECT COUNT(*) n FROM word_relation r WHERE (SELECT COUNT(*) FROM word a WHERE a.id=r.from_word_id)=0 OR (SELECT COUNT(*) FROM word b WHERE b.id=r.to_word_id)=0`)} 条`)

console.log('\n========== 四、常见词全字段抽查 ==========')
for (const t of ['食べる', '行く', 'する', '来る', '今日', '先生', '明るい', '綺麗', '上']) {
  const r = db.prepare('SELECT id, term, reading, romaji, accent, pos, verb_type, extra_json, meaning FROM word WHERE term = ? ORDER BY id LIMIT 1').get(t)
  if (r == null) {
    console.log(`[${t}] 不在库中`)
    continue
  }
  console.log(`[${r.term}] id=${r.id}`)
  console.log(`  读音 ${r.reading}｜罗马音 ${r.romaji}｜音调 [${r.accent || '无'}]｜${r.pos}｜${r.verb_type || '-'}｜extra ${r.extra_json}`)
  console.log(`  释义 ${r.meaning}`)
}

db.close()
