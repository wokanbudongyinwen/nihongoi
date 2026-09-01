/**
 * 基础词库加工管线（构建时资产，开发机运行，不入 App）
 *
 * 用法：node build.mjs
 *   首次运行自动下载原始数据到 cache/（约 50MB，仅需一次）：
 *     - JMdict_e.gz（EDRDG，CC BY-SA 4.0）英文版词典
 *     - accents.txt（Kanjium 音调数据集，CC BY-SA 4.0）
 *   可选：把 zh-meanings.json（[{term,reading,meaning},...]）放进本目录补中文释义
 *
 * 产出 base.db（word + word_relation 系统关联）复制到 static/assets/。
 * 缺数据源时退回 8 个种子词，保证 App 空数据可跑。
 *
 * 管线：
 *   解析 JMdict（流式切块）→ 常用词过滤（pri 标记，上限 2.2 万）
 *   → 词性映射（JMdict pos 标签 → 中文词性 + 动词类型）
 *   → 假名→罗马音派生
 *   → Kanjium 音调合并（多音调天然多值）
 *   → zh-meanings.json 中文释义合并（可选，缺省英文）
 *   → xref/ant → 近义/反义系统关联（is_system=1）
 */
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, copyFileSync, existsSync, rmSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import https from 'node:https'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DB = join(__dirname, 'base.db')
const CACHE = join(__dirname, 'cache')
const JMDICT_GZ = join(CACHE, 'JMdict_e.gz')
const ACCENTS = join(CACHE, 'accents.txt')
const ZH_MEANINGS = join(__dirname, 'zh-meanings.json')

const MAX_ENTRIES = 22000

// ---------- 下载 ----------

function download(urls, dest, minSize = 10000) {
  const list = Array.isArray(urls) ? urls : [urls]
  let lastErr = null
  for (const url of list) {
    try {
      console.log('下载 ' + url)
      execSync(`curl -L --retry 2 -o "${dest}" "${url}"`, { stdio: 'inherit' })
      // 内容校验：错误页/空文件视为失败
      const size = existsSync(dest) ? statSync(dest).size : 0
      if (size < minSize) {
        console.log(`文件过小（${size}B），视为无效，尝试下一个源…`)
        lastErr = new Error('downloaded file too small: ' + size)
        continue
      }
      return
    } catch (e) {
      lastErr = e
      console.log('该源失败，尝试下一个…')
    }
  }
  throw lastErr
}

if (!existsSync(CACHE)) mkdirSync(CACHE)
if (!existsSync(JMDICT_GZ)) {
  download([
    'https://www.edrdg.org/pub/Nihongo/JMdict_e.gz',
    'https://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz'
  ], JMDICT_GZ)
}
if (!existsSync(ACCENTS)) {
  // GitHub raw 国内易被重置：gh-proxy 镜像优先，其余兜底
  download([
    'https://gh-proxy.com/https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/source_files/raw/accents.txt',
    'https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/source_files/raw/accents.txt',
    'https://cdn.jsdelivr.net/gh/mifunetoshiro/kanjium@master/data/source_files/raw/accents.txt'
  ], ACCENTS)
}

// ---------- 假名→罗马音 ----------

const KANA_BASE = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'wo', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po'
}
const KANA_COMBO = {
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo', しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho', にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo', みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo', じゃ: 'ja', じゅ: 'ju', じょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo', ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
  ふぁ: 'fa', ふぃ: 'fi', ふぇ: 'fe', ふぉ: 'fo',
  ヴぁ: 'va', うぁ: 'wa', うぃ: 'wi', うぇ: 'we', うぉ: 'wo',
  てぃ: 'ti', でぃ: 'di', とぅ: 'tu', どぅ: 'du', ちぇ: 'che', しぇ: 'she', じぇ: 'je'
}
const KATA_TO_HIRA = {}
for (let c = 0x30a1; c <= 0x30f6; c++) {
  KATA_TO_HIRA[String.fromCharCode(c)] = String.fromCharCode(c - 0x60)
}

function toHiragana(s) {
  let out = ''
  for (const ch of s) {
    out += KATA_TO_HIRA[ch] ?? ch
  }
  return out
}

