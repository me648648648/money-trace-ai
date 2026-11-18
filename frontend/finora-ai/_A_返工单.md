# A 返工单 · 前端接后端（finora-ai）

> 发给：A（前端）
> 分支：`front-ui`，不要直接推 main
> **只改两个文件**：`frontend/finora-ai/index.html`、`frontend/finora-ai/assets/js/app.js`
> 不要改：`Finora-AI-Preview.html`、`assets/css/app.css`、三张图片、`backend/**`、`contract.py`
> 依据：`contract.py` 里「契约 v2 · 2026-11-18」横幅以下，重点是第二节 11 条接口
> 前置：B 的 parser v2 和 C 的 db v2 交付前，接口会 500。本单可以先把代码接好，用 `/docs` 和契约字段对着开发，等他们合并后再联调。

---

## 0. 开工前做 3 步

1. 回 main 拉最新，切自己的分支：

   ```
   git checkout main
   git pull
   git checkout front-ui
   git merge main
   ```

2. 打开 `contract.py` 第二节，确认 11 条接口的路径、请求字段、响应字段。看不到「契约 v2」横幅就别动手。

3. 起服务看 `http://localhost:8000/docs`。现在 11 条接口会 500，这是 B/C 还没交付，不是你的问题。

---

## 1. 目标：把「本地演示版」改成「真后端版」

现在的 `app.js` 是一个**独立演示版**：

- 数据来自 `localStorage`（第 75 行读、第 127 行写）；
- 首次打开会塞一份 `demos` 假账本（第 40～51 行）；
- 文字解析、AI 查账都在浏览器里用正则算（第 499～553 行）；
- 页面刷新后数据还在，但只在这台浏览器里。

要改成：**所有读写都走 same-origin 的 `/api/*`，localStorage 和假数据全部删掉，后端是唯一真相。**

### 一个关键决定：内部数据形状不动，只在 API 边界转换

`app.js` 有 1577 行，`categories` 的英文键（`food`/`travel`/…）被图标、配色、筛选、图表到处引用。**不要**把内部变量名改成中文——那是 100 多处改动，必出错。

契约要求的是「存储和 HTTP 接口用中文键」，不是「JS 变量名必须是中文」。所以加一层转换，只在发请求和收响应两个地方转：

**API → 内部**

| API 字段 | 内部字段 | 转换 |
| --- | --- | --- |
| `id`（整数） | `id` | `String(id)`，因为 HTML 的 `data-id` 只能是字符串 |
| `day` | `date` | 直接改名 |
| `amount`（整数分） | `amount` | 不变，已经是分 |
| `category`（中文） | `category`（英文键） | 查下表 |
| `type` | `type` | 不变 |
| `merchant` / `note` | 同名字段 | 不变 |

**内部 → API**：反过来，`date`→`day`，英文键→中文键；`type === 'income'` 时 `category` 固定发 `"收入"`，不管内部是什么。

**类别对照表**

| 中文（API/数据库） | 内部英文键 |
| --- | --- |
| 餐饮 | `food` |
| 交通 | `travel` |
| 购物 | `shop` |
| 居住 | `rent` |
| 娱乐 | `fun` |
| 健康医疗 | `health` |
| 学习教育 | `study` |
| 其他 | `other` |
| 收入 | 内部用 `other`（渲染靠 `type === 'income'` 判断） |

写两个函数 `fromApi(item)` / `toApi(item)`，所有 fetch 都经过它们。这样渲染、图表、`validTransaction`、`categories` 全部不用改。

---

## 2. 六个必改点

### 2.1 CSP：允许同源请求

`index.html` 第 5 行：

```
connect-src 'none'   →   connect-src 'self'
```

只改 `index.html`，`Finora-AI-Preview.html` 不改（那是独立副本，后端不服务它）。

### 2.2 启动和月份切换：从接口取数

