# 文件修改日志

## Aurora Editorial 全项目 UI 分支改造（2026-09-01）

### uni.scss + static/aurora-bg.png

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改/新增 | 设计 token 从 Neo 硬描边体系切换为 Aurora Editorial：暖白纸张底、暮橙/暖金/雾蓝/鼠尾草/薰衣草低饱和色、1rpx 轻边界、柔和悬浮影、衬线标题与等宽微标签；使用内置 ImageGen 生成 9:16 柔焦色场并作为全页面离线氛围层 | 复现参考图的 Gradient Mesh / Aurora Evolved 氛围，同时绕开 uvue Android 不稳定绘制复杂 CSS 渐变的问题 |

### pages/index/index.uvue + pages/splash/splash.uvue + pages/study/study.uvue + pages/word/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | 首页改为编辑式日期/计划/统计网格与暮橙、暖金主入口；开屏改为柔焦封面式字章；背词页改为大留白纸张词卡；词卡详情改为暮色页头、实色阅读分区和轻量评分底栏 | 优先建立每日入口、沉浸学习与详情阅读三个核心体验样板，并保持文字高对比 |

### pages/word/chain.uvue + pages/plan/list.uvue + pages/plan/detail.uvue + pages/plan/import.uvue + pages/library/library.uvue + pages/settings/settings.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | 链式记忆、计划、导入、词库与设置统一迁移到氛围底图 + 暖白内容面板；标题采用衬线层级，标签采用等宽层级，输入框/状态/主操作改为轻边界和低饱和语义色 | 完成全项目视觉一致性，信息密集页不让渐变直接承载长文本 |

### AGENTS.md + DESIGN.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | 记录 Aurora 分支的设计语言、离线背景实现、实机约束与原 Neo 分支保留位置 | 防止后续开发混用两套视觉规范 |

## Git 首次建仓忽略规则（2026-09-01）

### .gitignore

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | 忽略 `tools/build-db/cache/` 可再生成的数据源缓存，保留应用运行所需的 `static/assets/base.db` | 构建缓存包含 570MB 的 tomoshi.db，超过 GitHub 单文件限制且不属于源码交付物 |

## 首页图标、进度条与开屏跳点修复（2026-09-01）

### pages/index/index.uvue + pages/splash/splash.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | 首页底部导航统一使用同字面框的「链 / 计 / あ / 设」文字图形，消除不同 Unicode 字形的基线和视觉重心偏差；进度条三段显式等高、移除段间空隙并为未学习段单独填色；开屏跳点容器高度由 30rpx 增至 48rpx | MuMu 实机中链式记忆与计划图标视觉未对齐，进度条段间露底且未学习段像未填充，跳点上移 14rpx 时总高度超过容器并被裁切 |

## UI 阴影与样式层叠修复（2026-09-01）

### uni.scss + pages/index/index.uvue + pages/study/study.uvue + pages/splash/splash.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | Neo 主/小投影从 4px/3px 改为 4rpx/3rpx，按压位移同步使用 rpx 并收起投影；调整首页、背词页、开屏页通用 Neo 类与页面修饰类的顺序，确保黄色 hero、彩色入口、圆形徽章等页面样式不会被通用白底/圆角覆盖 | MuMu 480dpi 实机截图显示 px 投影被密度放大成厚黑底座，且通用类覆盖了部分页面色块 |

## UI 全局一致性第一批迁移（2026-09-01）

### uni.scss + pages/settings/settings.uvue + pages/library/library.uvue + pages/plan/list.uvue + pages/word/chain.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | 主/小投影继续收敛为 3rpx/2rpx；设置、词库、计划列表、链式记忆迁移到统一米白底、黑色描边、短硬投影和黄/蓝/绿/紫语义色，补充触控按压态、描边输入框与 44px 级触控区域；链式页用一致的文字图标替换音频/完成 emoji | MuMu 截图显示四页仍停留在旧蓝白视觉，与首页风格割裂；按 ui-ux-pro-max 建议统一移动端触控反馈、对比度和圆润卡片层级 |

## UI 全局一致性第二批迁移（2026-09-01）

### pages/index/index.uvue + pages/plan/detail.uvue + pages/plan/import.uvue + pages/word/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | 首页底部混合 emoji 改为统一的圆形文字图形标识；计划详情、导入预览、词卡详情迁移 Neo token，表单/筛选/状态/档位/评分按钮建立统一描边与语义色体系，关键操作增加 120ms 按压反馈，信息密集列表保持白卡与细分隔以降低视觉噪声 | 完成剩余高密度页面的整体一致性迁移，避免彩色卡片和旧蓝白控件混用 |

### pages/study/study.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | 背词页音频 emoji 改为黄色描边圆形「音」按钮，并复用轻按压反馈 | 与首页、词卡、链式页的统一文字图形标识保持一致 |

### uni.scss + pages/plan/detail.uvue + pages/word/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | Neo 主/小投影最终收敛为 2rpx/1rpx，按压态完全收起投影；所有内容滚动区隐藏原生滚动条，计划详情与词卡滚动容器显式铺米白底；词卡把编辑移到标题行、状态移到词性行，罗马音弹性占位，避免音频/编辑按钮挤压文字 | MuMu 二轮截图发现详情页右侧白条与词卡元信息拥挤，且黑色投影仍略重 |

### AGENTS.md + DESIGN.md + uni.scss

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-09-01 | 修改 | UI 规范与路线图同步为全页面 Neo 迁移完成、2rpx/1rpx 投影、文字图形图标、隐藏原生滚动条，并记录 MuMu 480dpi 实机调优结论 | 防止后续开发沿用过期的 6rpx 投影和“其余页面待迁移”状态 |

## Neo 卡片通用类封装（2026-08-31）

### uni.scss + pages/index/index.uvue + pages/study/study.uvue + pages/splash/splash.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | uni.scss 封装 .neo-card（白底+3rpx 黑边+4px 硬投影+20rpx 圆角）与 .neo-card-sm（14rpx 圆角+3px 投影）通用类；首页 hero/panel×2/入口卡×2/nav×4、背词页词卡/结束徽章/按钮×2、开屏 logo 块共 13 处迁移为挂类用法，页面类只保留背景色/圆角覆盖（如 done-badge 覆盖圆形）与布局属性，删除各处重复的 border/box-shadow 五行组 | 用户建议：以 hero（问候卡）与统计卡样式为基准封装复用 |

## Neo 投影单位修复（2026-08-31）

### uni.scss + pages/index/index.uvue + pages/study/study.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | box-shadow 的 rpx 单位在 uvue 渲染偏窄（视觉像按压态），投影一律改 px 固定单位：$n-shadow = 4px 4px 0px、新增 $n-shadow-sm = 3px 3px 0px（nav/done 按钮）；.press 按压位移同步改 translate(3px,3px)；首页 nav 与背词页按钮投影改走 $n-shadow-sm 变量，全项目投影无 rpx 残留 | 用户反馈：各按钮黑边下阴影太窄、学新词右侧阴影不对 |

## 开屏/链式页编译错误修复（2026-08-31）

