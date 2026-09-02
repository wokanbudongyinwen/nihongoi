# 设计与路线图（nihongo-student）

> 本文档是完整版设计记忆：产品构想、全部决策及其取舍理由、当前进度、后续路线图。
> 供后续开发会话快速恢复上下文；精简版结论见 AGENTS.md，两处冲突时以本文为详注、AGENTS.md 为准绳同步更新。
> 最后更新：2026-08-28

## 一、产品构想（用户原始愿景）

- 个人自用的**日语**背单词 App，**完全本地运行、离线可用**，数据不出设备
- 自定义背词计划表，分为两个功能：
  - **学新词**：从计划表中取出自定义数量的新词背诵
  - **复习**：按周期和熟练度，对背过的词做周期性、有针对性的复习
- 词卡**任何场景可自由编辑**：管理例句、添加笔记、**自由关联任意其他词汇**（M:N，用户自建）
- **非自定义关联**与自由关联严格区分：近义词、反义词、自他动词对、动词活用形态（预置/系统性质）
- 用户工作习惯：一步一步讨论、逐项拍板后再动手

## 二、设计决策全景（含备选方案与取舍理由）

| # | 决策点 | 结论 | 备选与取舍 |
|---|--------|------|-----------|
| 1 | 平台 | uni-app x，目标 Android 真机 | 否决 PWA（数据在浏览器沙箱）、桌面（使用场景不符） |
| 2 | 存储 | SQLite（meibao-Sqlite uts 插件，免费/MIT/仅 Android） | 核心查询是词条图遍历，关系型最顺手；**自研 uts 插件为后备升级路线**（触发条件：转义/类型化痛点），SqlClient 接口已隔离，替换成本仅适配层一处 |
| 3 | 复习算法 | 固定周期表为主 + 熟练度微调 | 否决 SM-2/FSRS（用户心智模型是"周期+熟练度"）；算法全部隔离在 domain/scheduler.uts 纯函数，将来可整体替换 |
| 4 | 词库结构 | 两层：基础词库存数据 + 计划层只存引用（plan_item 有序队列） | 导入不产生数据副本、天然去重；同词多计划共享词卡编辑 |
| 5 | 词条关联 | 统一 word_relation 表，relation_type + is_system 区分固定/自由 | 否决分表（查一个词的所有关联要多表 UNION，加新类型要改表） |
| 6 | 动词活用 | 不落库，由 verb_type 纯计算派生，不规则存 extra_json override | 否决存关联/存数据（冗余）；自他动词对是两个词条，走 word_relation |
| 7 | 学习状态 | **按计划隔离**：word_state PK(plan_id, word_id) | 用户明确选择（否决全局共享），支持"同一批词用不同计划反复背" |
| 8 | 复习取词 | **全局到期词**（跨计划并集）；同词多计划到期**合并展示 + 答题后同步记账**（更新该词所有到期计划的 state） | 记忆本体是同一个，计划只是记账本；否决不去重（重复背）与只记最急（进度感知差） |
| 9 | 评分 | **三档（2026-08-28 由四档简化）：忘记 / 模糊 / 记得**。忘记→重置 0/×0.5；模糊→不升/×0.7；记得→+1；模糊/忘记的词回队尾，需**连续两次记得**才通过，落库按最严重失败评分记账 | 四档（忘记/困难/良好/简单）曾用后简化，EASY 档预留 |
| 10 | 落库时机 | **会话结束统一落库** + session_draft 本地草稿快照 | 用户要"整场可撤销"语义；草稿机制对冲异常退出丢账风险；主动放弃不落账 |
| 11 | 会话组织 | 新词/复习**两个独立会话**，交互**完全同构**：正面表记词卡 → 点卡片进词卡详情页（揭示答案且可编辑）→ **详情页底部悬浮三档评分**，评分即返回出下一词（回传机制：studySession 模块级暂存 + study 页 onShow 消费） | 用户选首考式；2026-08-28 定稿此交互（编辑即时保存天然满足）；同构使 study 页一套组件复用 |
| 12 | 激活计划 | 同一时间仅一个激活，新词只从激活计划按 sort 取 | 否决多计划并行（首页与统计复杂） |
| 12b | 每日新词语义 | **不限制每日次数**：每次进「学新词」取下一批 dailyNew 个新词，学完可立即再取下一批；dailyNew 只是批量大小（可中途改，即时生效）。~~每日配额方案~~（曾实现后按用户要求移除；countTodayFirstReviewed 保留用于首页「今日已学」统计） | 用户拍板（2026-08-28 二次确认） |
| 12c | 首页数据展示 | **成果统计视角**（激活计划范围）：复习卡=当前到期数、学新词卡=今日已学数；统计条=在学（learning+reviewing）/已学（非 new）/今日复习（去重）/总词数；副行=已掌握/未学 | 用户拍板（2026-08-28）；后续增强：三色进度条（已掌握/学习中/未学，末尾展示总词数） |
| 13 | 题型 | v1 仅认读（日→中）；拼写判定**预留**平假名与 reading 比对；听音后期（依赖系统 TTS 验证） | 用户选择最简起步 |
| 14 | 导入 | 仅 JSON；分层匹配（term+reading→仅 term→仅 reading→新建）+ **预览页逐条确认**；**附加数据追加合并（2026-08-31）**：行内可选 sentences/notes/relations，命中旧词时例句按 text、笔记按 content 去重后追加（本体不覆盖），自由关联目标自动匹配（未命中新建目标词再建 custom 关系，已有则跳过）；**追加导入（2026-08-31）**：预览页可切「新建计划 / 追加到已有计划」，追加时 sort 接续现有最大值、已在计划中的词跳过（保留状态与档位）但附加数据仍合并、不改目标计划参数与激活状态 | 否决自动静默导入（错一词天天背错）与 CSV/TXT（转义与歧义）；合并语义=只增不改，与词库升级/备份哲学一致；关联目标不做多候选交互（预览页不可选，错了删关联成本低） |
| 15 | 底库 | 构建时资产：tools/build-db 脚本生成 base.db，打包 static/assets，首启复制 | 数据源可替换（换源只重跑脚本，App 端零改动）；**数据源已定稿（2026-08-31，"套餐一"+tomoshi 增强，verify.mjs 验证通过）**：JMdict_e 常用词（pri 标记过滤，实得 20961 词，rK 罕用汉字形跳过）+ Kanjium 音调（多值 75.5%，含按读音兜底）+ 程序派生罗马音 + xref/ant → 近义/反义系统关联（1569/344）+ **tomoshi-dict-data 开放层（CC BY-SA 4.0，cache/tomoshi.db）：中文释义（ent_seq 关联，99.9% 覆盖，前 4 义项×首 gloss 精简）+ 自他动词对 221 + JLPT 等级/词频（存 extra_json）**；动词 verb_type 覆盖 100%（名变 suru 含名词形，conjugateSuru 适配落胆します 型） |
| 16 | 词库升级 | 只增不改：新词 INSERT OR IGNORE，已存在词条不覆盖 | 唯一安全策略，保护用户编辑与关联 |
| 17 | 备份 | JSON 按依赖顺序：words → sentences/notes/relations → plans/plan_items → word_states → review_logs，恢复逆序 | 含 SCHEMA_VERSION |
| 18 | 单词档位 | **plan_item.priority 三档（2026-08-31 定稿，按计划隔离）**：1档一次即会（任意一次「记得」即掌握，首考也算）/ 2档两次即会（熟练度≥60 且 stage≥1）/ 3档常规（原判定不变）；实现 = scheduler.masteryReached 统一掌握判定，记账时按词所属计划查 plan_item 档位（复习跨计划各按各档）；叠加手动「已掌握」快捷入口（1/2档词详情页评分栏按钮，answerMastered 直接通过，落库 mastered+RATING_EASY 日志） | 用户需求：给计划单词加重要程度；三方案讨论后选「自动门槛 + 手动按钮结合」，否决纯熟练度加权（熟练度只是间隔系数，不改变掌握判定）；2档节奏拍板「2 次记得（约3天）」；设置入口拍板「行内循环切换 + 批量设档 + 导入 JSON priority 字段 + 背词页徽章展示」 |
| 19 | 链式记忆 | **场景化产关联工作台（2026-08-31 定稿，灵感=孤单记忆法）**：随机挑激活计划「已学且无任何 custom 关联」的孤单词起点（pickLonelyWord）→ 搜索全词库选词 → 建关联（理由可选）→ 所选词成为新主单词链式生长，直到主动完成；关联/笔记即时落库无草稿；链路径仅会话内存展示不落库；无孤单词空态；入口=首页 🔗 | 数据模型零新增（全复用 word_relation custom + note + 笔记表），词卡详情/复习自然消费这些关联；讨论拍板：已学口径=全部非 new（学习中+复习中+已掌握）、孤单词随机、入口在首页；否决链整体存储（两两关联已含全部信息，链是过程视图） |

