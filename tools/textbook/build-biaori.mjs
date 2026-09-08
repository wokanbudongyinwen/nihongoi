/**
 * build-biaori.mjs —— 标日初级单词表 → App 导入 JSON
 *
 * 数据源：biaori 项目（https://github.com/smartsl/biaori，MIT）
 *   cache/words.json   [[lessonIdx, pos, meaningZh, "reading(term)", [audioTs]], ...]
 *   cache/lessons.json 课文 HTML（取 hidden 课名核对课号）
 * 词库验证：static/assets/base.db（JMdict 辞书形，模拟 App 分层匹配）
 *
 * 运行：node tools/textbook/build-biaori.mjs
 * 输出：tools/textbook/out/ 下 每课一个 JSON（48 份）+ 全册汇总 1 份
 *
 * 转换规则：
 * - 教材动词一律 ます形 → 还原辞书形（词库为辞书形：行きます→行く）
 *   动1 五段（き→く…）/ 动2 一段（去ます+る）/ 动3（します→する、きます→くる）
 * - 「勉強～」型サ变动词 → 勉強する
 * - [专]（人名地名）未命中词库的丢弃（李/王/吉田等纯人名不背）
 * - meaning='/' 的表记行（何～／～歳）跳过
 * - 斜杠/〳 并列表记取前者（あちこち/あっちこっち → あちこち）
 */
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const CACHE = join(ROOT, 'tools', 'textbook', 'cache')
const OUT = join(ROOT, 'tools', 'textbook', 'out')
const BASE_DB = join(ROOT, 'static', 'assets', 'base.db')

// ---------- 数据加载 ----------

const words = JSON.parse(readFileSync(join(CACHE, 'words.json'), 'utf8'))
const lessons = JSON.parse(readFileSync(join(CACHE, 'lessons.json'), 'utf8'))

// 初级课名：lessons 数组 [idx, html]，html 含 class='hidden'>初级第X单元第Y课
const lessonNameByIdx = new Map() // lessons.json 索引 → 「初级第X单元第Y课」
for (const [idx, html] of lessons) {
  const m = String(html).match(/class='hidden'>(初级[^<]+)</)
  if (m) lessonNameByIdx.set(idx, m[1])
}

// words.json 的课索引（= 单元*100+组内偏移）：升序去重后前 48 个即初级第 1~48 课
const lessonIdxs = [...new Set(words.map(w => w[0]))].filter(i => i < 10000).sort((a, b) => a - b)
if (lessonIdxs.length !== 48) {
  throw new Error(`初级课索引数异常：${lessonIdxs.length}（应为 48）`)
}
// 课号核对：第 n 课 → lessons.json 的单元课名（(单元-1)*4 + 组内 = 课号）
const lessonNoByIdx = new Map()
lessonIdxs.forEach((idx, i) => {
  const no = i + 1
  const unit = Math.floor((no - 1) / 4) + 1
  const name = `初级第${unit}单元第${no}课`
  lessonNoByIdx.set(idx, no)
  // lessons.json 的 hidden 索引与 words 索引体系不同，仅按名称在全部课名中查证存在
  const allNames = [...lessonNameByIdx.values()]
  if (!allNames.includes(name)) {
    console.warn(`WARN 课名核对未命中：${name}（idx=${idx}），继续按序号映射`)
  }
})

// ---------- 词性归一化 ----------

const POS_ZH = [
  [/^名・サ变/, '名词·サ变动词'],
  [/^名·サ变/, '名词·サ变动词'],
  [/^サ变/, 'サ变动词'],
  [/^カ変/, 'カ变动词'],
  [/^动1他自/, '动词（五段·自他）'],
  [/^动1自他/, '动词（五段·自他）'],
  [/^动1他/, '动词（五段·他动词）'],
  [/^动1自/, '动词（五段·自动词）'],
  [/^动2他/, '动词（一段·他动词）'],
  [/^动2自/, '动词（一段·自动词）'],
  [/^动1/, '动词（五段）'],
  [/^动2/, '动词（一段）'],
  [/^动3/, '动词（サ变·カ变）'],
  [/^形1/, '一类形容词'],
  [/^形2/, '二类形容词'],
  [/^名・形2/, '名词·二类形容词'],
  [/^名·形2/, '名词·二类形容词'],
  [/^名/, '名词'],
  [/^代/, '代词'],
  [/^副词/, '副词'],
  [/^副/, '副词'],
  [/^叹/, '叹词'],
  [/^专/, '专有名词'],
  [/^疑/, '疑问词'],
  [/^连体/, '连体词'],
  [/^连/, '接续词'],
  [/^接/, '接头词'],
]

