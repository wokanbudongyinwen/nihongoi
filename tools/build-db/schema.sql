-- 基础词库（base.db）建表脚本 —— 仅知识域
-- 与 repos/sqlite/schema.uts 中的知识域表结构保持一致（勿改列名）
-- 学习域/计划域表由 App 端首启时补建，不在底库中

CREATE TABLE IF NOT EXISTS word (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term TEXT NOT NULL,
  reading TEXT NOT NULL DEFAULT '',
  romaji TEXT NOT NULL DEFAULT '',
  accent TEXT NOT NULL DEFAULT '',
  pos TEXT NOT NULL DEFAULT '',
  meaning TEXT NOT NULL DEFAULT '',
  verb_type TEXT NOT NULL DEFAULT '',
  extra_json TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_word_term ON word(term);
CREATE INDEX IF NOT EXISTS idx_word_reading ON word(reading);
CREATE INDEX IF NOT EXISTS idx_word_romaji ON word(romaji);

CREATE TABLE IF NOT EXISTS sentence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word_id INTEGER NOT NULL REFERENCES word(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT '',
  remark TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sentence_word ON sentence(word_id);

CREATE TABLE IF NOT EXISTS word_relation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_word_id INTEGER NOT NULL REFERENCES word(id) ON DELETE CASCADE,
  to_word_id INTEGER NOT NULL REFERENCES word(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  is_system INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  UNIQUE(from_word_id, to_word_id, relation_type)
);
CREATE INDEX IF NOT EXISTS idx_relation_from ON word_relation(from_word_id);
CREATE INDEX IF NOT EXISTS idx_relation_to ON word_relation(to_word_id);