### pages/splash/splash.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 重写动画实现：uvue 不支持 @keyframes/animation-*（ERROR: Selector `0%` is not supported），降级为 transition-property + JS 定时器切态——logo 弹入/标题上浮（onReady 后 50/350/500ms 切 -in 类）、三色点 220ms interval 轮换抬起（0→1→2→全平），reLaunch/onUnload 清理 interval；动画效果不变 | HBuilderX 编译报错 |

### pages/word/chain.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | ①doSearch/cancelPick 前移到 pickStart/onSearch 之前（坑④：error18 找不到名称）；②模板 accentText 裸函数改 accentText() 显式调用（kotlin: Operator '!=' cannot be applied to 'Function0<String>' and 'String'），v-if 改 reading/accentText 任一非空 | 同上 |

### DESIGN.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 编译坑追加⑩（uvue 无 @keyframes/animation，动画=transition+JS 切态）与⑪（模板表达式函数必须显式调用） | 沉淀踩坑记录 |

## 开屏动画（2026-08-31）

### pages/splash/splash.uvue（新增）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 新增 | Neo 开屏页：黄色方块「語」logo 弹入（pop-in 600ms）→ 标题「背单词」/副标题「日本語単語帳」上浮淡入（fade-up，延迟 300/450ms）→ 底部红黄绿三色点循环跳动（dot-jump 700ms infinite，150ms 递增 delay）；@keyframes + animation 分属性写法；1.8s 后 reLaunch 到首页（覆盖冷启动数据库初始化） | 用户需求：开屏动画 |

### pages.json

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | pages 第一项改为 splash 启动页（navigationStyle custom 全屏无导航栏），index 顺延 | 同上 |

## UI 二版：Neubrutalism 设计系统（2026-08-31，ui-ux-pro-max 生成）

### uni.scss（Neo token）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 新增 $n-* Neo token：ink 黑描边/米白底/黄红蓝绿紫高饱和五色/cream 浅米；$n-bw 3rpx 黑边 + $n-shadow 6rpx 硬投影；.press（按压位移 4rpx）+.pressable（transform 120ms 过渡）；旧 $c-* 保留给未改版页面增量迁移 | 用户需求：国外 app 风格/动画/颜色更丰富/扁平化 |

### pages/index/index.uvue（Neo 改版）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 黄色 hero 块（黑边+硬投影+黑字）；进度条白底黑边外壳+三色内条+图例点黑边；入口卡红（复习）/黄（学新词）色块黑字；统计卡彩色数字（蓝/绿/红/黑）；底部四色块导航（紫链式/蓝计划/绿词库/白设置）；所有可点元素 hover-class 按压动画 | 同上 |

### pages/study/study.uvue（Neo 改版）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 模式胶囊双色（复习红/学新词黄，modeChipClass）；进度条黑边白底蓝条加粗 24rpx；词卡白底 3rpx 黑边+硬投影+按压动画；档位徽章色块化（①绿/②黄/③米，黑边黑字）；音调胶囊米底黑边；结束徽章绿色块黑边投影、按钮黄底黑字 | 同上 |

### pages.json

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 全局导航栏与窗口背景 #F5F6F8 → #FAF6EE（米白，与 $n-bg 一致） | Neo 底色统一 |

## 链式记忆功能（2026-08-31）

### repos/planRepo.uts + repos/sqlite/planRepoImpl.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 新增 pickLonelyWord(planId)：已学（status != new）且双向 NOT EXISTS 任何 custom 关联的「孤单词」，ORDER BY RANDOM() 随机取 1，全部串完返回 null | 用户需求：链式记忆法自动选无关联词起点 |

### pages/word/chain.uvue（新增）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 新增 | 链式记忆页：顶部链路径横条（本次会话内存视图）→ 主单词卡（表记/读音/音调/释义 + 🔊 + 已有关联数 + 快捷加笔记即时落库）→ 搜索全词库选词（searchWords 四字段模糊）→ 候选标记「当前主词/已关联」→ 确认区（主↔候选 + 关联理由可选）→ addCustomRelation 即时落库 → 所选词成为新主单词链继续；跳过=换孤单词重开链；完成=退出；无孤单词空态提示 | 同上（讨论定案：已学全部非 new / 随机 / 首页入口） |

### pages.json + pages/index/index.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | pages.json 注册 pages/word/chain（导航栏「链式记忆」）；首页底部入口行首位加 🔗 链式记忆 | 同上 |

## 计划词单渲染分页（2026-08-31）

### pages/plan/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 词单渲染层滚动分页：数据仍全量内存加载（搜索/状态筛选逻辑不变），v-for 只渲染前 renderCount 条（每页 50），scroll-view @scrolltolower 追加；搜索/筛选切换重置回 50；底部「上拉加载更多（x / y）」提示；全选当前列表仍作用于完整筛选结果 | 原为全量渲染，分课追加到数千词后 scroll-view 节点过多会卡顿 |

## 导入报「JSON 解析失败」修复（2026-08-31）

### services/importer.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | parseExtras 返回值补显式类型注解 `const out: ImportExtras = {...}`（原无注解被 uts 编译为 UTSJSONObject，调用方按 ImportExtras 取属性时运行时 ClassCastException，被 doParse 的 catch 吞成「JSON 解析失败」toast；已对照 unpackage Kotlin 产物 index.kt:4094 确认） | 用户反馈导入标日第9课词表（128 词含 sentences/notes/relations）失败；Node 校验文件本身合法后定位到代码 |

### DESIGN.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 编译坑追加第⑨条：uts 对象字面量必须显式标注类型 | 同上（沉淀踩坑记录） |

## 追加导入到已有计划（2026-08-31）

### repos/planRepo.uts + repos/sqlite/planRepoImpl.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 新增 appendPlanItems（sort 接续 COALESCE(MAX(sort),-1)+1，INSERT OR IGNORE 跳过已在计划中的词，单事务） | 用户需求：同一教材分课多次导入同一计划 |

### services/importer.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 抽取 resolveSelections（词选定 + 附加数据落库，新建/追加共用）；新增 appendToPlanFromImport（追加不改计划参数与激活状态，附加数据仍合并） | 同上 |

### pages/plan/import.uvue（导入模式切换）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 顶部「新建计划 / 追加到已有计划」模式切换 chips；追加模式显示目标计划选择 chips（onLoad 加载 listPlans）+ 说明，隐藏计划名/新词日输入；确认按钮文案与落库分支区分，未选计划时提示 | 同上 |

### IMPORT.md / AGENTS.md / DESIGN.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | IMPORT.md 加两种导入模式说明与注意事项（planName/dailyNew 仅新建生效、复习全局/状态按计划隔离）；AGENTS.md 导入节与 DESIGN.md 决策 14/路线图 12 同步 | 同上 |

## IMPORT.md（导入格式说明）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 新增 | 计划词表导入 JSON 格式说明文档：顶层/词行/例句/笔记/自由关联字段表、档位说明、分层匹配与追加合并规则、完整与最小示例、注意事项（幂等性/仅 term 命中忽略 reading/写法差异并存） | 用户要求生成导入格式说明文件 |

## 导入附加数据合并（2026-08-31）

