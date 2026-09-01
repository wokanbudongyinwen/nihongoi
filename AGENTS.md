# nihongo-student（背单词·日语单词本地学习 App）

> **开始任何工作前先读 [DESIGN.md](./DESIGN.md)**：完整设计构想、全部决策的取舍理由、当前进度与路线图、遗留决策点都在那里。本文只保留精简结论。

## 项目简介

个人自用的日语单词背诵应用。完全本地运行、离线可用，数据全部存本地。
（2026-08-28 由旧项目 `i:\myApp\背单词` 迁移至本标准 uni-app x 工程，设计讨论结论全部保留）

核心功能：
- 自定义背词计划表：学新词 + 周期性复习（按周期与熟练度调度）
- 词卡随时可编辑：例句管理、笔记、与其他词条自由关联（M:N）
- 非自定义关联：近义词、反义词、自他动词对、动词活用形态

## 技术栈

- 框架：uni-app x（跨端 App）
- 存储：本地 SQLite，完全离线，数据不出设备
- 复习算法：固定周期表 + 熟练度调节
- 词库分层：基础词库（全量词条数据）+ 计划层（只引用基础词库的词条，定义背词顺序/数量/范围）

## 数据模型（已定稿）

- 基础词库：`word`（term/reading/romaji/accent 多值逗号分隔/pos/meaning/verb_type/extra_json）、`sentence`(1:N)、`note`(1:N)、`word_relation`(M:N，relation_type + is_system 区分固定/自由关联)；搜索支持表记/读音/罗马音/释义；音调展示用带圈数字（⓪①…⑳，domain/format.uts）
- 动词活用形不落库，由 `word.verb_type` 派生计算，不规则形态存 `extra_json` override
- 计划层：`plan`（daily_new/daily_review_cap/cycle_json）+ `plan_item(plan_id, word_id, sort, priority)`，只存引用不存数据副本
- 学习状态按计划隔离：`word_state` PK 为 `(plan_id, word_id)`，含 status/stage/familiarity/due_date/streak/lapses
- 复习取全局到期词（跨计划求并集）；同词多计划到期时合并展示，答题后同步更新该词所有到期计划的 state
- 复习流水：`review_log` 带 plan_id 归属
- 评分三档（忘记/模糊/记得）：忘记→stage−1（clamp 0）、间隔×0.5、熟练度−30；模糊→不升、×0.7、−10；记得→+1、**+20**；间隔 = cycle[stage] × 熟练度系数(0.8~1.2)，熟练度 0~100；**周期阶梯 [1,2,4] 天，首考记得=熟练度40，3 次复习记得即掌握（约一周）**
- **单词档位（plan_item.priority，按计划隔离，2026-08-31 定稿）**：1档一次即会（任意一次「记得」即掌握，首考也算）/ 2档两次即会（熟练度≥60 且 stage≥1，忘会扣熟练度自然延后）/ 3档常规（原 stage 到顶+熟练度≥80）；掌握判定统一在 scheduler.masteryReached，记账时按词所属计划查 plan_item 取档
- **mastered 完全退出复习队列**（到期查询过滤）；数据保留、统计可见
- 会话通过规则（新词/复习统一）：记得直接过；模糊/忘记回队尾，需连续两次记得才通过（中途失败清零重计）；落库按最严重失败评分记账
- 会话内「已掌握」快捷入口（1/2档词）：详情页底部主色按钮，answerMastered 直接通过出列；落库 state=mastered/familiarity=100 + review_log 记 RATING_EASY 预留档（新词→激活计划、复习→该词所有到期计划），优先级高于本场失败评分

## 服务层结论（已定稿）

