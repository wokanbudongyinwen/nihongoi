/**
 * Run: node tools/tests/study-session.test.cjs [path/to/typescript.js]
 * Uses actual UTS session/scheduler/SQLite DAO code with an isolated in-memory SQLite database.
 */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { DatabaseSync } = require('node:sqlite')
const ts = require(process.argv[2] || process.env.NIHONGO_TYPESCRIPT || 'typescript')
const root = path.resolve(__dirname, '../..')

function utsObject(value) {
  if (Array.isArray(value)) return value.map(utsObject)
  if (value == null || typeof value !== 'object') return value
  for (const key of Object.keys(value)) value[key] = utsObject(value[key])
  const typed = (key, type) => typeof value[key] === type ? value[key] : null
  Object.defineProperties(value, {
    getString: { value: key => typed(key, 'string') },
    getNumber: { value: key => typed(key, 'number') },
    getBoolean: { value: key => typed(key, 'boolean') },
    getArray: { value: key => Array.isArray(value[key]) ? value[key] : null },
    get: { value: key => value[key] ?? null }
  })
  return value
}

function harness() {
  const db = new DatabaseSync(':memory:')
  const kv = new Map()
  const cache = new Map()
  let failTransaction = false
  let failAfterCommitSnapshot = false
  const client = {
    async select(_name, sql) {
      return db.prepare(sql).all().map(row => Object.values(row).map(v => v == null ? '' : String(v)))
    },
    async transaction(_name, sqls) {
      db.exec('BEGIN')
      try {
        for (let i = 0; i < sqls.length; i++) {
          db.exec(sqls[i])
          if (failTransaction && i === 0) throw Error('injected transaction failure')
        }
        db.exec('COMMIT')
        return true
      } catch (e) {
        db.exec('ROLLBACK')
        throw e
      }
    }
  }
  const planRepo = {
    async getActivePlan() {
      const row = db.prepare('SELECT * FROM plan WHERE is_active=1').get()
      return row ? { id: row.id, cycleJson: row.cycle_json } : null
    },
    async getPlan(id) {
      const row = db.prepare('SELECT * FROM plan WHERE id=?').get(id)
      return row ? { id: row.id, cycleJson: row.cycle_json } : null
    },
    async getPlanPriorities(id) {
      return new Map(db.prepare('SELECT word_id,priority FROM plan_item WHERE plan_id=?').all(id).map(r => [r.word_id,r.priority]))
    }
  }
  const wordRepo = {
    async getById(id) {
      const row = db.prepare('SELECT * FROM word WHERE id=?').get(id)
      return row ? { id: row.id, term: row.term } : null
    }
  }
  const mocks = new Map([
    ['repos/sqlite/bootstrap.uts', { getClient: () => client }],
    ['repos/sqlite/meibaoClient.uts', { sqlNum: String, toNum: Number }],
    ['repos/sqlite/planRepoImpl.uts', { getPlanRepo: () => planRepo }],
    ['repos/sqlite/wordRepoImpl.uts', { getWordRepo: () => wordRepo }],
    ['repos/native/storage.uts', {
      getStoredString: key => kv.get(key) || '',
      setStoredString(key, value) {
        if (failAfterCommitSnapshot) throw Error('injected process exit after SQL commit')
        kv.set(key, value)
      },
      removeStored(key) { kv.delete(key) }
    }]
  ])
  function load(relative) {
    const normalized = relative.replaceAll('\\', '/')
    if (mocks.has(normalized)) return mocks.get(normalized)
    if (cache.has(normalized)) return cache.get(normalized).exports
    const filename = path.join(root, normalized)
    const source = fs.readFileSync(filename, 'utf8')
    const { outputText } = ts.transpileModule(source, {
      fileName: filename.replace(/\.uts$/, '.ts'),
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    })
    const module = { exports: {} }
    cache.set(normalized, module)
    const relativeRequire = spec => load(path.relative(root, path.resolve(path.dirname(filename), spec)).replaceAll('\\', '/'))
    const utsJson = { ...JSON, parse: text => utsObject(JSON.parse(text)), stringify: JSON.stringify }
    new Function('require', 'module', 'exports', 'JSON', outputText)(relativeRequire, module, module.exports, utsJson)
    return module.exports
  }
  for (const sql of load('repos/sqlite/schema.uts').SCHEMA_SQL) db.exec(sql)
  const service = load('services/studySession.uts')
  const stateRepo = load('repos/sqlite/stateRepoImpl.uts').getStateRepo()
  const word = id => ({ id, term: 'word-' + id })
  function seed(priority = 3) {
    db.exec("INSERT INTO plan(id,name,is_active,created_at) VALUES(1,'A',1,0),(2,'B',0,0),(3,'C',0,0)")
    for (let id = 1; id <= 30; id++) {
      db.prepare('INSERT INTO word(id,term,created_at,updated_at) VALUES(?,?,0,0)').run(id, 'word-' + id)
      for (const plan of [1,2,3]) db.prepare('INSERT INTO plan_item(plan_id,word_id,sort,priority) VALUES(?,?,?,?)').run(plan,id,id,priority)
    }
  }
  return {
    db, kv, service, stateRepo, word, seed,
    failTransaction(value) { failTransaction = value },
    failSnapshot(value) { failAfterCommitSnapshot = value },
    state(plan, id) { return db.prepare('SELECT * FROM word_state WHERE plan_id=? AND word_id=?').get(plan,id) },
    logs() { return db.prepare('SELECT * FROM review_log ORDER BY id').all() },
    async save(s) { service.snapshotDraft(s); return service.commitSession(s) },
    close() { db.close() }
  }
}