### services/importer.uts（附加数据合并）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | ImportRow 扩展 sentences/notes/relations 三组附加数据；parseExtras 解析（例句 text 必填、笔记字符串数组、关联 term+reading+note，关联目标解析期自动匹配：精确→仅 term 首个→仅 reading 唯一，未命中标记新建）；applyRowExtras 追加式落库——命中旧词 merge=true 先 getWordDetail 取旧例句/笔记做 text/content 全等去重后追加（词条本体不覆盖），新词条直接写入；关联目标未命中走 ensureTargetWord 新建（同批 targetCache 去重），addCustomRelation 已存在则跳过（note 不覆盖） | 用户需求：导入词含例句/笔记/自由关联时与旧词合并而非丢弃 |

### pages/plan/import.uvue（合并预览）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 行内附加数据摘要行（绿色小字「合并追加：例句 n · 笔记 n · 关联 n」，新词显示「将写入：」）；顶部 hint 补充合并语义说明 | 导入前可见将合并的附加数据 |

### test-import-n5.json

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 見る 行改为 priority:2 + 示例例句（映画を見る）+ 笔记 + 自由关联（飲む，库内精确命中），演示命中词合并 | 验证附加数据合并链路 |

## 单词档位功能（priority，2026-08-31）

### domain/types.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 新增 PRIORITY_EASY/MID/NORMAL 常量（1 一次即会 / 2 两次即会 / 3 常规）；PlanItem 加 priority 字段 | 用户需求：计划单词三档重要程度 |

### domain/scheduler.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 掌握判定参数化：masteryReached 统一判定（1档任意一次记得即掌握 / 2档 fam≥60 且 stage≥1 即两次记得 / 3档原 stage 到顶+fam≥80）；applyFirstRating/applyReviewRating 加 priority 参数 | 同上 |

### repos/sqlite/schema.uts + repos/sqlite/bootstrap.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | plan_item 加 priority INTEGER NOT NULL DEFAULT 3；bootstrap migrate 加 v3 迁移（PRAGMA table_info 检测 + ALTER TABLE） | 同上 |

### repos/planRepo.uts + repos/sqlite/planRepoImpl.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | PlanWordEntry 加 priority；createPlan 第三参 priorities（与 ids 按下标对齐）；新增 getPlanPriorities（计划内映射）/getWordPriority（跨计划最易档）/listWordPriorities（全局映射）/setPriority（批量设档单事务）；listPlanItems/listPlanWordsWithStatus 查询带 priority | 同上 |

### services/studySession.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | SessionState 加 manualMastered（草稿含该字段）；answerMastered 直接通过出列；commitSession 记账带档位（prioCache 按计划缓存）、手动掌握词按 pushMastered 记账（state=mastered/fam=100，log 记 RATING_EASY 预留档，新词→激活计划、复习→所有到期计划，与批量管理/评分记账同构）；新增 submitDetailMastered/consumeDetailMastered 详情页回传通道 | 同上 |

### services/importer.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | ImportRow 加 priority；解析 JSON 可选字段 priority（仅认 1/2，缺省 3）；createPlanFromImport 传 orderedPriorities | 同上 |

### services/backup.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 备份 plan_items 含 priority 列；恢复旧备份（无该字段）按 pri() 回退 3 档 | 档位数据不丢 |

### pages/plan/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 词单行首档位标签（①绿/②黄/③灰，点按循环切换即写库）+ 档位说明行；管理模式加「批量设档」工具行（选中词批量设 ①②③）；行点击目标改为 word-main/勾选圈各自响应（避免标签点击与行导航冲突） | 同上 |

### pages/plan/import.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 预览行加档位标签（点按循环调整，写回 pending 后随建计划落库）+ 顶部档位说明 | 同上 |

### pages/study/study.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 词卡加档位徽章（①一次即会/②两次即会/③常规，start 时 listWordPriorities 加载映射）；onShow 消费 consumeDetailMastered 走 mastered()（answerMastered 出下一词，会话结束统一落库） | 背词时直观展示档位 + 已掌握快捷入口 |

### pages/word/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 评分模式下 1/2 档词（getWordPriority 跨计划最易档）底部评分栏追加主色「已掌握」按钮，点击 submitDetailMastered 回传返回 | 同上 |

### test-import-n5.json

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | する/来る/人 加 priority:1、先生 加 priority:2 作为档位导入示例 | 验证导入档位字段 |

## repos/stateRepo.uts + repos/sqlite/stateRepoImpl.uts（批量状态管理）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | StateRepo 新增 markMastered（UPSERT word_state 为 mastered/familiarity=100，不写 review_log，单事务批量）与 resetToNew（DELETE word_state，未学=无行语义） | 用户需求：计划词单批量状态管理 |

## pages/plan/detail.uvue（多选状态管理）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 词单加「管理状态」模式：标题行右侧入口、多选勾选圈（行点击切换）、已选计数/全选当前列表/清空工具行、底部悬浮双操作条（标为已掌握/恢复未学习，确认弹窗后执行并刷新）；goWord 前移满足先声明后引用 | 同上 |

## uni.scss（设计 token）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 修正注释：uni-app x **不自动注入** uni.scss，页面需显式 @import（已同步两页补 @import '../../uni.scss'） | HBuilderX 编译报 Undefined variable |

## pages/index/index.uvue（UI 改版）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 首页视觉改版：浅蓝头部块（日期+计划胶囊+分时问候）、三色进度条（已掌握绿/学习中蓝/未学灰+图例计数）、复习/学新词双入口并排大数字卡（学新词主色实底）、统计条与底部入口收口 token；样式迁 lang="scss" | UI 主流程第一步 |

## pages/study/study.uvue（UI 改版）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 背词页视觉改版：顶部模式胶囊+居中计数+喇叭、线性进度条、沉浸大卡（88rpx 词+音调胶囊底）、结束页大圆徽章（✓/🍵）+主按钮；冗余提示行合一 | UI 主流程第二步 |

## pages.json（导航栏配色）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 全局导航栏与窗口背景 #F8F8F8 → #F5F6F8（与 $c-bg 一致） | 视觉统一 |

## tools/build-db/build.mjs（验证轮修复）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 验证发现的 4 个修复：①旧式 `&vs;` 标签归 suru（落胆/清書 等名变动词 verb_type 从 32%→100%）；②主表记跳过 `&rK;` 罕用汉字形（する 原被存为 為る）；③adv-to 副词标签兼容 + 名词判定提前于副词（今日 n-t+adv 归名词）；④音调按读音兜底 Map（Kanjium 缺纯假名形行：する/きれい 只有汉字变体行），覆盖率 73.7%→75.5%；⑤v1 前缀族匹配（v1k くれる 型） | verify.mjs 验证脚本暴露 |

## domain/conjugation.uts（名词形サ变）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | conjugateSuru 适配名词形サ变动词：term 不以する结尾时词干=term 各形补する（落胆→落胆します/落胆して），原 する/勉強する 路径不变 | 名变动词入库 verb_type=suru 后派生需匹配 |