- 分层依赖只能向下：pages/components → services → domain(纯函数无 IO) → repos(DAO + SQLite 实现)；uni-app x 的 API 只出现在 repos/sqlite 与 UI 层
- 服务清单：TodayService(今日任务组装)、StudySession(背词会话)、WordEditorService(词卡 CRUD + 关联图查询)、ConjugationService(活用派生)、ImportService、BackupService
- 落库时机：会话结束统一落库；进行中评分暂存内存 + 快照到本地存储(session_draft)，异常退出重进可恢复或丢弃，主动放弃不落账
- 一次评分的提交事务 = 更新该词所有到期计划的 word_state + 写 review_log
- 「学新词」与「复习」为两个独立会话入口、两套队列
- 每日新词**不限制每日次数**：每次进「学新词」取下一批 dailyNew 个，学完可立即再取；countTodayFirstReviewed 仅用于首页「今日已学」统计
- 首页为成果统计视角（激活计划范围）：复习卡=到期数、学新词卡=今日已学；统计条=在学/已学/今日复习/总词数；后续加三色进度条（已掌握/学习中/未学+总词数）
- 同一时间仅一个计划激活，今日新词只从激活计划按 sort 取，切换即暂停旧计划

## 导入与词库（已定稿）

- **导入 JSON 格式说明见 [IMPORT.md](./IMPORT.md)**（字段表/匹配合并规则/示例）
- 基础词库：内置全量底库（base.db 随 app 打包于 static/assets），首次启动复制到应用数据目录
- 底库是构建时资产：由开发机上的加工脚本（tools/build-db）从原始词库数据生成，不手工维护；数据源可替换（开源词典/词表/自备文件），换源只重跑脚本
- **数据源定稿（2026-08-31，套餐一 + tomoshi 增强，verify.mjs 验证通过）**：JMdict_e 常用词（pri 标记，实得 20961，rK 罕用汉字形跳过如 する≠為る）+ Kanjium 音调（多值 75.5%，纯假名词按读音兜底）+ 程序派生罗马音 + xref/ant → 近义 1569/反义 344 + **tomoshi-dict-data 开放层（CC BY-SA 4.0，cache/tomoshi.db.zst 解压自动启用）**：中文释义（ent_seq 关联，前 4 义项×首 gloss"；"拼接，99.9%）+ 自他动词对 221 + JLPT/词频（extra_json）；动词 verb_type 100%（含名变 suru，conjugation.uts 支持落胆します 型名词形派生）；zh-meanings.json 仍可覆盖自定义释义；验证/检查脚本：verify.mjs（合规验证）、inspect.mjs（数据全貌）
- 加工脚本职责：表记/读音规范化、词性映射为枚举、verb_type 由辞书形+词性推导
- 词库升级只增不改：新词 INSERT OR IGNORE，已存在词条不覆盖（保护用户编辑与关联）
- 计划词表导入：仅支持 JSON；流程 = 解析 → 分层匹配（term+reading 精确 → 仅 term → 仅 reading 兜底）→ 预览页逐条确认（已匹配/多候选需选/将新建）→ 建计划并按文件行序生成 plan_item
- 导入 JSON 字段可选（仅 term 必填），未命中词导入时新建词条，缺失字段留空后续补全；**priority 字段可选（1/2/3，缺省 3），预览页行内档位标签可点按循环调整**
- **导入附加数据合并（2026-08-31）**：行内可选 sentences（text/translation）/notes（字符串数组）/relations（term+reading+note）；命中旧词时追加式合并——例句按 text、笔记按 content 全等去重后追加，词条本体（term/reading/meaning/pos）不覆盖；自由关联目标解析期自动匹配（精确→仅 term 首个→仅 reading 唯一），未命中新建目标词条再建 custom 关系，两词已有该关联则跳过；预览页行内显示「合并追加：例句 n · 笔记 n · 关联 n」
- **追加导入到已有计划（2026-08-31）**：预览页顶部「新建计划 / 追加到已有计划」模式切换；追加模式选目标计划（chips），词单 sort 接续现有最大值，已在计划中的词 INSERT OR IGNORE 跳过（保留学习状态与档位）但附加数据仍合并；不改目标计划参数与激活状态；场景=同一教材分课多次导入一个计划
- 备份导出：JSON 按依赖顺序 words → sentences/notes/relations → plans/plan_items（含 priority）→ word_states → review_logs，恢复时逆序导入（旧备份无 priority 按 3 档回退）