## 三、调度规则备忘（domain/scheduler.uts 的语义，2026-08-28 加速改版）

- 周期阶梯默认 `[1,2,4]` 天，存 plan.cycle_json；目标节奏：**一个词 3 次复习、约一周掌握**
- 间隔 = `cycle[stage] × 熟练度系数(0.8~1.2) × 评分附加系数`
- **评分三档（忘记/模糊/记得）**：忘记→stage−1（clamp 0）、熟练度−30、lapses+1、×0.5；模糊→不升、−10、×0.7；记得→+1、**+20**（EASY 档预留未用）
- 首考初始化：记得→stage1/**熟练度40**；模糊→stage0/20/×0.7；忘记→stage0/0/×0.5
- **mastered 判定**：stage 到周期顶 且 熟练度≥80 且 本题记得 → 标准路径为首考+3 次复习记得（第 0/1/3/6 天左右）
- **档位放宽掌握判定（2026-08-31，决策 18）**：1档任意一次「记得」即掌握（首考也算）/ 2档 熟练度≥60 且 stage≥1（即两次记得，忘了扣熟练度自然延后）/ 3档 原判定；统一入口 scheduler.masteryReached，首考与复习共用
- **会话内「已掌握」快捷入口（1/2档词）**：详情页评分栏主色按钮 → submitDetailMastered 回传 → answerMastered 出下一词；落库 state=mastered/familiarity=100 + review_log 记 RATING_EASY（新词→激活计划、复习→该词所有到期计划），优先级高于本场失败评分；草稿含 manualMastered 可恢复
- **mastered 完全退出复习队列**（listDueStates 过滤，用户决策 2026-08-28）：数据保留、统计可见，不再进到期队列；同词在新计划中重新从头学
- **会话通过规则（新词/复习统一，studySession）**：记得→直接通过；模糊/忘记→放回队尾，需**连续两次**记得才通过（中途再失败清零重计）；落库按**最严重失败评分**记账（从未失败按记得）

## 四、当前进度（截至 2026-08-28）

**已完成**
- 五域设计全部定稿（数据模型/服务层/导入词库/UI 题型/工具链）
- 标准工程迁移（HBuilderX 创建 + meibao-Sqlite 已导入 uni_modules）
- 真机验证通过：编译、数据库初始化、词库页搜索、词卡详情、base.db 首启复制（8 种子词可见）
- domain 层可用：types / scheduler / conjugation（五段/一段/サ变/カ变 9 形态派生，内置行く→行って）
- repos/sqlite：schema.uts、sqlClient.uts（execute 返回 ExecResult）、meibaoClient.uts（适配层）、bootstrap.uts（启动链路）、assetCopy.uts（底库三层定位复制）、wordRepoImpl.uts、planRepoImpl.uts
- repos/native：fileText.uts（content:// 文件读取）
- wordRepo / planRepo SQLite 实现完成（精确匹配、今日新词取词、激活切换、建计划事务）
- 导入链路完成：chooseFile 选 JSON → readTextFile → parseAndMatch 分层匹配 → 预览页逐条确认（多候选点选/将新建/参数可改）→ 建计划（无激活计划时自动激活）
- 背词闭环代码完成：stateRepo SQLite 实现、studySession 草稿（快照/恢复/清除）+ commitSession 统一落库（每词取末次评分、首考对激活计划初始化、复习跨计划同步记账、单事务）、today 组装、study 页真队列、首页真计数
- 词库页、词卡详情页、计划列表页、计划详情页（词单/参数编辑）、导入预览页、背词会话页、今日总览已接真数据
- services：wordEditor / importer / studySession（含落库）/ today 全部可用；backup 骨架

**未接通（下一步主战场）**
- 词库升级合并（INSERT OR IGNORE）未做
- 备份**待真机验证**（导出文件在 Android/data/<pkg>/files/backups/；恢复为清库重灌）
- 真人音频**待真机验证**（LanguagePod101 国内连通性待实测）
- **新 base.db 待真机验证**（需清除应用数据让首启复制生效；预期词库页 2 万词、多数词带音调/罗马音，详情页有近义/反义分区）
- 中文释义当前为英文 gloss（zh-meanings.json 未提供，后续 LLM 翻译方案再议）

**待用户操作**
- 真机验证备份：设置 → 导出备份（记下弹窗路径）→ 改动一些数据 → 从备份恢复 → 数据回到导出时点
- 真机验证新词库：清除应用数据（或卸载重装）→ 首启复制新 base.db → 词库页搜索（如「食べる」带音调/罗马音）→ 词卡详情看近义/反义分区

## 五、路线图（建议顺序）

1. ~~真机验证启动链路~~（完成）
2. ~~wordRepo SQLite 实现 → 词库页搜索、词卡详情接真数据~~（完成）
3. ~~base.db 生成 + 首启复制~~（链路完成；**真实数据源仍待选型**，当前 8 种子词）
4. ~~planRepo + 导入链路~~（完成，真机验证通过）
5. ~~stateRepo + studySession 落库：草稿快照/会话恢复/结束事务（同步记账）→ 首页今日任务接数据~~（完成，真机验证通过）
6. ~~词卡编辑完整闭环：例句/笔记 CRUD、自由关联（搜索+理由）、关联词下钻~~（完成）
7. ~~BackupService 导出/恢复~~（代码完成，待真机验证；导出全量 JSON 至 Android/data/<pkg>/files/backups/，恢复为单事务清库重灌）
7b. ~~词库数据源管线（tools/build-db）~~（完成，2026-08-31：JMdict 常用 2 万 + Kanjium 音调 + 派生罗马音 + 近义/反义系统关联；base.db 已复制到 static/assets，待真机验证）
8. 增强：词库升级合并（INSERT OR IGNORE）、听音/拼写题型、统计页、组件抽取（WordCard/RatingBar/RelationList/SentenceEditor）
9. **UI/UX Aurora 分支改造（主体完成，2026-09-01 MuMu 实机复验）**：`feat/aurora-editorial-ui` 采用 Aurora Editorial（氛围渐变编辑风），由 ui-ux-pro-max 的 Gradient Mesh / Aurora Evolved、Editorial Grid、Japanese Elegant 字体建议综合而来。视觉结构 = 暮橙/暖金/雾蓝/薰衣草柔焦色场 + 暖白高对比内容面板 + 日文衬线主标题 + 等宽微标签；主卡 1rpx 轻边界与柔影，按压只做轻微下沉。因 uvue Android 对复杂 CSS 渐变绘制不稳定，使用 ImageGen 生成的 `static/aurora-bg.png` 离线铺底，所有核心文字仍放在实色面板上。首页、背词、词卡详情/评分栏、链式记忆、计划列表/详情/导入、词库、设置、开屏页均已迁移并经 MuMu 走查；原 Neobrutalism 版本保留在 `feat/ui-polish` 分支。
10. ~~单词档位功能（plan_item.priority 三档 + 已掌握快捷入口）~~（代码完成 2026-08-31，待真机验证：schema v3 迁移、行内/批量设档、导入 priority 字段、1档首考记得即掌握、2档两次记得掌握、「已掌握」按钮落库）
11. ~~导入附加数据合并（例句/笔记/自由关联追加式合并）~~（代码完成 2026-08-31，待真机验证：命中词去重合并、关联目标自动匹配/新建、预览页附加数据摘要）
12. ~~追加导入到已有计划（分课多次导入同一计划）~~（代码完成 2026-08-31，待真机验证：模式切换、计划 chips 选择、追加后 sort 接续/重复词跳过/附加数据仍合并、追加后新词队列继续往后取）
13. ~~链式记忆（孤单词串联建关联工作台）~~（代码完成 2026-08-31，待真机验证：首页入口、孤单词随机起点、搜索候选标记、建关联后主单词切换链生长、快捷笔记、跳过/完成、无孤单词空态）

### 首页双页手札（2026-09-02）

- 首页改为原生 swiper 两页：学习页只展示问候、激活计划、复习/学新词和可下钻统计；工具页提供链式记忆、计划、词库、设置四个目录入口。
- 取消首页原生“今日”导航栏，保留系统状态栏并预留顶部/底部安全区。每页为一张整页圆角纸卡，内部去除多层投影；短屏可在卡片内纵向滚动。
- 左右滑动与底部“学习 / 工具”点击切换并存，无自动轮播、不循环。返回工具页时保留当前分页。

## 六、遗留决策点（未定，需与用户讨论）

1. ~~基础词库数据源~~（已定稿 2026-08-31：套餐一 = JMdict 常用 2 万 + Kanjium 音调 + 派生罗马音 + 近义/反义关联；同日 tomoshi 开放层补齐中文释义/自他对/JLPT/词频，中文释义方案随之解决）
2. ~~中文释义补全方案~~（已解决 2026-08-31：tomoshi-dict-data zh_defs，ent_seq 关联，20950/20961 覆盖；zh-meanings.json 仍保留作自定义覆盖入口）
3. 蒸汽模式是否开启（建议 VDOM 模式先编译通过再说）
4. UnoCSS 接入方式（HBuilderX 工程配 vite 插件待验证）
5. 导入预览页的多候选选择交互细节
6. 自研 uts SQLite 插件的触发时机

## 七、协作与工程备忘

- 所有文件修改必须记录 log.md（按文件分组、同文件倒序）；重要结构变更同步 AGENTS.md 与本文档
- uts 强类型：慎用 TS 特性（解构、字面量联合类型等）；domain 层改动需真机编译验证
- 已趟平的 uts→kotlin 编译坑：①被闭包捕获/模块级的可变变量判空后不能 smart cast，一律先存 const 局部副本；②页面生命周期回调（onLoad 等）不支持 async（error17），异步逻辑放到独立 async 函数中调用；③java 原生数组（如 AssetManager.list 返回 String[]）在 uts 中无 .length/join、下标须 Int、需判空——用 `names.size` + `for (let i: Int = 0; ...)` 遍历；④setup 内 const 箭头函数必须**先声明后引用**（同 Kotlin 词法顺序），互相调用的函数注意排列顺序；⑤冷启动竞态：首页 onLoad 早于 onLaunch 异步 initDatabase 完成，访问数据库前须 `await awaitDatabase()`；⑥模板插值不能直接调用**模块导入**的函数（仅 setup 本地函数可调），导入函数须包一层本地无参函数；⑦`UTSAndroid.getDispatcher(...).async` 的回调参数须为可空类型（`any | null`），非空 `any` 报 Function1 参数不匹配；⑧**uni-app x 不自动注入 uni.scss 的 scss 变量**（与 vue2/3 不同），页面 `<style lang="scss">` 顶部须显式 `@import '相对路径/uni.scss';`，否则 vite:css 报 Undefined variable；⑨**uts 对象字面量必须显式标注类型**（`const out: MyType = {...}`），无注解会被编译为 UTSJSONObject——赋给/返回给具体 type 时编译不报错但**运行时 ClassCastException**，且会被上层 catch 吞成误导性报错（2026-08-31 案例：导入报「JSON 解析失败」，真凶是 parseExtras 返回值漏注解）；⑩**uvue 样式不支持 @keyframes 与 animation-\* 属性**（app-uvue-css 报 ERROR: Selector `0%` is not supported / animation-name not standard），动画实现 = transition-property(duration/timing-function) + JS 定时器切换状态类（开屏页范式：logo 弹入/标题上浮/三色点轮换）；⑪**模板表达式里函数必须显式调用**（`accentText() != ''`），裸函数名与字符串比较报 kotlin `Operator '!=' cannot be applied to 'Function0<String>' and 'String'`；⑫**App-Android 上带模糊半径的 box-shadow 会把阴影外扩区计入视图的触控边界**——后置兄弟卡片的外扩帧会盖住前一张卡片底部条带、吃掉贴底按钮的点击（2026-09-01 案例：Aurora 柔影 0/16/44rpx 致词卡「+ 添加例句 / + 添加笔记」与链式记忆「+ 笔记」完全无响应，而同页卡片顶部/中部的「编辑 / 修改 / 筛选 chips」正常；旧版 2rpx 硬影外扩可忽略故无此问题）；约束=阴影偏移+模糊半径须小于卡片间 margin（token 已收敛为 $n-shadow 6/18rpx、$n-shadow-sm 4/12rpx，见 uni.scss 注释）
- pages.json 的 path 与 navigateTo URL **不带 .uvue 后缀**（本工程模板约定）
- meibao-Sqlite 无参数绑定：SQL 拼接必须走 meibaoClient 的 sqlStr/sqlNum；行值取数用 toNum；**executeSql 的 insertId 恒为 -1**，取新行 id 用插入后 `SELECT last_insert_rowid()`（同连接顺序 await，安全）
- 首启底库复制机制（assetCopy.uts）：dev 标准基座运行时 static 资源由 HBuilderX 同步到**设备文件系统**（用官方 `UTSAndroid.getResourcePath('/static/...')` 解析，不在 APK assets）；正式打包后在 APK `assets/apps/<appid>/www/static/...`。三层定位 + 失败诊断
- build-db 用 Node 内置 node:sqlite（v22.5+），零依赖；生成时不设 WAL，close 后单文件自包含便于打包；**node:sqlite 无 db.transaction()**，事务用 `db.exec('BEGIN'/'COMMIT'/'ROLLBACK')`；下载用 curl + 多源镜像回退 + minSize 内容校验（jsdelivr 会回 89B 错误页）；GitHub raw 国内走 gh-proxy.com 镜像，Kanjium 音调真实路径为 `data/source_files/raw/accents.txt`（不是仓库根 accents.txt）
- 分层依赖只能向下：pages/components → services → domain → repos；uni-app x API 只出现在 repos/sqlite 与 UI 层