## tools/build-db/verify.mjs

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 新增 | 词库验证脚本：字段格式合规（音调格式/越界、pos/verb_type 枚举、extra_json 合法性）、动词 verb_type 覆盖率、四类关联计数与悬空检查、自他对配对抽查、常见词全字段抽查 | 用户要求确认数据按格式处理、关联齐全 |

## tools/build-db/build.mjs（tomoshi 集成）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 集成 tomoshi 开放数据层：parseJMdict 提取 ent_seq；loadTomoshi 读 cache/tomoshi.db（zh_defs 中文释义 217k/JLPT 7.7k/词频 30k/自他对 340）；释义优先级 zh-meanings.json > tomoshi 中文 > 英文 gloss；中文精简策略=前 4 义项×首 gloss"；"拼接；extra_json 存 jlpt/freq；verb_pairs vt 行转 trans_intrans 关联（入库 221 对）；成果：中文释义 20950/20961、系统关联 2069 | 用户需求：释义替换为中文、关联整理 |

## tools/build-db/peek-zh.mjs

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 新增 | tomoshi zh_defs 样例查看（多义项词条结构、释义长度分布） | 确定中文释义合并策略 |

## tools/build-db/inspect-tomoshi.mjs

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 新增 | tomoshi-dict-open.db 解压（Node zlib zstd）+ 表结构/样本检查 | 确认数据可用性与 key 结构 |

## tools/build-db/build.mjs（数据修复）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 修 3 个数据 bug：①pos 正则 `\w+`→`[\w-]+`（adj-i/vs-i 含连字符被截断，形容词/形容动词/サ变动词全丢失）；②ん→m 判定改看后续音节首辅音（原查片假名表得空值致全部误拼 m，如 かんりしゃ→kamrisha）；③mapPos 的 suru 分支去掉无效的 `has('vk')==false&&has('suru')` 条件 | inspect 打印数据时发现 |

## tools/build-db/inspect.mjs

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 新增 | base.db 数据检查脚本：规模/字段覆盖率/词性动词类型分布/样本词条/多音调样本/关联样本/最长释义 | 用户要看词库数据全貌 |

## repos/wordRepo.uts（分页）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 接口新增 listPage(keyword,limit,offset) 与 countWords(keyword) | 词库页分页与总数显示 |

## repos/sqlite/wordRepoImpl.uts（分页）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 实现 listPage（WHERE 同 search，LIMIT x OFFSET y）与 countWords（COUNT(*)） | 同上 |

## services/wordEditor.uts（分页透传）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 新增 listWordPage / countWords 服务方法 | 同上 |

## pages/library/library.uvue（总数+分页）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 搜索框下显示总词数（共 x 词 / 匹配 x 词）；scroll-view @scrolltolower 滚动加载下一页（50/页，防重入+过期响应丢弃）；底部显示已全部加载/无匹配 | 用户需求：词库显示总词数并支持分页 |

## tools/build-db/build.mjs（数据源管线）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 重写为完整数据管线：JMdict_e.gz + accents.txt 多源下载（curl + 镜像回退 + minSize 内容校验）、假名→罗马音派生（拗音/促音/长音/ん 规则）、Kanjium 音调合并（多值）、常用词过滤（pri 标记，上限 2.2 万）、词性映射、xref/ant → 近义/反义系统关联（termFirstId 回退解决 xref 只写表记的解析）、zh-meanings.json 可选中文释义、BEGIN/COMMIT 手动事务（node:sqlite 无 transaction()）；成果 20961 词 + 1848 关联，base.db 已复制 static/assets | 用户拍板「套餐一：常用 2 万」；better-sqlite3 安装失败改 node:sqlite |

## static/assets/base.db

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 8 种子词 → 20961 词（JMdict 常用词，含读音/罗马音/音调/词性/英文释义/verb_type）+ 1848 条近义/反义系统关联 | 同上 |

## pages/word/detail.uvue（近义/反义分区）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 固定关联区新增近义词/反义词分区（系统关联 synonym/antonym 分类渲染，可下钻），置于自他动词对之前 | 管线产出的系统关联详情页未展示 |

## DESIGN.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 决策 15 数据源定稿（套餐一详情）；进度补数据管线成果与待验证项；路线图加 7b 步划掉、遗留决策点 1 划掉并新增中文释义方案；工程备忘补 node:sqlite 事务/下载镜像坑 | 词库数据管线完成，同步设计记忆 |

## AGENTS.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-31 | 修改 | 「导入与词库」补数据源定稿条目（JMdict+Kanjium+罗马音+关联+中文可插拔）；目录树更新 build-db 说明与 base.db 规模；工具链现状补管线与音频进度 | 同上 |

## repos/native/audio.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 真人音频核心：LanguagePod101 接口下载（kanji+kana 参数、URL 编码、content-type 校验、io 线程下载主线程回调）、约定目录 audio/&lt;wordId&gt;.mp3 存储、MediaPlayer 播放（复用单实例，切换前 stop/release）；dispatcher 回调参数改 any|null 修复编译 | 用户拍板：真人音频路线 A + 自动播/手动喇叭；kotlin 编译报错 |

## services/audio.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | autoPlayForWord（有缓存即播/无缓存后台静默下载）、manualPlay（无缓存等下载完再播）、prefetchAudio（批量预取带进度回调） | 同上 |

## pages/study/study.uvue（朗读）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 展示词时自动朗读；进度行右侧加手动喇叭（无缓存先下载再播，失败提示） | 同上 |

## pages/word/detail.uvue（喇叭）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 头部加 🔊 手动喇叭（读音/罗马音/音调之后、编辑之前） | 同上 |

## pages/plan/detail.uvue（预下载）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 参数区加「预下载本计划音频」按钮（逐词下载带进度显示，防重入） | 同上 |

## services/backup.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 完整实现：exportAll（8 表全量导出 JSON，含 SCHEMA_VERSION=3，写入应用外部私有目录 backups/）+ restoreAll（版本校验 + 单事务清库重灌，带原 id 保引用一致，失败整体回滚） | 路线图第 7 步 |

## repos/native/fileText.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 新增 getBackupDir（外部私有目录 /backups）与 writeTextFile（UTF-8 写入） | 备份文件落盘 |

## pages/settings/settings.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 备份入口接通：导出（弹窗展示文件路径）+ 恢复（选 .json → 二次确认清库重灌）；doRestore 前置声明 | 路线图第 7 步；kotlin 编译报错 |

## domain/format.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 音调核展示格式化：accentGlyph（0-20 → ⓪①…⑳，超范围回退原数字）+ accentsDisplay（数组拼接） | 用户需求：音调用带圈数字表记 |

## pages/study/study.uvue（带圈音调）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | A 面音调显示改带圈数字（如 ⓪③），去掉「音调」前缀 | 同上 |

## pages/word/detail.uvue（带圈音调）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 头部音调显示改带圈数字，本地 accentDisplay 换共享 accentsDisplay；修复模板调用导入函数报错（包本地 accentText()） | 同上；kotlin 编译报错 |

## domain/types.uts（音调多值化）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | Word.accent 由 number 改为 Array<number>（多音词多值，空数组=未标注）；DB 列改 TEXT 存逗号分隔，读取端 toAccents 兼容旧库数字 | 用户需求：音调可能多个 |