## UI 交互与题型（已定稿）

- 新词与复习两个会话交互完全同构：**正面表记词卡 → 点卡片进入词卡详情页（揭示答案，可编辑即时保存）→ 详情页底部悬浮三档评分（忘记/模糊/记得）→ 评分即返回背词页出下一词**，共用 study 页面与组件；区别仅队列来源（激活计划 new 词 / 全局到期）与结束记账
- 详情页评分回传机制：studySession 的 submitDetailRating/consumeDetailRating 模块级暂存 + study 页 onShow 消费
- v1 题型仅认读（日→中）；听音、拼写留作后期增强；拼写判定预留为平假名输入与 reading 比对
- 计划详情页词单支持搜索（表记/读音/释义）与状态筛选（全部/未学习/学习中/已掌握）
- **计划词单批量状态管理**：「管理状态」多选模式，批量标为已掌握（word_state UPSERT 为 mastered/familiarity=100，退出复习队列，不写 review_log）或恢复未学习（DELETE word_state，未学=无行的语义）
- **档位设置入口**：计划词单行内点档位标签循环切换 ①→②→③（即写库）；「管理状态」模式批量设档；导入 JSON priority 字段 + 预览页调整；背词页词卡显示档位徽章（①一次即会/②两次即会/③常规），1/2 档词详情页评分栏追加「已掌握」按钮
- 首考落库初始化：按最严重失败评分或记得走 applyFirstRating（记得→stage1 / 模糊→stage0×0.7 / 忘记→stage0×0.5）
- 词卡详情页分区：表记+读音+音调+词性+状态徽章 → 释义 → 例句(增删改) → 笔记(时间线) → 固定关联按类型分组（近义/反义/自他对/活用形表格仅动词显示） → 自由关联(带关联理由)
- 添加自由关联交互：搜索词库 → 选中词条 → 可填关联理由 → 建立 custom 关系
- **链式记忆（2026-08-31 定稿，灵感=孤单记忆法）**：首页入口（🔗）→ 自动随机挑激活计划中「已学且无任何自由关联」的孤单词作起点 → 主单词卡（🔊/快捷笔记）→ 搜索全词库选词 → 填理由建 custom 关联（即时落库，复用 addCustomRelation 查重）→ 所选词成为新主单词链继续，直到主动完成；跳过=换孤单词重开链；链路径仅会话内存展示不落库；无孤单词时空态提示；数据零新增（全复用 custom 关联 + 关联理由 + 笔记）
- 任何场景可编辑：会话中点词卡进详情页，编辑即时保存，返回会话不阻塞

## 目录结构

```
├─ App.uvue                    应用入口（setup 语法；onLaunch 接 initDatabase；保留模板双击返回退出）
├─ main.uts / index.html / platformConfig.json
├─ manifest.json               uni-app x 工程配置（appid __UNI__A4A160A）
├─ pages.json / uni.scss / .gitignore / .editorconfig
├─ pages/
│  ├─ splash/splash.uvue        开屏动画（Neo 风格，1.8s 后 reLaunch 首页；pages 第一项=启动页，navigationStyle custom）
│  ├─ index/index.uvue         今日总览（复习/新词两个入口）
│  ├─ study/study.uvue         背词会话（新词/复习共用，题面→翻面→四档）
│  ├─ word/detail.uvue         词卡详情+编辑
│  ├─ word/chain.uvue          链式记忆（孤单词串联建关联）
│  ├─ plan/list.uvue           计划列表（含导入入口）
│  ├─ plan/detail.uvue         计划详情（参数/进度/词单）
│  ├─ plan/import.uvue         导入预览（分层匹配结果逐条确认）
│  ├─ library/library.uvue     词库浏览搜索
│  └─ settings/settings.uvue   设置（周期参数/备份）
│  注意：pages.json 的 path 与 navigateTo URL 均不带 .uvue 后缀（模板约定）
├─ components/                 待建：WordCard / RatingBar / RelationList / SentenceEditor
├─ domain/                     纯函数层（无 IO）：types / scheduler / conjugation / format
├─ repos/                      DAO 接口：wordRepo / planRepo / stateRepo
│  ├─ sqlite/                  schema.uts（全部 DDL）/ sqlClient.uts（存储抽象）
│  │                           meibaoClient.uts（适配层）/ bootstrap.uts（启动链路+首启复制）
│  │                           assetCopy.uts（底库定位复制）/ wordRepoImpl / planRepoImpl / stateRepoImpl
│  └─ native/                  fileText.uts（content:// 文件读取）/ storage.uts（本地 KV 封装）
├─ services/                   today / studySession / wordEditor / importer / backup / audio
├─ uni_modules/meibao-Sqlite/  SQLite uts 插件（已导入；interface.uts 为其类型源）
├─ static/                     logo.png；assets/base.db 为打包基础词库（构建产物：20961 词，中文释义 99.9%，系统关联 2069）
└─ tools/build-db/             底库加工脚本（Node node:sqlite 零依赖，开发机运行；cache/ 缓存 JMdict_e.gz + accents.txt + tomoshi.db；zh-meanings.json 可选自定义释义；inspect.mjs 数据检查）
```