function kanaToRomaji(kana) {
  const s = toHiragana(kana)
  let out = ''
  let i = 0
  while (i < s.length) {
    const two = s.slice(i, i + 2)
    if (KANA_COMBO[two]) {
      out += KANA_COMBO[two]
      i += 2
      continue
    }
    const one = s[i]
    if (one === 'っ') {
      // 促音：重复下一个音的首辅音
      let j = i + 1
      const next2 = s.slice(j, j + 2)
      const next = KANA_COMBO[next2] ?? KANA_BASE[s[j]] ?? ''
      const consonant = next.match(/^[bcdfghjklmnpqrstvwyz]+/)?.[0] ?? ''
      out += consonant
      i += 1
      continue
    }
    if (one === 'ー') {
      // 长音：重复前一个元音
      const prev = out.match(/[aeiou]$/)?.[0]
      if (prev) out += prev
      i += 1
      continue
    }
    if (one === 'ん') {
      // 后续音节首辅音为 b/p/m 时写 m（如 群馬 gunma、真ん中mannaka），否则 n
      const rest2 = s.slice(i + 1, i + 3)
      const nxt = KANA_COMBO[rest2] ?? KANA_BASE[s[i + 1] ?? ''] ?? ''
      const c0 = nxt.charAt(0)
      out += (c0 == 'b' || c0 == 'p' || c0 == 'm') ? 'm' : 'n'
      i += 1
      continue
    }
    out += KANA_BASE[one] ?? one
    i += 1
  }
  return out
}

// ---------- Kanjium 音调 ----------

function loadAccents() {
  const map = new Map() // key: 漢字\tかな → accents 数组
  const byReading = new Map() // key: かな → accents 数组（纯假名词兜底：Kanjium 缺 する/きれい 等假名形行，只有汉字变体行）
  const lines = readFileSync(ACCENTS, 'utf-8').split('\n')
  for (const line of lines) {
    const parts = line.split('\t')
    if (parts.length < 3) continue
    const kanji = parts[0]
    const kana = toHiragana(parts[1])
    if (kana == '') continue
    const nums = parts[2].split(/[,\s]+/).filter((x) => x !== '' && !isNaN(parseInt(x)))
    if (nums.length == 0) continue
    const key = kanji + '\t' + kana
    const prev = map.get(key) ?? []
    for (const n of nums) {
      if (!prev.includes(n)) prev.push(n)
    }
    map.set(key, prev)
    const prevR = byReading.get(kana) ?? []
    for (const n of nums) {
      if (!prevR.includes(n)) prevR.push(n)
    }
    byReading.set(kana, prevR)
  }
  return { map, byReading }
}

// ---------- JMdict 解析（流式切块 + 正则提取） ----------

function parseJMdict() {
  const xml = gunzipSync(readFileSync(JMDICT_GZ)).toString('utf-8')
  const entries = []
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g
  let m
  while ((m = entryRe.exec(xml)) !== null) {
    const body = m[1]
    // JMdict 词条序号（tomoshi 数据按它关联）
    const seq = body.match(/<ent_seq>(\d+)<\/ent_seq>/)?.[1] ?? ''
    // 表记：收集全部 keb；主表记跳过罕用汉字形（&rK;，如 する 的 為る），全罕用/无 keb 则用读音
    const kebs = [...body.matchAll(/<keb>([^<]+)<\/keb>/g)].map((x) => x[1])
    let mainKeb = null
    const kEles = [...body.matchAll(/<k_ele>([\s\S]*?)<\/k_ele>/g)]
    for (const km of kEles) {
      const kb = km[1].match(/<keb>([^<]+)<\/keb>/)?.[1] ?? null
      if (kb == null || /<ke_inf>&rK;<\/ke_inf>/.test(km[1])) continue
      if (mainKeb == null) {
        mainKeb = kb
      }
    }
    // 常用标记
    const pris = [...body.matchAll(/<(?:ke|re)_pri>([^<]+)<\/(?:ke|re)_pri>/g)].map((x) => x[1])
    const isCommon = pris.some((p) => /(ichi1|news1|spec1|gai1|nf0[1-9]|nf1[0-9]|nf2[0-4])/.test(p))
    if (!isCommon) continue
    // 读音：优先无 re_restr 限制的（适用于本表记）
    let reb = null
    for (const rm of body.matchAll(/<r_ele>([\s\S]*?)<\/r_ele>/g)) {
      const rbody = rm[1]
      const kana = rbody.match(/<reb>([^<]+)<\/reb>/)?.[1] ?? null
      if (!kana) continue
      const restr = [...rbody.matchAll(/<re_restr>([^<]+)<\/re_restr>/g)].map((x) => x[1])
      if (restr.length == 0 || (kebs.length > 0 && restr.includes(kebs[0]))) {
        reb = kana
        break
      }
    }
    if (reb == null) continue
    const term = mainKeb ?? reb
    // 第一个 sense 的词性与释义
    const sense = body.match(/<sense>([\s\S]*?)<\/sense>/)?.[1] ?? ''
    const posTags = [...sense.matchAll(/<pos>&([\w-]+);<\/pos>/g)].map((x) => x[1])
    const glosses = [...sense.matchAll(/<gloss[^>]*>([^<]+)<\/gloss>/g)].map((x) => x[1])
    // 关联：xref（近义参考）与 ant（反义）
    const xrefs = [...body.matchAll(/<(?:xref|ant)>([^<]+)<\/(?:xref|ant)>/g)].map((x) => ({
      target: x[1],
      isAnt: x[0].startsWith('<ant>')
    }))
    entries.push({ seq, term, reading: reb, posTags, glosses, xrefs })
    if (entries.length >= MAX_ENTRIES) break
  }
  return entries
}