## repos/sqlite/meibaoClient.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 新增 toAccents（逗号分隔字符串 → number 数组，兼容旧数字值） | 音调多值化 |

## pages/study/study.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 词卡 A 面新增音调展示（音调 0·3 样式，多个用中点连接） | 用户需求：学新词时 A 面展示音调 |

## pages/word/detail.uvue（音调多值）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 音调显示改多值（0·3）；编辑表单音调项改文本输入，逗号分隔多值（如 0,3），非法片段忽略 | 音调多值化 |

## domain/types.uts（v2 罗马音）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | Word 新增 romaji 字段 | 用户需求：词条支持罗马音 + 罗马音搜索 |

## repos/sqlite/bootstrap.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 新增 migrate()：PRAGMA table_info 检查 word.romaji 列，缺失则 ALTER TABLE 补列（旧库无损迁移） | CREATE IF NOT EXISTS 不会为已存在的表补列 |

## repos/sqlite/schema.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | word.accent 列改 TEXT DEFAULT ''（逗号分隔多值；旧库 INTEGER 值读取端兼容） | 音调多值化 |
| 2026-08-28 | 修改 | word 表新增 romaji 列 + idx_word_romaji 索引 | 罗马音字段 |

## repos/sqlite/wordRepoImpl.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 音调读写适配：rowToWord 用 toAccents，create/update 写逗号分隔字符串 | 音调多值化 |
| 2026-08-28 | 修改 | WORD_COLS/rowToWord/create/update 全部纳入 romaji；search 增加 romaji LIKE 条件 | 罗马音字段与搜索 |

## repos/sqlite/planRepoImpl.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 三处联表查询统一为 JOIN_WORD_COLS + rowToJoinWord（含 romaji），消除重复列映射 | 罗马音字段同步 + 去重 |

## services/importer.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | ImportRow/解析/新建词条支持 romaji（JSON 可选字段） | 罗马音字段 |

## pages/word/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 头部显示罗马音、编辑表单加罗马音项；✓ 勾选修复：与词组同行（rel-line 横排），不再顶到上方 | 罗马音需求 + 用户反馈勾选位置错乱 |

## pages/library/library.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 搜索框提示文案加罗马音 | 罗马音搜索 |

## pages/plan/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 词单过滤增加 romaji 匹配；搜索提示文案更新 | 罗马音搜索 |

## tools/build-db/schema.sql

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | word 表加 romaji 列 + 索引 | 与 App 端 schema 一致 |

## tools/build-db/build.mjs

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 种子词补罗马音并重新生成 base.db（8 词条） | 罗马音字段 |

## pages/word/detail.uvue（编辑闭环）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 词卡编辑完整闭环：头部「编辑」表单（表记/读音/音调核/词性/释义保存）、例句增删改（内联表单）、笔记增删（textarea 追加式）、自由关联添加（搜索→选中✓→理由→建立，防重复）与删除、状态徽章（激活计划内状态）、活用形改模板遍历渲染；修复四个 Confirm/doRelSearch 先声明后引用顺序 + 模板可空属性访问改 relSelectedId | 路线图第 6 步；kotlin 编译报错 |

## services/wordEditor.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 补齐编辑写操作：saveWord / addSentence / saveSentence / deleteSentence / addNote / deleteNote / addCustomRelation（custom 防重复）/ removeRelation | 路线图第 6 步 |

## pages/word/detail.uvue（历史评分条改动）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 支持 rate=1 评分模式：底部悬浮三档评分条（忘记/模糊/记得），点击 submitDetailRating 回传并返回；模板改单根节点包裹 | 用户澄清交互：评分按钮悬浮在详情页底部 |

## services/studySession.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 新增详情页评分回传通道：submitDetailRating / consumeDetailRating（模块级暂存） | 详情页底部评分回传给背词会话 |

## pages/study/study.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 移除本页底部评分条：点词卡带 rate=1 进详情页，onShow 消费回传评分出下一词 | 用户澄清：按钮悬浮在详情页底部，非背词页 |

## pages/plan/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 词单加搜索框（表记/读音/释义内存过滤）+ 状态筛选 chips（全部/未学习/学习中/已掌握）+ 行内状态标签；修复进度行旧变量 words → entries | 用户需求：计划中检索已学/学习中/未学的词；kotlin 编译报错 |
| 2026-08-28 | 修改 | 周期阶梯展示默认文案改为 1 · 2 · 4 天 | 阶梯调整 |

## domain/scheduler.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 周期加速改版：DEFAULT_CYCLE [1,2,4]；首考熟练度 记得40/模糊20/忘记0；复习记得 +6→+20（3 次记得即到 80 掌握，约一周完成） | 用户场景：一次学 30-40 词、每日复习、一周内背完，原 85 天掌握周期太长 |
| 2026-08-28 | 修改 | 忘记的复习处理由 stage 归 0 改为 stage−1（clamp 至 0） | 用户拍板：忘记降一档即可 |
| 2026-08-28 | 修改 | DEFAULT_CYCLE 改为 [1,2,4,7]（7 天封顶）；头注更新为三档说明 | 用户拍板：周期阶梯定到 7 天 |

## domain/types.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 评分四档简化为三档：忘记/模糊/记得（EASY 预留未用），注释标注各档调度效果 | 用户拍板简化评分交互 |

## repos/sqlite/schema.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | plan.cycle_json 列默认值改为 '[1,2,4]'（本轮加速改版） | 周期阶梯 [1,2,4] |
| 2026-08-28 | 修改 | plan.cycle_json 列默认值改为 '[1,2,4,7]' | 阶梯封顶 7 天 |

## repos/sqlite/stateRepoImpl.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | listDueStates 过滤 status='mastered'（掌握词完全退出复习队列） | 用户拍板：防止复习队列无限膨胀 |
| 2026-08-28 | 新增 | StateRepo 的 SQLite 实现：全局到期查询、同词到期集合、commitRatings（单事务 INSERT OR REPLACE word_state + 逐计划 review_log）、状态统计、复习流水查询 | 路线图第 5 步：背词闭环 |

## services/studySession.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 周期兜底数组统一为 [1,2,4] | 阶梯调整同步 |
| 2026-08-28 | 修改 | 会话通过规则重做（新词/复习统一）：记得直接过；模糊/忘记回队尾且需**连续两次**记得才通过（中途失败清零重计）；落库按最严重失败评分记账（WordProgress 状态 + 草稿含 progress 字段） | 用户拍板：三档评分 + 连对两次通过规则 |

## pages/study/study.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 移除翻面交互：点词卡直达完整详情页（含释义/例句/编辑）；三档评分按钮改为固定底部常显；清理无用 refs 与样式 | 用户需求：会话中点卡片直接给完整详情页、按钮悬浮底部 |
| 2026-08-28 | 修改 | 评分按钮四档改三档（忘记/模糊/记得）+ 通过规则提示行 | 三档评分改造 |

## services/importer.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 建计划默认 cycleJson 改 '[1,2,4,7]' | 阶梯封顶 7 天 |