- `state` 初始化时 `ledger` 改成空：`{transactions: [], budgets: []}`，不要再调 `loadLedger()`。
- 新增一个 `async function boot()`：
  1. `GET /api/meta` → 拿 `categories`、`income`、`today`；
  2. 用 `today.slice(0, 7)` 作为初始月份；
  3. `GET /api/transactions?limit=100&month=<month>` → 转换后放进 `state.ledger.transactions`；
  4. `GET /api/budget?month=<month>` → 只把 `budget !== null` 的条目放进 `state.ledger.budgets`（内部形状仍是 `{month, category, amount}`，其中 `amount` 用接口的 `budget`）；
  5. `render()`。
- 文件里单独一行的 `render();`（约第 1320 行）是同步启动，改成 `boot()`（`async`，失败时 `notify` 显示 `detail`）；其余 DOM 绑定和吉祥物代码不用动。
- `setMonth(month)` 改成异步：先 `GET /api/transactions?month=...` 和 `GET /api/budget?month=...`，替换 `state.ledger` 里该月的数据，再 `render()`。
- 月份下拉：至少给出当前月往前 6 个月；不要只列 `state.ledger` 里出现过的月份，否则新用户只能看到一个月。
- `baseMonth` / `anchorDate` 两个写死的常量删掉，换成 `thisMonth()` / `today()` 两个函数（用本地时间，不要用 `toISOString()`，东八区会差一天）。

### 2.3 记一笔、编辑、删除

- `recordSubmit()`：把 `persist(...)` 换成 `POST /api/transactions`。
  - 表单里的金额是「元」，提交前 `Math.round(Number(d.amount) * 100)`；接口要整数分。
  - body：`{day, amount, type, category(中文), merchant, note}`。
  - 成功后用返回的 `id`，再 `await refreshMonth()` + `render()`；**不要**再往本地数组里 `push`/`map`。
- `deleteRecord(id)`：`DELETE /api/transactions/${Number(id)}`，成功后刷新。
- **编辑有一个契约缺口**：v2 没有 `PUT /api/transactions/{id}`。三选一，等组长定：
  1. **本轮先隐藏编辑入口**（推荐，最安全）；
  2. 用 `DELETE` + `POST` 模拟更新（中间失败会丢数据，要在 UI 上提示）；
  3. 等契约加 `PUT` 再实现（v3）。
  在组长答复前，先按第 1 种做，别自己发明接口。
- `saveHomeDraft()` 一次保存多笔：逐条 `POST`，不要并发一把梭；记录成功几笔、失败几笔，失败时告诉用户「已保存 X 笔，第 Y 笔失败」，不要静默。
- `newTransactionId()` 可以删掉：新建时 id 由后端返回。

### 2.4 预算

- `budgetSubmit()`：`PUT /api/budget`，body `{month, category, amount}`。
  - `category` 是 `'all'` 或中文类别；内部是英文键，发之前转中文。
  - `amount` 是分：表单输入元，提交前乘 100。
- `budgetEditor()` 的「现有值」从 `state.ledger.budgets` 里取，不要再去 `budgetUsage()` 里找 localStorage。
- `GET /api/budget` 返回的 `items` 里，`budget` 可能是 `null`（没设过）。`all` 那条一定返回，但没设过时不要放进内部 budgets，否则页面会显示一个 0 元预算。
- `used` 和 `ratio` 可以继续本地算（`budgetUsage` 已经会算），也可以直接用接口返回值；二选一，别两边混。

### 2.5 文字录入：改调 `/api/parse`

- `parseEditor('text')` 里原来的 `textDraft()` 删掉，改成 `POST /api/parse`，body `{text}`。
- 用返回值填 `editor.draft`：
  - `amount` 可能是 `null`：留空，并提示「没认出金额，请手动补」，**不要**显示 0；
  - `understood` 里为 `false` 的字段，在表单上加一个提示样式（比如给对应 `label` 加 `needs-check` 类，CSS 里加一条黄色边即可；不改也可以，但至少要提示）。
  - `category` 中文转英文键；`type` 直接用；`merchant`、`note` 直接用。
- 删掉 `keywords` 表（第 499 行）、`matchingCategories()`、`textDraft()`。它们和后端 parser 是两份真相。
- 图片录入保持现状：契约没有图片接口，继续用本地预览 + 示例小票，不要假装调了后端。

