/**
 * base.db 数据检查脚本（开发机运行）：node inspect.mjs
 * 打印规模、字段覆盖率、分布与样本，用于评估词库质量
 */
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(join(__dirname, 'base.db'), { readOnly: true })

const q = (sql) => db.prepare(sql).all()
const n = (sql) => db.prepare(sql).get().n

console.log('========== 一、规模 ==========')
console.log(`词条总数        ${n('SELECT COUNT(*) n FROM word')}`)
console.log(`系统关联总数    ${n('SELECT COUNT(*) n FROM word_relation')}`)
console.log(`  近义 synonym  ${n(`SELECT COUNT(*) n FROM word_relation WHERE relation_type='synonym'`)}`)
console.log(`  反义 antonym  ${n(`SELECT COUNT(*) n FROM word_relation WHERE relation_type='antonym'`)}`)

console.log('\n========== 二、字段覆盖率 ==========')
const total = n('SELECT COUNT(*) n FROM word')
const pct = (x) => `${x} (${(x * 100 / total).toFixed(1)}%)`
console.log(`有音调          ${pct(n(`SELECT COUNT(*) n FROM word WHERE accent IS NOT NULL AND accent != ''`))}`)
console.log(`有多音调        ${pct(n(`SELECT COUNT(*) n FROM word WHERE accent LIKE '%,%'`))}`)
console.log(`有罗马音        ${pct(n(`SELECT COUNT(*) n FROM word WHERE romaji != ''`))}`)
console.log(`释义为空        ${pct(n(`SELECT COUNT(*) n FROM word WHERE meaning = ''`))}`)
console.log(`释义含 CJK 汉字(疑似中文) ${pct(n(`SELECT COUNT(*) n FROM word WHERE meaning GLOB '*[一-龥]*'`))}`)
console.log(`表记为纯假名    ${pct(n(`SELECT COUNT(*) n FROM word WHERE term GLOB '*[ぁ-ヺ]*' AND term NOT GLOB '*[一-龥]*'`))}`)

console.log('\n========== 三、词性分布 ==========')
for (const r of q('SELECT pos, COUNT(*) c FROM word GROUP BY pos ORDER BY c DESC')) {
  console.log(`  ${r.pos.padEnd(10)} ${r.c}`)
}

console.log('\n========== 四、动词类型分布 ==========')
for (const r of q(`SELECT verb_type, COUNT(*) c FROM word WHERE verb_type != '' GROUP BY verb_type ORDER BY c DESC`)) {
  console.log(`  ${r.verb_type.padEnd(8)} ${r.c}`)
}

console.log('\n========== 五、样本词条（按 id 顺序前 12 条） ==========')
for (const r of q('SELECT id, term, reading, romaji, accent, pos, verb_type, substr(meaning,1,60) meaning FROM word ORDER BY id LIMIT 12')) {
  console.log(`  #${r.id} ${r.term}｜${r.reading}｜${r.romaji}｜音调[${r.accent || '无'}]｜${r.pos}｜${r.verb_type || '-'}｜${r.meaning}`)
}

console.log('\n========== 六、样本词条（随机 12 条） ==========')
for (const r of q('SELECT id, term, reading, romaji, accent, pos, verb_type, substr(meaning,1,60) meaning FROM word ORDER BY RANDOM() LIMIT 12')) {
  console.log(`  #${r.id} ${r.term}｜${r.reading}｜${r.romaji}｜音调[${r.accent || '无'}]｜${r.pos}｜${r.verb_type || '-'}｜${r.meaning}`)
}

console.log('\n========== 七、带多音调的样本 5 条 ==========')
for (const r of q(`SELECT term, reading, accent FROM word WHERE accent LIKE '%,%' LIMIT 5`)) {
  console.log(`  ${r.term}｜${r.reading}｜音调[${r.accent}]`)
}

console.log('\n========== 八、系统关联样本（近义 6 / 反义 4） ==========')
const relSql = `
  SELECT r.relation_type, a.term a_t, a.reading a_r, b.term b_t, b.reading b_r
  FROM word_relation r JOIN word a ON a.id = r.from_word_id JOIN word b ON b.id = r.to_word_id
  WHERE r.relation_type = ? LIMIT ?`
for (const r of db.prepare(relSql).all('synonym', 6)) {
  console.log(`  [近义] ${r.a_t}（${r.a_r}） ↔ ${r.b_t}（${r.b_r}）`)
}
for (const r of db.prepare(relSql).all('antonym', 4)) {
  console.log(`  [反义] ${r.a_t}（${r.a_r}） ↔ ${r.b_t}（${r.b_r}）`)
}

console.log('\n========== 九、释义样本（最长 3 条） ==========')
for (const r of q('SELECT term, meaning FROM word ORDER BY LENGTH(meaning) DESC LIMIT 3')) {
  console.log(`  ${r.term}：${r.meaning.slice(0, 100)}${r.meaning.length > 100 ? '…' : ''}`)
}

db.close()