function normalizePos(tag) {
  const t = tag.replace(/[\[［\]\s]/g, '').replace(/[１２３]/g, m => ({ '１': '1', '２': '2', '３': '3' }[m]))
  for (const [re, zh] of POS_ZH) {
    if (re.test(t)) return { kind: zh, verbClass: /^动([123])/u.test(t) ? t.match(/^动([123])/u)[1] : null, isProper: t === '专' }
  }
  return { kind: '', verbClass: null, isProper: false } // '/' 表达类
}

// ---------- ます形 → 辞书形 ----------

const GODAN = { い: 'う', き: 'く', ぎ: 'ぐ', し: 'す', ち: 'つ', に: 'ぬ', び: 'ぶ', み: 'む', り: 'る' }

// ます形 → 辞书形；サ变(动3)返回名词形（べんきょうします→べんきょう）——词库 suru 词以名词表记
function masuToDict(s, verbClass) {
  if (verbClass === '3') {
    if (s === 'します') return 'する'
    if (s === 'きます') return 'くる'
    if (s === '来ます') return '来る'
    if (s.endsWith('します')) return s.slice(0, -3) // チェックします→チェック（「します」=3 字符）
    if (s.endsWith('～')) return s.slice(0, -1)      // 勉強～→勉強
    return null
  }
  if (!s.endsWith('ます')) return null
  const stem = s.slice(0, -2)
  if (verbClass === '2') return stem + 'る'
  // 五段：词干末假名 い段 → う段
  const last = stem[stem.length - 1]
  if (last == null || GODAN[last] == null) return null
  return stem.slice(0, -1) + GODAN[last]
}

// ---------- 表记/读音解析 ----------

function parseRaw(raw) {
  // 去空白（含全角）→ 去行尾误混词性残留 → 并列表记取前者
  let s = raw.replace(/[\s\u3000]+/g, '')
  s = s.replace(/[［\[][^\]］]*[］\]]$/, '')
  s = s.split('/')[0].split('〳')[0]
  if (s === '' || s === '/') return null
  const lp = s.indexOf('(')
  let reading = s
  let term = s
  if (lp >= 0 && s.endsWith(')')) {
    reading = s.slice(0, lp)
    term = s.slice(lp + 1, -1)
    if (term.startsWith('～')) term = '' // (～人)/(～お願いします)：表记无意义，退回假名
    // 注：(勉強～) 的「～→する」还原交给 masuToDict（动词专用，非动词不会出现～结尾）
  }
  if (term.includes('～') && !term.endsWith('～')) term = term.split('～')[0] // ～结尾的（勉強～）留给 masuToDict
  term = term.trim()
  reading = reading.trim()
  if (term === '') term = reading
  if (reading === '') reading = term
  return { term, reading }
}

// ---------- 词库验证（模拟 App 分层匹配） ----------

const db = new DatabaseSync(BASE_DB, { readOnly: true })
const dbGet = (sql, ...p) => db.prepare(sql).get(...p)

function lookup(term, reading) {
  if (term && reading) {
    const r = dbGet('SELECT id FROM word WHERE term = ? AND reading = ?', term, reading)
    if (r) return 'term+reading'
  }
  if (term) {
    const r = dbGet('SELECT id FROM word WHERE term = ?', term)
    if (r) return 'term'
  }
  if (reading) {
    const r = dbGet('SELECT COUNT(*) AS c FROM word WHERE reading = ?', reading)
    if (r && r.c === 1) return 'reading' // 仅 reading 唯一命中（与 App importer 分层一致）
  }
  return null
}

// ---------- 主流程 ----------