### 2.6 AI 查账：改调 `/api/query`

- `ask()` 里 `queryLedger()` 换成 `POST /api/query`，body `{question}`。
- 返回 `{answer, understood, data}`：
  - `answer` 直接显示；
  - `understood` 用一行灰色小字显示，例如「理解：2026-10-01 ~ 2026-10-31 · 餐饮 · 支出 · sum」，让用户能看出理解错在哪；
  - `data` 有 `amount` / `count` 就显示金额和笔数；`ranking` 时 `data.items` 是 `[{category, amount}]`，类别中文转英文键后复用现有分类列表样式。
- **预算类问题要分流**：契约的 `metric` 只有 `sum` / `count` / `ranking`，没有「预算」这个指标。问题里出现「预算 / 限额 / 超支 / 还剩多少」时，继续走本地 `queryBudget()`（它用已经 fetch 到的预算和流水算），其余问题才调 `/api/query`。否则「预算还剩多少」会被后端当成普通求和，答错。
- `queryRecent()`、`queryLedger()` 里除预算分支外的逻辑可以删；`queryBudget()` 保留。

---

## 3. 分析页这一轮先别动

分析页有三块：分类环图、6 个月柱状图、分类排行。它们现在都从 `state.ledger.transactions` 本地算。

**本轮保持本地算**，原因：

- `/api/trend` 只返回**一个月**的每日数据，而现有柱状图是**6 个月**，硬接要发 6 次请求再拼；
- `/api/categories` 也只返回单月；
- 主链路（记账、删除、预算、解析）没通之前，先动图表会把问题混在一起。

等主链路验收通过，再做第二步（可选）：单月环图换 `/api/categories`，单月折线换 `/api/trend`，6 个月柱状图用 6 次 `/api/summary`。这一步单独提 PR。

---

## 4. 必须删掉的演示逻辑

这些是「本地演示版」的骨架，不删就会和数据打架：

- `demos`（第 40～47 行）、`exampleLedger()`（第 48 行）
- `storageKey`、`loadLedger()`、`persist()`、`localStorage` 的所有调用
- `anchorDate`、`baseMonth` 两个写死日期
- `settings()` 里的「重置示例账本」和 `resetDemo()`：后端没有批量清空接口，这个功能直接去掉；设置弹窗文案里「保存在本浏览器」也要改
- 首页 `homePage()` 里 `isCurrent ? 只看 anchorDate : 看整月` 的示例逻辑：改成看当月最近 N 笔
- 顶部「示例账本」角标（`index.html` 第 40 行）

---

## 5. 不要动的东西

- `assets/css/app.css`、三张图片：这次不动样式。
- 渲染函数的结构（`homePage`、`transactionsPage`、`analysisPage`、`budgetPage`、`assistantPage`）：只换数据来源，不重写页面。
- `money()`：它已经做了 `amount / 100`，后端返回分，正好对上。
- 事件委托（`actions` 对象、`data-action`）：保留，只改被调用的保存/删除函数。
- `Finora-AI-Preview.html`：独立副本，别改。

---

## 6. 验收标准

起服务，打开 `http://localhost:8000`，逐条过：

- [ ] DevTools → Network 能看到 `/api/meta`、`/api/transactions`、`/api/budget`，状态 200。
- [ ] 记一笔 → 列表出现 → 刷新页面还在（说明来自后端，不是内存）。
- [ ] 删一笔 → 刷新后确实没了。
- [ ] 设置预算 → 刷新后还在；花超了首页提示「已超出」。
- [ ] 文字录入「昨天打车 23 块」→ 表单自动填日期、金额 23.00、类别交通；改一下能保存。
- [ ] 金额认不出来时（比如「买了一本书」）金额留空并提示，不是 0。
- [ ] AI 查账问「上个月吃饭花了多少」→ 有答案，且「系统理解」显示 10 月。
- [ ] 问「预算还剩多少」→ 仍走本地预算逻辑，答案对。
- [ ] 接口 500 时页面显示 `detail` 的人话，不是空白或 `undefined`。
- [ ] Application → Local Storage 里没有 `finora-preview-v1`。

---