## pages/settings/settings.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 周期重置按钮与展示文案同步为 [1,2,4] | 阶梯调整 |
| 2026-08-28 | 修改 | 调试区新增「所有计划周期阶梯改为 1·2·4·7」（旧计划迁移） | 既有计划仍是旧 60 天阶梯，需一键迁移验证新规则 |
| 2026-08-28 | 修改 | 新增调试区：模拟 5 个词立即到期（激活计划最早到期的词 due_date 置 0），正式版可删 | 用户要求造数据验证复习链路 |

## repos/sqlite/stateRepoImpl.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | StateRepo 的 SQLite 实现：全局到期查询、同词到期集合、commitRatings（单事务 INSERT OR REPLACE word_state + 逐计划 review_log）、状态统计、复习流水查询 | 路线图第 5 步：背词闭环 |

## repos/stateRepo.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | commitRatings 签名简化为 (states, logs)（planId 已内含，支持跨计划混合提交）；头注指向实现 | 落库实现需要 |

## repos/native/storage.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 本地 KV 存储封装（set/get/remove StoredString），uni storage API 收敛在 repos 层 | 会话草稿持久化需要 |

## services/studySession.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 草稿机制落地：snapshotDraft/hasDraft/restoreDraft/clearDraft（手拼 JSON + wordIds 回查词条）；commitSession 统一落库（每词取最后一次评分、首考对激活计划初始化、复习对全部到期计划同步记账、周期按计划缓存解析、单事务提交、成功清草稿） | 路线图第 5 步 |

## services/today.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | pickNewWordQueue 移除每日配额扣减：每次直接取下一批 dailyNew 个，不限每日次数 | 用户改主意：学完一批应能立即再学下一批 |
| 2026-08-28 | 修改 | TodaySummary 改为成果统计：dueCount/learning/learned/mastered/total/todayNew/todayReview（countByStatus 状态分布 + 今日首考/复习数），去掉待学数展示 | 用户重定义首页：显示在学/已学/今日学/今日复习等成果数据，不再提示待学 |
| 2026-08-28 | 修改 | 新增每日配额语义：startOfToday（本地零点）+ countTodayFirstReviewed 扣减，剩余=dailyNew−今日首考数；pickNewWordQueue() 改无参自动扣配额 | 用户拍板：每日新词要有每日配额（学满当日显示 0，次日恢复；中途改 dailyNew 即时生效） |
| 2026-08-28 | 修改 | 实现今日任务组装接 repos（buildTodaySummary / pickNewWordQueue / buildReviewQueue 跨计划合并 cap 截断） | 路线图第 5 步 |

## pages/study/study.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 新词队列改用无参 pickNewWordQueue()（配额扣减收敛到服务层） | 每日配额语义统一 |
| 2026-08-28 | 修改 | doCommit 移到 rate 之前声明（先声明后引用） | kotlin 编译报错 error18 |
| 2026-08-28 | 修改 | 接真实会话：按模式取队列（新词=激活计划前 N、复习=全局到期合并）、草稿恢复询问（继续/重新开始）、每题快照、结束统一落库、查看词卡详情入口（可编辑即时保存）、空任务与完成态 | 路线图第 5 步 |

## pages/index/index.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 首页改成果统计布局：复习卡（到期数）/学新词卡（今日已学）+ 统计条（在学/已学/今日复习/总词数）+ 副行（已掌握/未学）；移除待学提示 | 用户重定义首页数据展示 |
| 2026-08-28 | 修改 | load 先 await awaitDatabase() 再查库 | 真机报「数据库未初始化」：首页 onLoad 早于 onLaunch 异步初始化完成（冷启动竞态） |
| 2026-08-28 | 修改 | 今日总览接真数据：激活计划名条、到期/待学计数（onLoad+onShow 刷新） | 路线图第 5 步 |

## repos/sqlite/bootstrap.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | initDatabase 幂等化（缓存 Promise）+ 新增 awaitDatabase() 供页面/服务等待初始化 | 冷启动竞态：首页 onLoad 早于异步初始化 |

## repos/native/fileText.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 设备文件文本读取（App-Android）：content:// 走 ContentResolver、普通路径走 FileInputStream，UTF-8 逐行拼装 | uni.chooseFile 在 Android 返回 content:// 协议，普通读法不可用 |

## services/importer.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 实现完整导入服务：parseAndMatch（UTSJSONObject 解析 + ①term+reading 精确→②仅term→③仅reading→④新建 分层匹配）、pending 模块级暂存、createPlanFromImport（新建词条+建计划+无激活计划时自动激活） | 路线图第 4 步 |

## pages/plan/import.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 导入预览页：计划名/每日新词可编辑，逐条确认（已匹配显示命中词、多候选点选、将新建），确认后建计划并返回 | 路线图第 4 步 |

## pages/plan/list.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | doParse 移到 doImport 之前声明（uts 同 Kotlin 要求先声明后引用） | kotlin 编译报错 error18：找不到 doParse |
| 2026-08-28 | 修改 | 接真数据：listPlans 渲染（onLoad+onShow 刷新）、导入入口接 uni.chooseFile（.json 过滤、取消静默）→ readTextFile → parseAndMatch → 跳预览页 | 路线图第 4 步 |

## pages.json

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 注册导入预览页 pages/plan/import | 路线图第 4 步 |

## repos/wordRepo.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 接口新增 findByTerm/findByReading 精确匹配 | 导入分层匹配需要 |

## repos/sqlite/wordRepoImpl.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 补齐 create/addSentence/addNote 走 insert()（上轮并行编辑丢失）；新增 findByTerm/findByReading 实现 | 取新行 id 正确性；接口扩展 |

## pages/plan/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 周期阶梯展示默认文案改为 1 · 2 · 4 天 | 阶梯调整 |
| 2026-08-28 | 修改 | 从静态演示改为接真数据：按 id 载入计划（名称/激活徽章/周期阶梯/进度）、词单按 sort 全量渲染（序号+表记+读音+释义，可跳词卡）；新增每日新词/复习上限编辑与保存（updatePlan） | 用户反馈词单只显示两个（实为演示数据未接通）+ 需求：参数可修改 |

## repos/planRepo.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 新增 PlanWordEntry 类型与 listPlanWordsWithStatus 接口 | 计划词单搜索/筛选需要词条+学习状态 |
| 2026-08-28 | 修改 | 接口新增 countTodayFirstReviewed（今日首考数） | 每日配额 |
| 2026-08-28 | 修改 | 接口新增 getPlan / listPlanWords / getLearnedCount | 计划详情页接通需要 |
| 2026-08-28 | 修改 | 头注指向 SQLite 实现位置 | 实现已落地 |

## repos/sqlite/planRepoImpl.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 实现 listPlanWordsWithStatus（LEFT JOIN word_state + COALESCE 默认 new，按 sort） | 词单筛选接口 |
| 2026-08-28 | 修改 | 实现 countTodayFirstReviewed（review_log 中 is_first=1 且 reviewed_at ≥ dayStart 的去重词数） | 每日配额扣减依据 |
| 2026-08-28 | 修改 | 实现 getPlan / listPlanWords（JOIN word 按 sort）/ getLearnedCount（JOIN word_state 统计非 new） | 接口扩展 |
| 2026-08-28 | 新增 | PlanRepo 的 SQLite 实现：计划 CRUD、激活切换（先清后置）、建计划+事务批量写 plan_item（行序 sort、OR IGNORE 去重）、删除计划显式清理关联表、词单查询、今日新词（LEFT JOIN word_state 取 new/无状态） | 路线图第 4 步：planRepo + 导入链路 |