const stats = { total: 0, kept: 0, droppedMark: 0, droppedProper: 0, convertedVerb: 0, verbConvertMiss: 0 }
const lessonsOut = [] // [{no, words: [...]}]

for (const idx of lessonIdxs) {
  const no = lessonNoByIdx.get(idx)
  const rows = words.filter(w => w[0] === idx)
  const outWords = []
  for (const [, posTag, meaningZh, raw] of rows) {
    stats.total++
    if (meaningZh === '/') { stats.droppedMark++; continue } // 何～／～歳 类表记行
    const parsed = parseRaw(raw)
    if (parsed == null) { stats.droppedMark++; continue }
    const { kind, verbClass, isProper } = normalizePos(posTag)

    // 动词：ます形 → 辞书形（term 与 reading 同步转换）
    if (verbClass != null) {
      const t = masuToDict(parsed.term, verbClass)
      const r = masuToDict(parsed.reading, verbClass)
      if (t != null && r != null) {
        if (verbClass === '3' && t !== 'する' && t !== 'くる' && t !== '来る' && lookup(t, r) == null) {
          // サ变名词形未命中库 → 回退「～する」形（可能命中 愛する 型词条，或作为新词条）
          parsed.term = t + 'する'
          parsed.reading = r + 'する'
        } else {
          parsed.term = t
          parsed.reading = r
        }
        stats.convertedVerb++
      } else {
        stats.verbConvertMiss++
      }
    }

    // 专有名词：三层匹配均未命中 → 视为纯人名，丢弃
    if (isProper && lookup(parsed.term, parsed.reading) == null) {
      stats.droppedProper++
      continue
    }

    const item = { term: parsed.term, reading: parsed.reading }
    if (meaningZh) item.meaning = meaningZh
    if (kind) item.pos = kind
    outWords.push(item)
    stats.kept++
  }
  lessonsOut.push({ no, words: outWords })
}

// ---------- 输出 ----------

mkdirSync(OUT, { recursive: true })

for (const { no, words: ws } of lessonsOut) {
  const vol = no <= 24 ? '上' : '下'
  const payload = { planName: `标日初级${vol} 第${no}课`, dailyNew: 10, words: ws }
  writeFileSync(join(OUT, `lesson-${String(no).padStart(2, '0')}.json`), JSON.stringify(payload, null, 2))
}

// 全册汇总（按首现去重，教材词序）
const seen = new Set()
const allWords = []
for (const { words: ws } of lessonsOut) {
  for (const w of ws) {
    const key = w.term + '\u0000' + w.reading
    if (seen.has(key)) continue
    seen.add(key)
    allWords.push(w)
  }
}
writeFileSync(join(OUT, 'standard-japanese-primary-full.json'),
  JSON.stringify({ planName: '标准日本语 初级', dailyNew: 10, words: allWords }, null, 2))

// ---------- 报告 ----------

let hitTr = 0, hitT = 0, hitR = 0, miss = 0
const missSamples = []
for (const w of allWords) {
  const how = lookup(w.term, w.reading)
  if (how === 'term+reading') hitTr++
  else if (how === 'term') hitT++
  else if (how === 'reading') hitR++
  else {
    miss++
    if (missSamples.length < 25) missSamples.push(`${w.term}（${w.reading}）`)
  }
}

console.log(`课数：${lessonsOut.length}（词 ${lessonsOut[0].words.length} ~ ${Math.max(...lessonsOut.map(l => l.words.length))} 词/课）`)
console.log(`总行 ${stats.total}｜保留 ${stats.kept}｜表记行丢弃 ${stats.droppedMark}｜人名丢弃 ${stats.droppedProper}`)
console.log(`动词转辞书形：成功 ${stats.convertedVerb}｜未变（非ます形/规则外）${stats.verbConvertMiss}`)
console.log(`全册去重后 ${allWords.length} 词，词库匹配：`)
console.log(`  精确(term+reading) ${hitTr}｜仅term ${hitT}｜仅reading ${hitR}｜未命中(将新建) ${miss}`)
console.log(`  命中率 ${(((hitTr + hitT + hitR) / allWords.length) * 100).toFixed(1)}%`)
console.log(`未命中样例：${missSamples.join('、')}`)
console.log(`输出目录：${OUT}`)