## 7. 常见坑

1. `fetch('/api/...')` 用相对路径，不要写 `http://localhost:8000`，换端口就废。
2. `amount` 后端已经是分，**不要**再乘 100；只有表单输入是元，提交前乘一次。
3. `id` 是整数，但 `data-id` 是字符串。内部统一 `String(id)`，请求时 `Number(id)`，否则 `detail()` 里 `===` 永远不相等。
4. 日期字段：API 叫 `day`，内部叫 `date`，只在 adapter 里转。
5. 类别：API 中文、内部英文，只在 adapter 里转；不要改 `categories` 的键。
6. 不要再用 localStorage 兜底。留着它就会变成两份真相，刷新后旧数据把新数据盖掉。
7. `response.ok` 要判断：`if (!res.ok) throw new Error((await res.json()).detail || '请求失败')`。
8. CSP 只改 `index.html`；改了 `connect-src` 还要确认 `script-src 'self'` 没动，否则整个脚本都不执行。
9. 月份的「今天」用本地时间：`new Date().getFullYear()` + `getMonth() + 1`，不要用 `toISOString().slice(0,10)`，东八区早上 8 点前会差一天。
10. 不要一次 `Promise.all` 发 6 个月请求把页面拖慢；主链路先只取当前月。

---

## 8. 完成标准（Definition of Done）

- [ ] 只改了 `index.html` 和 `assets/js/app.js` 两个文件。
- [ ] 全仓库搜 `localStorage`，`app.js` 里 0 处。
- [ ] 第 6 节验收全过，贴截图或录屏到 PR。
- [ ] PR 描述写清：用了哪几条接口、编辑功能怎么处理、预算问答怎么分流、哪些图表还留在本地。
- [ ] PR 由组长 review 后合并，自己不合自己的 PR。

---

## 附：需要组长先拍板的两件事（2026-11-18 已拍板）

> 结论：编辑本轮**先隐藏**；预算问答**保留本地** `queryBudget`。
> 执行时以第 9 节为准，本节和第 9 节冲突的地方，第 9 节优先。

1. **编辑流水没有接口**：v2 只有 POST / GET / DELETE，没有 PUT。先隐藏编辑，还是用 DELETE+POST 模拟，还是加 v3 的 PUT？
2. **预算类问答**：继续留在前端本地算（本单默认），还是砍掉，等后端加 budget 指标？

---

## 9. 组长复核补充（2026-11-18，与第 1～8 节同等效力）

写这一节的原因：我按单子逐条对过 `assets/js/app.js`，有 6 处照原单做会直接报错或静默出错。下面按「必须修正」和「按拍板执行」分开。

### 9.1 必须修正的 6 处（照原单做会坏）

**（1）删 `keywords` / `matchingCategories()` 会打断 `queryBudget()`。**
原单 2.5 节让删第 499 行的 `keywords` 和第 500 行的 `matchingCategories`，但 `queryBudget()` 第 514 行还在用 `matchingCategories(question)`。做法二选一：保留这两个东西只给预算分支用；或把关键词表改名为 `budgetKeywords`，只留预算相关词。PR 里写明选了哪种。`textDraft()` 仍然要删。

**（2）删 `queryLedger()` 会打断 `refreshAnswers()` 和 `answerCard`。**
`refreshAnswers()`（第 709～713 行）在记一笔（693 行）、删一笔（727 行）、首页批量保存（1016 行）之后都会被调用，内部调 `queryLedger`；`answerCard` 渲染时第 863 行也直接调 `queryLedger(chat.question, chat.month)`。做法：`ask()` 只负责发 `/api/query` 并把结果存进 `entry.result`；`refreshAnswers()` 改成「对非预算类问题重新发一次 `/api/query`」（异步），或只刷新预算类条目；`answerCard` 不再重算，直接用 `entry.result`。

**（3）删 `queryLedger()` 会丢掉预算问题的月份解析。**
`queryLedger` 第 533～535 行负责把「上个月 / 本月」翻成 `month`，`queryBudget(question, month)` 依赖这个值。做法：抽一个只做月份识别的 `resolveMonth(question)`（保留「上个月 / 本月 / 最近 30 天」三档即可），预算分支用它；其余问题交给后端 `_find_range`。