## 真人音频（已定稿）

- 来源：LanguagePod101 词典音频接口（真人录音，Yomichan/Anki 社区通用）按需在线拉取
- 存储：约定式关联，外部私有目录 `audio/<wordId>.mp3`（文件管理器可见；不进备份，可再生）
- 播放：MediaPlayer（repos/native/audio.uts，io 线程下载 + 主线程回调）
- 触发：背词展示词自动播（有缓存即播，无缓存后台静默下载下次生效）；背词页/词卡详情手动 🔊；计划详情可批量预下载

## 工具链现状（待办）

- 编译运行依赖 HBuilderX（本机已装 5.21+，目标设备 Android 真机）；SQLite 选型：meibao-Sqlite（免费/MIT/仅 Android），已导入 uni_modules；适配层 repos/sqlite/meibaoClient.uts（Promise 化 + sqlStr/sqlNum 转义 + toNum 行值转换 + 重复开库保护）。插件限制：无参数绑定、executeSql 的 insertId 恒 -1（取新 id 用 last_insert_rowid）；首启底库复制见 repos/sqlite/assetCopy.uts（APK assets static/assets/base.db → 应用数据库目录）
- 蒸汽模式（纯 js/ts）需在 manifest 可视化界面勾选开启；当前未开启（VDOM 模式，uts 强类型）
- UnoCSS 尚未接入（需在 HBuilderX 可编译验证后配置），页面暂用普通 class 样式
- 页面接通进度：全部页面已接真数据（三个 Repo 均有 SQLite 实现）；备份导出/恢复已实现（导出至 Android/data/<pkg>/files/backups/，恢复为清库重灌）；真人音频三入口已落地（自动播/手动喇叭/计划预下载）；词库数据管线已跑通（JMdict+Kanjium，20961 词）；待办仅剩增强项（中文释义/升级合并/UnoCSS 等）

## 规范

- **UI 设计系统（`feat/aurora-editorial-ui` 分支，2026-09-01 MuMu 实机调优）**：Aurora Editorial 氛围渐变编辑风——柔焦暮橙/暖金/雾蓝/薰衣草色场 + 暖白纸张面板 + 编辑式衬线标题/等宽微标签；`static/aurora-bg.png` 作为离线全屏氛围层（uvue Android 不稳定绘制复杂 CSS 渐变），长文本始终落在高对比实色面板上。`uni.scss` 保留 `$n-*` 与 `neo-card` 旧名作模板兼容，实际已切换为 1rpx 轻边界、柔和悬浮影、30rpx/22rpx 圆角与低饱和五色；按压仅轻微下沉/透明度反馈。全部页面已迁移，滚动区隐藏原生滚动条，导航/音频入口继续使用统一文字图形。原 Neo 版本保留在 `feat/ui-polish` 分支。
- 样式优先使用 UnoCSS 原子化类
- 所有文件修改需记录到 log.md