## repos/sqlite/assetCopy.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 重写为三层定位：①UTSAndroid.getResourcePath 解析设备文件系统路径（dev 基座资源同步到设备 FS，不在 APK assets——官方文档确认）②正式包 assets/apps/<appid>/www/<relPath> 定径 ③assets 全树兜底；新增 copyFile/copyAsset | 真机诊断确认 uni-static 为框架组件资源、apps 下无 base.db；查官方文档定位到正确机制 |
| 2026-08-28 | 修改 | 定位策略升级：先直接 open 已知候选路径（uni-static/…、apps/<appid>/www/…），失败再全树递归；诊断输出根目录+uni-static+apps 子内容 | 真机递归搜索仍未找到 base.db，需进一步定位打包结构 |
| 2026-08-28 | 修改 | 修复 java String[] 互操作编译错误：判空 + .size 取长度 + Int 下标 + 手工拼接根目录列表 | kotlin 编译报错（error17/18：length/join 不存在、Number 索引、可空接收者） |
| 2026-08-28 | 修改 | 不再写死 asset 路径：递归在 APK assets 树中按文件名定位 base.db（兼容不同打包根前缀）；找不到时抛含 assets 根目录列表的诊断信息 | 真机报 FileNotFoundException：assets 根下无 static/assets/base.db，实际打包前缀不确定 |
| 2026-08-28 | 新增 | 首启底库复制（App-Android）：APK assets 的 static/assets/base.db → context.getDatabasePath(dbName)，已存在跳过；失败抛错由 bootstrap 降级空库 | 路线图第 3 步：base.db 链路 |

## repos/sqlite/bootstrap.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | initDatabase 接入 ensureAppDatabase 首启复制（try/catch 降级空库启动） | 路线图第 3 步 |

## repos/sqlite/wordRepoImpl.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 新增 insert() 助手：插入后查 last_insert_rowid 取新行 id；create/addSentence/addNote/addRelation 全部改走它 | 插件 executeSql 的 insertId 恒返回 -1，无法取新 id |
| 2026-08-28 | 修改 | getWordRepo 改用 const 副本判空（模块级变量无法 smart cast） | 真机编译报错 |
| 2026-08-28 | 新增 | WordRepo 的 SQLite 实现：词条搜索（LIKE 转义）/CRUD、例句、笔记、双向关联 + 多 id 关联查询（IN 子句），getWordRepo() 单例 | 路线图第 2 步：词库页/词卡详情接真数据 |

## repos/sqlite/sqlClient.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | execute 返回值由 number 改为 ExecResult（rowsAffected + insertId） | create 类方法需要回传新行 id |

## repos/sqlite/meibaoClient.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | execute 适配 ExecResult，回调内 const 局部处理可选 insertId | sqlClient 接口变更 |

## services/wordEditor.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | searchWords 改异步接 WordRepo；新增 RelationDisplay/WordDetail 类型与 getWordDetail 聚合查询（词条+例句+笔记+双向关联含对端摘要，悬空关联跳过） | 路线图第 2 步 |

## repos/wordRepo.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 头注指向 SQLite 实现位置 | 实现已落地 |

## pages/word/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | onLoad 回调去 async（error17：生命周期回调须返回 Unit），改为调用异步 loadWord | 真机编译报错 |
| 2026-08-28 | 修改 | 接真数据：onLoad 按 id 调 getWordDetail；例句/笔记/自他对/自由关联分区渲染真实数据，关联词可下钻；活用形补全仮定/意向形并仅动词显示；音调核展示；状态徽章移除（待 stateRepo） | 路线图第 2 步 |
| 2026-08-28 | 新增 | 词卡详情页：头部/释义/例句/笔记/自他对/活用形表（conjugation 派生）/自由关联分区 | 项目骨架 |

## pages/library/library.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 接真数据：输入即搜（表记/读音/释义 LIKE）、空关键词首屏前 50 条、列表项带 id 跳词卡详情、空态提示 | 路线图第 2 步 |
| 2026-08-28 | 新增 | 词库浏览页：搜索栏 + 词条列表（跳词卡详情） | 项目骨架 |

## DESIGN.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 完整设计记忆文档：产品构想、17 项决策全景（含备选与取舍理由）、调度规则备忘、当前进度、8 步路线图、5 个遗留决策点、协作工程备忘 | 沉淀讨论与计划，供后续开发会话恢复上下文 |

## AGENTS.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 顶部新增「开始工作前先读 DESIGN.md」指引 | 与 DESIGN.md 建立关联 |

## 项目迁移（i:\myApp\背单词 → i:\myApp\nihongo-student）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 本日志随项目迁移建立，历史记录完整保留；以下为迁移过程中的文件操作 | 旧项目未按标准流程创建，迁移至 HBuilderX 标准创建的 uni-app x 工程 |

## pages.json

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 重写为 7 页注册（今日/背词/词卡/计划列表/计划详情/词库/设置），path 按模板约定不带 .uvue 后缀 | 项目迁移合并模板配置 |

## App.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 保留模板 setup 语法与 Android 双击返回退出逻辑，onLaunch 接入 initDatabase() | 项目迁移合并 |

## manifest.json

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | description 更新为「个人日语背词应用，完全本地离线」（保留模板生成的 appid） | 项目迁移 |

## .gitignore

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 模板基础上追加 node_modules/ 与 tools/build-db 忽略项 | 项目迁移 |

## pages/index/index.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 4 处 navigateTo URL 去掉 .uvue 后缀 | 项目迁移（对齐模板路由约定） |

## pages/plan/list.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | navigateTo URL 去掉 .uvue 后缀 | 项目迁移（对齐模板路由约定） |

## pages/library/library.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | navigateTo URL 去掉 .uvue 后缀 | 项目迁移（对齐模板路由约定） |

## AGENTS.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 标题更名 nihongo-student；简介注明迁移来源；目录结构与工具链现状按新工程实际情况更新（插件已导入 uni_modules） | 项目迁移 |

## （迁移批量拷贝）

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 以下目录/文件自旧项目原样拷贝：domain/（3 文件）、repos/（7 文件，含 sqlite/4）、services/（5 文件）、tools/build-db/（3 文件）、pages/ 7 页面、uni.scss 占位说明、log.md 历史。各文件内容明细见下方历史记录 | 项目迁移 |