let cases = 0
async function test(name, run) {
  const h = harness()
  try { await run(h); cases++; console.log('PASS ' + name) }
  finally { h.close() }
}

async function main() {
  await test('first remembered word persists before the remaining queue, reload and no duplicate end commit', async h => {
    h.seed()
    const s = h.service.createSession('new', [h.word(1),h.word(2)], 1)
    h.service.answer(s, 2, 1000)
    assert.equal(await h.save(s), true)
    assert.equal(s.finished, false)
    assert.equal(h.state(1,1).familiarity, 40)
    assert.equal(h.state(1,2), undefined)
    assert.equal(h.logs().length, 1)
    assert.equal(s.pending.length, 0)
    const restored = await h.service.restoreDraft('new')
    assert.equal(restored.queue[restored.index].id, 2)
    await h.save(restored)
    assert.equal(h.logs().length, 1)
    h.service.answer(restored, 2, 2000)
    await h.save(restored)
    assert.equal(h.logs().length, 2)
    assert.equal(h.kv.has('session_draft'), false)
  })

  await test('unfinished failed word stays draft-only; two consecutive remembers commit the worst rating once', async h => {
    h.seed()
    const s = h.service.createSession('new', [h.word(1)], 1)
    h.service.answer(s, 0, 1000)
    await h.save(s)
    assert.equal(h.state(1,1), undefined)
    h.service.answer(s, 2, 1100)
    await h.save(s)
    assert.equal(h.state(1,1), undefined)
    const resumed = await h.service.restoreDraft('new')
    h.service.answer(resumed, 2, 1200)
    await h.save(resumed)
    assert.equal(h.logs().length, 1)
    assert.equal(h.logs()[0].rating, 0)
    assert.equal(h.state(1,1).status, 'learning')
    assert.equal(h.state(1,1).last_reviewed_at, 1200)
  })

  await test('interrupted streak resets and a merely failed word is never saved as completed', async h => {
    h.seed()
    const s = h.service.createSession('new', [h.word(1)], 1)
    for (const [rating,time] of [[1,1000],[2,1100],[0,1200],[2,1300]]) {
      h.service.answer(s,rating,time); await h.save(s)
      assert.equal(h.state(1,1),undefined)
    }
    h.service.answer(s,2,1400); await h.save(s)
    assert.equal(h.logs().length,1)
    assert.equal(h.logs()[0].rating,0)
  })

  await test('manual mastered overrides earlier failure, saves immediately and removes future duplicate', async h => {
    h.seed(1)
    const s = h.service.createSession('new', [h.word(1),h.word(2),h.word(1)], 1)
    h.service.answer(s, 0, 1000); await h.save(s)
    h.service.answer(s, 2, 1100); await h.save(s)
    h.service.answerMastered(s,1200); await h.save(s)
    assert.equal(h.state(1,1).status,'mastered')
    assert.equal(h.state(1,1).familiarity,100)
    assert.equal(h.logs().filter(l => l.word_id===1).length,1)
    assert.equal(h.logs().find(l => l.word_id===1).rating,3)
    assert.equal(s.queue.slice(s.index).some(w => w.id===1),false)
  })

  await test('review immediately updates all due plans, excluding mastered and not-yet-due plans', async h => {
    h.seed()
    h.db.exec("INSERT INTO word_state VALUES(1,1,'learning',0,20,100,0,0,50),(2,1,'reviewing',1,60,100,1,0,50),(3,1,'mastered',2,100,100,2,0,50)")
    const s=h.service.createSession('review',[h.word(1),h.word(2)],1)
    h.service.answer(s,2,1000); await h.save(s)
    assert.equal(h.logs().length,2)
    assert.equal(h.state(1,1).familiarity,40)
    assert.equal(h.state(2,1).familiarity,80)
    assert.equal(h.state(3,1).last_reviewed_at,50)
    const resumed=await h.service.restoreDraft('review')
    await h.save(resumed)
    assert.equal(h.logs().length,2)
    assert.equal(s.finished,false)
  })

  await test('manual review mastered commits due plans with stable time, not future plans',async h=>{
    h.seed(1)
    h.db.exec("INSERT INTO word_state VALUES(1,1,'learning',0,20,100,0,0,50),(2,1,'reviewing',1,60,100,1,0,50),(3,1,'reviewing',1,60,9000,1,0,50)")
    const s=h.service.createSession('review',[h.word(1),h.word(2)],1)
    h.service.answerMastered(s,1000)
    h.service.snapshotDraft(s)
    const crashDraft=h.kv.get('session_draft')
    await h.service.commitSession(s)
    h.kv.set('session_draft',crashDraft)
    const restored=await h.service.restoreDraft('review'); await h.save(restored)
    assert.equal(h.logs().length,2)
    assert.equal(h.state(1,1).status,'mastered')
    assert.equal(h.state(2,1).status,'mastered')
    assert.equal(h.state(3,1).last_reviewed_at,50)
    assert.equal(h.logs()[0].reviewed_at,1000)
  })

  await test('SQL rollback leaves completed draft retryable without a partial state or duplicate log', async h => {
    h.seed()
    const s=h.service.createSession('new',[h.word(1),h.word(2)],1)
    h.service.answer(s,2,1000)
    h.failTransaction(true)
    await assert.rejects(h.save(s),/injected transaction/)
    assert.equal(h.state(1,1),undefined); assert.equal(h.logs().length,0)
    assert.deepEqual(s.completedWordIds,[1])
    h.failTransaction(false)
    const restored=await h.service.restoreDraft('new'); await h.save(restored)
    assert.equal(h.logs().length,1)
    assert.equal(restored.queue[restored.index].id,2)
  })

  await test('new word crash after SQL success before snapshot does not repeat a state or log',async h=>{
    h.seed()
    const s=h.service.createSession('new',[h.word(1),h.word(2)],1)
    h.service.answer(s,2,1000); h.service.snapshotDraft(s)
    h.failSnapshot(true)
    await assert.rejects(h.service.commitSession(s),/injected process exit/)
    h.failSnapshot(false)
    const restored=await h.service.restoreDraft('new'); await h.save(restored)
    assert.equal(h.logs().length,1)
    assert.equal(h.state(1,1).familiarity,40)
  })

  await test('review crash after SQL success before snapshot does not increment stage twice',async h=>{
    h.seed()
    h.db.exec("INSERT INTO word_state VALUES(1,1,'learning',0,20,100,0,0,50)")
    const s=h.service.createSession('review',[h.word(1),h.word(2)],1)
    h.service.answer(s,2,1000); h.service.snapshotDraft(s)
    h.failSnapshot(true)
    await assert.rejects(h.service.commitSession(s),/injected process exit/)
    h.failSnapshot(false)
    const restored=await h.service.restoreDraft('review'); await h.save(restored)
    assert.equal(h.logs().length,1)
    assert.equal(h.state(1,1).stage,1)
    assert.equal(h.state(1,1).familiarity,40)
  })

  await test('legacy batch draft saves passed and mastered words only, retaining incomplete word',async h=>{
    h.seed()
    h.kv.set('session_draft',JSON.stringify({
      mode:'new',wordIds:[1,2,3,2],index:3,
      pending:[{wordId:1,rating:2,isFirst:true,answeredAt:1000},{wordId:2,rating:0,isFirst:true,answeredAt:1100}],
      progress:[{id:1,consec:1,failed:false,worst:-1},{id:2,consec:0,failed:true,worst:0}],
      manualMastered:[3]
    }))
    const s=await h.service.restoreDraft('new'); await h.save(s)
    assert.equal(h.state(1,1).familiarity,40)
    assert.equal(h.state(1,2),undefined)
    assert.equal(h.state(1,3).status,'mastered')
    assert.equal(s.queue[s.index].id,2)
    assert.equal(s.pending.length,1)
    assert.equal(h.logs().length,2)
  })

  await test('source plan stays fixed across active-plan switch and deleted queue words preserve cursor',async h=>{
    h.seed()
    const s=h.service.createSession('new',[h.word(1),h.word(2),h.word(3)],1)
    h.service.answer(s,2,1000); await h.save(s)
    h.db.exec('UPDATE plan SET is_active=0; UPDATE plan SET is_active=1 WHERE id=2; DELETE FROM word WHERE id=1')
    const restored=await h.service.restoreDraft('new')
    assert.equal(restored.planId,1)
    assert.equal(restored.queue[restored.index].id,2)
    h.service.answer(restored,2,2000); await h.save(restored)
    assert.equal(h.state(1,2).familiarity,40)
    assert.equal(h.state(2,2),undefined)
  })

  await test('final-word crash draft can recover and save before clearing',async h=>{
    h.seed(1)
    const s=h.service.createSession('new',[h.word(1)],1)
    h.service.answerMastered(s,1000); h.service.snapshotDraft(s)
    const restored=await h.service.restoreDraft('new')
    assert.equal(restored.finished,true)
    await h.save(restored)
    assert.equal(h.state(1,1).status,'mastered')
    assert.equal(h.logs().length,1)
    assert.equal(h.kv.has('session_draft'),false)
  })

  await test('completed word persists even when the remaining draft is discarded',async h=>{
    h.seed()
    const s=h.service.createSession('new',[h.word(1),h.word(2)],1)
    h.service.answer(s,2,1000); await h.save(s)
    h.service.clearDraft()
    assert.equal(h.state(1,1).familiarity,40)
    assert.equal(h.logs().length,1)
    assert.equal(h.state(1,2),undefined)
  })
  console.log(cases + ' study-session regression cases passed (in-memory SQLite).')
}
main().catch(e=>{console.error(e); process.exitCode=1})