// ---------- Tomoshi 开放数据层（可选增强：中文释义 / 自他动词对 / JLPT / 词频） ----------

const TOMOSHI_DB = join(CACHE, 'tomoshi.db')

/**
 * zh_defs 的 data JSON：{senses:{"0":{glosses:[{text}]},...}}
 * 精简策略：前 4 义项 × 每义项第一 gloss，"；" 连接（卡面友好）
 */
function compactZh(dataJson) {
  try {
    const senses = JSON.parse(dataJson).senses ?? {}
    const keys = Object.keys(senses).sort((a, b) => Number(a) - Number(b))
    const out = []
    for (const k of keys.slice(0, 4)) {
      const g = senses[k].glosses ?? []
      if (g.length > 0 && g[0].text) {
        out.push(g[0].text)
      }
    }
    return out.join('；')
  } catch {
    return ''
  }
}

function loadTomoshi() {
  if (!existsSync(TOMOSHI_DB)) {
    return null
  }
  console.log('加载 tomoshi 开放数据（中文释义/自他对/JLPT/词频）…')
  const t = new DatabaseSync(TOMOSHI_DB, { readOnly: true })
  const zh = new Map()
  for (const r of t.prepare('SELECT entry_id, data FROM zh_defs').all()) {
    const s = compactZh(r.data)
    if (s != '') {
      zh.set(r.entry_id, s)
    }
  }
  const jlpt = new Map()
  for (const r of t.prepare('SELECT entry_id, level FROM vocab_jlpt').all()) {
    jlpt.set(r.entry_id, r.level)
  }
  const freq = new Map()
  for (const r of t.prepare('SELECT entry_id, rank FROM freq_rank').all()) {
    freq.set(r.entry_id, r.rank)
  }
  // 自他动词对：只取 vt 行（from=他动 → to=自动），每对一行，避免双向重复
  const verbPairs = []
  for (const r of t.prepare(`SELECT entry_id, counterpart_entry_id FROM verb_pairs WHERE role = 'vt'`).all()) {
    verbPairs.push([r.entry_id, r.counterpart_entry_id])
  }
  t.close()
  console.log(`中文释义 ${zh.size}｜JLPT ${jlpt.size}｜词频 ${freq.size}｜自他对 ${verbPairs.length}`)
  return { zh, jlpt, freq, verbPairs }
}

// ---------- 词性映射 ----------