## AGENTS.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 工具链现状更新：SQLite 选型定为 meibao-Sqlite，适配层/启动链路说明；标注插件导入前置条件 | SQLite 接入路线确定 |
| 2026-08-28 | 修改 | 目录结构更新为实际骨架文件树；新增「工具链现状（待办）」小节（HBuilderX/uts 插件/蒸汽模式/UnoCSS 待办） | 项目骨架搭建完成 |
| 2026-08-28 | 修改 | 新增「UI 交互与题型（已定稿）」小节：两会话同构、仅认读题型、首考初始化规则、词卡详情分区、自由关联交互 | UI 讨论完成，设计阶段收口 |
| 2026-08-28 | 修改 | 新增「导入与词库（已定稿）」小节：内置底库、build-db 加工脚本、只增不改升级、JSON 导入与分层匹配、备份顺序 | 导入模块讨论完成 |
| 2026-08-28 | 修改 | 新增「服务层结论（已定稿）」小节（分层依赖/服务清单/会话草稿机制/独立会话/单计划激活）；目录结构由待定改为具体结构树 | 服务层讨论完成 |
| 2026-08-28 | 修改 | 新增「数据模型（已定稿）」小节，收录数据层全部讨论结论；目录结构标注服务层讨论中 | 数据层讨论完成 |
| 2026-08-27 | 修改 | 技术栈小节记录已确定选型：uni-app x / SQLite / 固定周期表 / 词库两层结构 | 数据层讨论结论 |
| 2026-08-27 | 新增 | 创建项目文档框架 | 项目初始化 |

## manifest.json

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | uni-app x 项目标记与基础信息（appid 待 HBuilderX 生成） | 项目骨架 |

## pages.json

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 注册 7 个骨架页面路由（index/study/word/plan×2/library/settings） | 项目骨架 |

## App.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | onLaunch 接入 initDatabase()：打开 vocab 库并建全部表 | SQLite 启动链路接通 |
| 2026-08-28 | 新增 | 应用入口，onLaunch 留数据库初始化 TODO | 项目骨架 |

## uni.scss

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 全局样式变量占位 | 项目骨架 |

## .gitignore

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 忽略 unpackage/node_modules/构建产物 base.db | 项目骨架 |

## domain/types.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 领域类型与常量：状态/评分四档/关联类型/动词类型 + 知识域·计划域·学习域全部实体 | 项目骨架 |

## domain/scheduler.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 调度纯函数：applyFirstRating 首考初始化 / applyReviewRating 四档更新；间隔=cycle[stage]×熟练度系数×评分系数 | 项目骨架 |

## domain/conjugation.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 动词活用派生纯函数：五段/一段/サ变/カ变 → ます·て·た·ない·可能·被动·使役·仮定·意向 9 形态；内置行く→行って 特例 | 项目骨架 |

## repos/sqlite/schema.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 全部建表 DDL：知识域(word/sentence/note/word_relation)+计划域(plan/plan_item)+学习域(word_state 按计划复合主键/review_log)+setting，含索引 | 项目骨架 |

## repos/sqlite/sqlClient.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 头注更新为已选型（meibao-Sqlite）；移除 createSqlClient TODO（移至适配层实现） | SQLite 接入路线确定 |
| 2026-08-28 | 新增 | 存储抽象接口（open/execute/select/transaction/close）+ initSchema；uts 插件候选清单注释 | uni-app x 无内置 SQLite，隔离插件选型 |

## repos/sqlite/meibaoClient.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | meibao-Sqlite 适配层：五个 API Promise 化、sqlStr/sqlNum 转义、toNum 行值转换、openedName 防重复开库 | 承接 SQLite 接入 |

## repos/sqlite/bootstrap.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 数据库启动链路：initDatabase()（open + 建表）与 getClient() 单例；base.db 复制留 TODO | 承接 SQLite 接入 |

## repos/wordRepo.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 知识域 DAO 接口：词条/例句/笔记/关联（含 2 跳关联查询） | 项目骨架 |

## repos/planRepo.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 计划域 DAO 接口：计划 CRUD/激活切换/词单/今日新词取词 | 项目骨架 |

## repos/stateRepo.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 学习域 DAO 接口：全局到期/同词多计划到期集/commitRatings 事务/统计 | 项目骨架 |

## services/today.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 今日任务组装服务骨架：buildTodaySummary/pickNewWordQueue/buildReviewQueue（待接 repos） | 项目骨架 |

## services/studySession.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 背词会话状态机：createSession/answer（首考忘记排队尾重见）；草稿快照与统一落库留 TODO | 项目骨架 |

## services/wordEditor.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 词卡编辑服务骨架：getConjugation（派生+override 合并入口）/searchWords 占位 | 项目骨架 |

## services/importer.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | JSON 词表导入服务骨架：导入格式注释/匹配分层常量/ImportRow 预览类型 | 项目骨架 |

## services/backup.uts

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 备份服务骨架：SCHEMA_VERSION 常量与导出/恢复 TODO | 项目骨架 |

## pages/index/index.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 今日总览页：复习/学新词两张任务卡 + 计划/词库/设置入口 | 项目骨架 |

## pages/study/study.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 修复 kotlin smart cast 编译错误：闭包内对可空局部变量 session 赋值/判空后改为先存不可变局部副本（s/cur）再访问 | 真机编译报错 |
| 2026-08-28 | 新增 | 背词会话页：题面→点击翻面→四档评分按钮，接 StudySession 状态机（演示词） | 项目骨架 |

## pages/word/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 词卡详情页：头部/释义/例句/笔记/自他对/活用形表（conjugation 派生）/自由关联分区 | 项目骨架 |

## pages/plan/list.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 计划列表页：计划卡片（激活标记）+ JSON 导入入口 | 项目骨架 |

## pages/plan/detail.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 计划详情页：参数展示 + 按序词单 | 项目骨架 |

## pages/library/library.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 词库浏览页：搜索栏 + 词条列表（跳词卡详情） | 项目骨架 |

## pages/settings/settings.uvue

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 设置页：复习参数展示 + 备份导出/恢复入口 | 项目骨架 |

## tools/build-db/package.json

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 加工脚本 npm 配置（better-sqlite3） | 项目骨架 |

## tools/build-db/schema.sql

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 新增 | 底库建表 SQL（仅知识域，与 schema.uts 保持一致） | 项目骨架 |

## tools/build-db/build.mjs

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 依赖 better-sqlite3 改为 Node 内置 node:sqlite（DatabaseSync），去 WAL 保持单文件自包含，重跑前删旧 base.db | 本机 better-sqlite3 安装失败（预编译包网络失败 + 无 VS C++ 工具链）；已生成含 8 种子词的 static/assets/base.db |
| 2026-08-28 | 新增 | 底库加工脚本：建库+种子词条+复制到 static/assets；真实数据源管线留 TODO | 项目骨架 |

## log.md

| 时间 | 操作 | 说明 | 修改原因 |
|------|------|------|------|
| 2026-08-28 | 修改 | 记录项目骨架搭建的全部文件变更（26 个文件） | 项目骨架搭建完成 |
| 2026-08-27 | 新增 | 创建修改日志文件 | 项目初始化 |
## 首页 Aurora Editorial 排版与导航重构（2026-09-01）

- `pages/index/index.uvue`：首页由卡片堆叠重排为编辑封面、今日任务、合并进度面板和学习工具四段式结构；复习/新词采用不对称主次网格。
- 底部四个入口去除圆形文字伪图标，改为 `01—04` 编号、标题与用途说明组成的单行目录式导航；保留四个完整大触区和轻按压反馈，并确保首屏完整可见。