**（4）首页批量录入也在用 `textDraft()`。**
第 975 行 `textDraft(part, month)` 是首页多笔录入的解析入口，原单只写了改 `parseEditor('text')`。做法：把 `textDraft` 换成「`await POST /api/parse` 再转成 draft」的适配函数，多笔仍然逐条串行 POST。

**（5）`baseMonth` / `anchorDate` 的引用点不止原单列的几处。**
全量引用：第 39 行（定义）、50、82、103、141、284、298～301、351、522、535、576、636、658、697、754、908。删常量前逐处处理，重点：

| 位置 | 改法 |
| --- | --- |
| 284、908「本月」判断 | 改成 `state.month === thisMonth()` |
| 298～301、351「示例今日 / 演示日期」 | 整段删掉，流水按整月展示 |
| 576 `editorDefaults` | `month === thisMonth() ? today() : month + '-01'` |
| 636 `textDraft` | 整段删（见第 4 条） |
| 658 示例小票的固定日期 | 换成 `today()` |
| 697 `onHome` 判断 | 改成 `item.date === today()` 或直接回总览 |
| 141 `monthPicker` | 从 `thisMonth()` 生成最近 6 个月 |

改完在 `app.js` 里再搜一次 `baseMonth`、`anchorDate`，必须是 0 处。

**（6）`validBudget` / `validTransaction` 不能直接套在接口数据上。**
`validLedgerAmount` 要求金额 ≥ 1，但契约允许预算 `amount: 0`；`GET /api/budget` 返回 0 的条目会被过滤掉，页面显示成「未设预算」。做法：API 数据不要走 `validBudget`，或者让它放行 0。`validTransaction` 要求 `id` 是字符串且匹配 `[a-zA-Z0-9_-]{1,120}`，而接口的 `id` 是整数，必须在 `fromApi()` 里先 `String(id)` 再校验，不要拿原始响应过校验。`note ≤ 120`、`merchant ≤ 70` 是前端本地限制，后端没有这两个上限，别在 `fromApi()` 里因为超长把整条记录丢掉。

### 9.2 按拍板执行的 4 件事

**（7）编辑：本轮隐藏，不做 DELETE + POST。** 详情弹窗里的「编辑」按钮去掉，`recordSubmit` 里 `e.id` 那条编辑分支可以一并删，`newTransactionId()` 删除。

**（8）预算问答：保留本地 `queryBudget()`。** 问题里出现「预算 / 限额 / 超支 / 还剩多少」时走本地，其余走 `/api/query`。关键词表按 9.1（1）处理，不能全删。

**（9）分析页 6 个月柱状图：启动时拉 6 个月。** `boot()` 里对 `shiftMonth(thisMonth(), -5)` 到 `thisMonth()` 各发一次 `GET /api/transactions?limit=100&month=...`，合并进 `state.ledger.transactions`（按 `id` 去重），再 `render()`。单月切换时只替换该月数据，不要清空其他 5 个月。注意某月超过 100 笔会被截断；MVP 阶段在图表下方加一行小字「每月最多统计最近 100 笔」，不要去分页拉全量。

**（10）月份下拉：最近 6 个月，从 `thisMonth()` 往前推。** 不要再从 `baseMonth` 生成，也不要只列有数据的月份。

### 9.3 第 6 节验收再加 3 条

- [ ] 打开分析页，6 根柱子都有数（或明确标注「每月最多统计最近 100 笔」），不是前 5 根全 0。
- [ ] 记一笔之后再打开 AI 查账，历史回答不报错（说明 `refreshAnswers` 改造过）。
- [ ] 首页一次录两笔，Network 里是 2 个串行 POST，成功 / 失败笔数提示正确。

### 9.4 顺带说明，不在本轮范围

`frontend/finora-ai/README.md` 和 `SECURITY.md` 还写着「账本保存在 localStorage」。本轮不动这两个文件，但 PR 描述里要提一句，等主链路合并后由组长统一改，避免以后有人照旧文档排查。