function mapPos(posTags) {
  const t = new Set(posTags)
  let verbType = ''
  let pos = ''
  if ([...t].some((x) => /^v1/.test(x)) || t.has('vz')) {
    // v1 前缀族：v1（一段）/ v1s / v1k（くれる 型特殊一段）
    verbType = 'ichidan'
  } else if ([...t].some((x) => /^v5/.test(x))) {
    verbType = 'godan'
  } else if (t.has('vs-i') || t.has('vs-s') || t.has('vs')) {
    // vs 为旧式サ变标签（名变动词：落胆する/清書する 等，term 为名词形）
    verbType = 'suru'
  } else if (t.has('vk')) {
    verbType = 'kuru'
  }
  const isVerb = verbType !== '' || [...t].some((x) => /^(v1|v5|vs|vk|vz)/.test(x))
  if (isVerb) {
    if (t.has('vt') && t.has('vi')) pos = '动词·自他动词'
    else if (t.has('vt')) pos = '动词·他动词'
    else if (t.has('vi')) pos = '动词·自动词'
    else pos = '动词'
    return { pos, verbType }
  }
  if (t.has('adj-i')) return { pos: '形容词', verbType: '' }
  if (t.has('adj-na')) return { pos: '形容动词', verbType: '' }
  // 名词优先于副词：今日(n-t+adv) 等时点名词归名词更合理
  if (t.has('n') || t.has('pn') || t.has('n-t')) return { pos: '名词', verbType: '' }
  if (t.has('adv') || t.has('adv-to')) return { pos: '副词', verbType: '' }
  if (t.has('exp')) return { pos: '短语', verbType: '' }
  return { pos: '其他', verbType: '' }
}

// ---------- 建库 ----------

if (existsSync(OUT_DB)) rmSync(OUT_DB)
const db = new DatabaseSync(OUT_DB)
db.exec(readFileSync(join(__dirname, 'schema.sql'), 'utf-8'))

const insertWord = db.prepare(`
  INSERT OR IGNORE INTO word (term, reading, romaji, accent, pos, meaning, verb_type, extra_json, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)
const insertRel = db.prepare(`
  INSERT OR IGNORE INTO word_relation (from_word_id, to_word_id, relation_type, is_system, note, created_at)
  VALUES (?, ?, ?, 1, '', ?)
`)

let entryCount = 0
let relCount = 0
let zhCount = 0

if (!existsSync(JMDICT_GZ)) {
  // 无数据源：种子词兜底（保证空数据源可跑）
  const now = Date.now()
  const seed = [
    { term: '開ける', reading: 'あける', romaji: 'akeru', accent: '0', pos: '动词·他动词', meaning: '打开；开业', verbType: 'ichidan' },
    { term: '開く', reading: 'ひらく', romaji: 'hiraku', accent: '2', pos: '动词·自动词', meaning: '开；打开', verbType: 'godan' },
    { term: '閉める', reading: 'しめる', romaji: 'shimeru', accent: '2', pos: '动词·他动词', meaning: '关闭', verbType: 'ichidan' },
    { term: '閉じる', reading: 'とじる', romaji: 'tojiru', accent: '2', pos: '动词·自他动词', meaning: '关闭；结束', verbType: 'ichidan' },
    { term: '行く', reading: 'いく', romaji: 'iku', accent: '0', pos: '动词·自动词', meaning: '去', verbType: 'godan' },
    { term: '食べる', reading: 'たべる', romaji: 'taberu', accent: '2', pos: '动词·他动词', meaning: '吃', verbType: 'ichidan' },
    { term: 'する', reading: 'する', romaji: 'suru', accent: '0', pos: '动词·サ变自动词', meaning: '做，干', verbType: 'suru' },
    { term: '来る', reading: 'くる', romaji: 'kuru', accent: '1', pos: '动词·カ变自动词', meaning: '来', verbType: 'kuru' }
  ]
  for (const r of seed) {
    insertWord.run(r.term, r.reading, r.romaji, r.accent, r.pos, r.meaning, r.verbType, '{}', now, now)
  }
  entryCount = seed.length
} else {
  console.log('解析 JMdict …')
  const entries = parseJMdict()
  console.log(`常用词条 ${entries.length}`)
  const accents = loadAccents()
  console.log(`音调数据 ${accents.map.size} 条`)

  // 中文释义（可选，term+reading 匹配，优先级高于 tomoshi）
  const zhMap = new Map()
  if (existsSync(ZH_MEANINGS)) {
    for (const z of JSON.parse(readFileSync(ZH_MEANINGS, 'utf-8'))) {
      if (z.term && z.meaning) zhMap.set(z.term + '\t' + (z.reading ?? ''), z.meaning)
    }
    console.log(`自定义中文释义 ${zhMap.size} 条`)
  }

  // tomoshi 开放数据（按 ent_seq 关联）：中文释义 / 自他对 / JLPT / 词频
  const tomoshi = loadTomoshi()

  const now = Date.now()
  db.exec('BEGIN')
  try {
    const idMap = new Map() // term\treading → id
    const termFirstId = new Map() // term → 首个 id（xref 只写表记时的回退）
    const seqIdMap = new Map() // JMdict ent_seq → word id（tomoshi verb_pairs 用）
    for (const e of entries) {
      const hiraReading = toHiragana(e.reading)
      const romaji = kanaToRomaji(e.reading)
      // 音调：表记+读音精确 → 假名形行 → 按读音兜底（多表记归并）
      const acc = accents.map.get(e.term + '\t' + hiraReading) ??
        accents.map.get(hiraReading + '\t' + hiraReading) ??
        accents.byReading.get(hiraReading) ?? []
      const { pos, verbType } = mapPos(e.posTags)
      // 释义：自定义 zh-meanings > tomoshi 中文 > 英文 gloss
      let meaning = e.glosses.join('; ')
      const zhCustom = zhMap.get(e.term + '\t' + hiraReading) ?? zhMap.get(e.term + '\t' + '')
      if (zhCustom) {
        meaning = zhCustom
        zhCount++
      } else if (tomoshi != null && tomoshi.zh.has(e.seq)) {
        meaning = tomoshi.zh.get(e.seq)
        zhCount++
      }
      // extra_json：JLPT 等级与词频排名（有则存）
      const extra = {}
      if (tomoshi != null) {
        const lv = tomoshi.jlpt.get(e.seq)
        if (lv != null) extra.jlpt = lv
        const fr = tomoshi.freq.get(e.seq)
        if (fr != null) extra.freq = fr
      }
      const r = insertWord.run(e.term, e.reading, romaji, acc.join(','), pos, meaning, verbType, JSON.stringify(extra), now, now)
      const wordId = Number(r.lastInsertRowid)
      if (wordId > 0) {
        idMap.set(e.term + '\t' + hiraReading, wordId)
        if (e.seq != '') {
          seqIdMap.set(e.seq, wordId)
        }
        if (!termFirstId.has(e.term)) {
          termFirstId.set(e.term, wordId)
        }
        e.wordId = wordId
      }
    }
    // 系统关联：xref→近义 / ant→反义（双方都在库内才建）
    for (const e of entries) {
      if (!e.wordId) continue
      for (const x of e.xrefs) {
        // 目标形如 結ぶ / 結ぶ・むすぶ / 結ぶ・むすぶ・1（末尾可能带 sense 序号）
        const parts = x.target.split('・')
        const tTerm = parts[0]
        const tReading = parts.length > 1 ? toHiragana(parts[1]) : ''
        const tId = idMap.get(tTerm + '\t' + tReading) ?? termFirstId.get(tTerm) ?? -1
        if (tId <= 0 || tId == e.wordId) continue
        const relType = x.isAnt ? 'antonym' : 'synonym'
        insertRel.run(e.wordId, tId, relType, now)
        relCount++
      }
    }
    // 系统关联：自他动词对（tomoshi verb_pairs，vt→vi 各建一条）
    if (tomoshi != null) {
      let pairCount = 0
      for (const pair of tomoshi.verbPairs) {
        const vtId = seqIdMap.get(pair[0]) ?? -1
        const viId = seqIdMap.get(pair[1]) ?? -1
        if (vtId <= 0 || viId <= 0) continue
        insertRel.run(vtId, viId, 'trans_intrans', now)
        pairCount++
        relCount++
      }
      console.log(`自他动词对入库 ${pairCount}`)
    }
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
  entryCount = entries.length
}

const count = db.prepare('SELECT COUNT(*) AS n FROM word').get().n
const rels = db.prepare('SELECT COUNT(*) AS n FROM word_relation').get().n
db.close()

// 复制到 static/assets（App 打包资源位）
const target = join(__dirname, '..', '..', 'static', 'assets', 'base.db')
if (existsSync(join(__dirname, '..', '..', 'static', 'assets'))) {
  copyFileSync(OUT_DB, target)
  console.log(`base.db 已复制到 static/assets（词条 ${count}，系统关联 ${rels}，中文释义 ${zhCount}）`)
} else {
  console.log(`static/assets 目录不存在，仅生成 base.db（词条 ${count}，系统关联 ${rels}）`)
}
