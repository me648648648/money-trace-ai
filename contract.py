# =============================================================================
# 【废弃声明 · 2026-11-26】
# 本文件顶部的 v1 段和中间的 v2 段都是旧契约，只作历史对照，不要照着实现。
# 现行契约是文件末尾「契约 v3 · 2026-11-26」横幅以下的全部内容。
# v1 / v2 与 v3 冲突时，一律以 v3 为准。
# 特别提醒：v1 写「金额一律 float」，v2 起改为整数「分」，v3 继续沿用整数分。
# =============================================================================

"""contract.py —— 接口契约（组长维护，谁都不准私自改）

两套契约：一套是 HTTP 接口，一套是 Python 函数。
两边都定死了，A 写前端、B/C 写后端，才能同时开工。

============ 一、HTTP 接口 ============
日期一律 'YYYY-MM-DD'，月份一律 'YYYY-MM'，金额一律 float。

POST   /api/parse            请求 {text}
                             返回 {day, amount, category, note, source}
POST   /api/transactions     请求 {day, amount, category, note}
                             返回 {id, day, amount, category, note}
GET    /api/transactions     查询 ?limit=20
                             返回 {items: [{id, day, amount, category, note}], count}
DELETE /api/transactions/{id}
                             返回 {deleted: true, id}
GET    /api/summary          查询 ?month=2026-11
                             返回 {month, total, count}
GET    /api/categories       返回 {items: [{category, amount}]}
POST   /api/query            请求 {question}
                             返回 {answer, understood: {from, to, category, metric}}
GET    /api/budget           查询 ?month=2026-11
                             返回 {month, budget, used}
PUT    /api/budget           请求 {month, amount}
                             返回 {month, amount}

错误一律返回 {"detail": "人话说明"}，状态码 400/404/500。
前端只认 detail，不认别的字段名。

============ 二、Python 函数 ============

parser.py（B 负责）
-------------------
parse_text(text, today=None) -> dict
    {day, amount, category, note, source}
    day      'YYYY-MM-DD'
    amount   float 或 None（认不出来用 None，不要用 0 冒充）
    category CATEGORIES 的键，或 "其他"

parse_question(text, today=None) -> dict
    {from, to, category, metric, source}
    category 类别名或 None
    metric   "sum" | "count" | "ranking"

db.py（C 负责，全项目唯一写 SQL 的地方）
----------------------------------------
init_db() -> None
add_row(day, amount, category, note) -> int          返回新建的 id
list_rows(limit=20) -> list[dict]                    每项五个键
delete_row(tx_id) -> int                             返回删除行数
category_totals() -> dict                            {类别: 金额}
month_summary(month) -> tuple                        (总额, 笔数)
query_sum(day_from, day_to, category=None) -> tuple  (总额, 笔数)
query_ranking(day_from, day_to, limit=5) -> list     [(类别, 金额)]
get_budget(month) -> float | None
set_budget(month, amount) -> None
"""

# =============================================================================
# 契约 v2 · 2026-11-18
#
# 下面这一份取代上面的 v1。v1 原文保留在上面只作对照，实际开发一律以 v2 为准。
# 相对 v1 的六处变化：
#   1. 金额一律整数「分」，不再用 float 元
#   2. 流水新增 type（收支）和 merchant（商家）两个字段
#   3. 类别扩到 8 个（7 个有词表的 + 「其他」兜底），收入固定用「收入」
#   4. 预算按 (月份, 类别) 存，支持按类别设限额
#   5. 接口 9 条 → 11 条（新增 /api/trend、/api/meta）
#   6. parse 的返回值用 understood 取代 v1 的 source
# =============================================================================

"""
============ v2 一、口径（写死，谁都不能自己改）============

日期    'YYYY-MM-DD' 字符串，必须补零。'2026-11-5' 会让那笔账静默漏掉
月份    'YYYY-MM' 字符串
金额    整数「分」，永远正数。12.5 元存成 1250，显示时前端 /100
类别    支出：CATEGORIES 的键，或 "其他"；收入：固定 "收入"
收支    type 只有 'expense' / 'income' 两个值，小写，不缩写
空值    认不出来的必填值用 null（只出现在响应里），不要用 0 或 "" 冒充
错误    一律返回 {"detail": "人话说明"}，状态码 400 / 404 / 500
       前端只认 detail，不认别的字段名

为什么金额用整数分：REAL 是浮点数，0.1 + 0.2 = 0.30000000000000004。
攒几百笔账之后 sum(amount) 会出现 832.9999999 这种数，前端显示成
「本月支出 832.9999999 元」。用整数分从根本上没有这个问题。

为什么收入不分小类：如果收入也分「生活费 / 兼职 / 红包」，就要维护
第二套类别表，category_totals 要按 type 分开算，图表颜色也要两套。
收入本来就是每月一两笔，收益不大。以后真要分，加常量就行。


============ v2 二、HTTP 接口（11 条）============

1. POST /api/parse —— 解析一句话
   请求 {"text": "昨天打车 23 块"}
   返回 {"day": "2026-11-16", "amount": 2300, "type": "expense",
         "category": "交通", "merchant": "", "note": "昨天打车 23 块",
         "understood": {"day": true, "amount": true, "type": true,
                        "category": true, "merchant": false}}
   understood 固定五个布尔键：day / amount / type / category / merchant。
   true = 这句话里确实认到了该字段；false = 用了默认值（默认今天、默认
   expense、没认出类别或商家），前端把 false 的字段标黄让用户补。
   五个键一个都不能少返回。
   amount 认不出来时返回 null 配 "amount": false，前端据此标红让用户补，
   而不是显示「花费 0 元」。

2. POST /api/transactions —— 记一笔
   请求 {"day": "2026-11-16", "amount": 2300, "type": "expense",
         "category": "交通", "merchant": "", "note": "打车"}
   返回 {"id": 17, "day": ..., "amount": ..., "type": ..., "category": ...,
         "merchant": ..., "note": ...}
   必填 day / amount / type / category，缺任何一个 → 400。
   merchant、note 缺省为 ""。

3. GET /api/transactions —— 流水页（查询参数全部可选）
   limit=20   必须夹在 1~100，limit=0 和 limit=-1 都要被纠正
   offset=0   分页起点
   month='2026-11'   只取这个月
   category='all' 或类别名
   type='expense' / 'income'，不传表示都返回
   q   在 merchant 和 note 里模糊搜
   返回 {"items": [{...}], "count": 本次返回几条, "total": 符合条件的总数}
   count 和 total 不是一回事，分页要靠 total 算页数。

4. DELETE /api/transactions/{id}
   返回 {"deleted": true, "id": 17}；id 不存在 → 404 + detail

5. GET /api/summary?month=2026-11 —— 总览页顶部
   返回 {"month": "2026-11", "expense": 83200, "income": 300000,
         "balance": 216800, "count": 24}
   balance = income - expense，可以为负。count 是笔数（支出+收入）。
   没有数据时返回 0，不返回 404。

6. GET /api/categories?month=2026-11&type=expense —— 分析页柱状图
   返回 {"month": ..., "type": ...,
         "items": [{"category": "餐饮", "amount": 12000, "count": 8}, ...]}
   必须返回全部 8 个类别，没有记录的返回 0，不许少返回。
   GROUP BY 只对存在的行分堆，没记录就没有那一堆，前端柱子会凭空少几根
   而且不报错。补零由 main.py 做，db.py 只返回库里有的。

7. GET /api/trend?month=2026-11 —— 分析页折线图
   返回 {"month": ..., "items": [{"day": "2026-11-01", "amount": 12000},
                                 {"day": "2026-11-02", "amount": 0}]}
   按天返回，缺的天也要有、值为 0，一天不能少。理由同上。

8. POST /api/query —— AI 查账
   请求 {"question": "这个月吃饭花了多少"}
   返回 {"answer": "2026-11 餐饮共花了 120.00 元，8 笔。",
         "understood": {"from": "2026-11-01", "to": "2026-11-30",
                        "category": "餐饮", "type": "expense",
                        "metric": "sum"},
         "data": {"amount": 12000, "count": 8}}
   understood 是「我怎么理解你这句话的」，data 是原始数字。拆开是因为
   前端要能显示理解结果——用户问「上个月打车」，解析成「本月」时他能看出来。
   只有一段 answer 字符串的话，错了也看不出错在哪。
   metric 只有 'sum' / 'count' / 'ranking' 三个值。
   注意：这里的 understood 是「解析出来的实际值」，给前端显示系统理解用；
   parser.parse_question 返回的 understood 是布尔置信标记。同名不同用。

9. GET /api/budget?month=2026-11 —— 预算页
   返回 {"month": ..., "items": [
         {"category": "all",  "budget": 170000, "used": 83200, "ratio": 0.489},
         {"category": "餐饮", "budget": 12000,  "used": 12000, "ratio": 1.0}]}
   budget 为 null 表示这个类别没设预算，这时 ratio 也是 null，前端显示
   「未设预算」而不是算出 Infinity。ratio 由后端算好，别让前端再除一次。
   'all' 那条一定返回，即使用户没设总预算，返回 budget: null。
   分类条目只返回用户设过的那几个。

10. PUT /api/budget —— 设置预算
    请求 {"month": "2026-11", "category": "餐饮", "amount": 12000}
    返回同请求。category 必须是 'all' 或 ALL_CATEGORIES 里的一个，否则 400。
    用 PUT 不用 POST，因为「把这个位置设成这个值」，重复调结果一样。

11. GET /api/meta —— 前端启动时读一次
    返回 {"categories": [{"key": "餐饮", "label": "餐饮"}, ...],
          "income": "收入", "today": "2026-11-18"}
    类别的中文名、收入常量、今天是几号，这三样前端都要用。不给这条接口，
    前端就得硬编码一份，于是有了两份真相：后端加了「学习教育」，
    前端不知道，柱子少一根。


============ v2 三、Python 函数 ============

parser.py（B 负责）
-------------------
CATEGORIES   dict   7 个支出类别，键是中文，值是关键词列表
OTHER        str    "其他"，兜底类别，没有关键词，所以不放进 CATEGORIES
INCOME       str    "收入"，收入类别，单值不分类
ALL_CATEGORIES list CATEGORIES 的 8 个键（含「其他」），前端画图用

cn_to_int(text) -> int | None
    中文数字转整数。「三十」→ 30，「二十三」→ 23，不是数字返回 None。

_find_date(text, today) -> str
    从一句话里认日期，返回 'YYYY-MM-DD'。要认：显式日期（2026-11-13、
    11月13日）、今天、昨天、前天、明天。都不认就是 today。
    注意：认出来的日期片段必须从文本里抠掉，否则会被当成金额。

_find_range(text, today) -> (str, str)
    从问题里认时间区间。要认：本月/这个月、上个月（自然月，不是近 30 天）、
    最近 30 天、上周、本周、今天。都认不出来默认本月。
    「上个月」必须是 10-01 ~ 10-31，不是 today-30 天。

parse_text(text, today=None) -> dict
    {day, amount, type, category, merchant, note, understood}
    amount 是整数分；认不出来用 None，不要用 0 冒充
    category 是 CATEGORIES 的键，或 "其他"
    understood 五个布尔键：day / amount / type / category / merchant，
    true = 认到了，false = 用了默认值。与 HTTP 第 1 条完全一致。

parse_question(text, today=None) -> dict
    {from, to, category, type, metric, understood}
    category 为 None 表示不限类别；metric 是 'sum' / 'count' / 'ranking'
    understood 五个布尔键：from / to / category / type / metric，
    true = 这句话里显式认到了，false = 用了默认值（默认本月、默认 expense、
    默认 sum）。注意它和 HTTP 第 8 条响应里的 understood 同名不同用：
    那个是解析出来的实际值，这个是置信标记。

db.py（C 负责，全项目唯一写 SQL 的地方）
----------------------------------------
表结构：

    CREATE TABLE IF NOT EXISTS transactions (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        day      TEXT    NOT NULL,              -- 'YYYY-MM-DD'，必须补零
        amount   INTEGER NOT NULL,              -- 单位：分，永远正数
        type     TEXT    NOT NULL,              -- 'expense' / 'income'
        category TEXT    NOT NULL,
        merchant TEXT    NOT NULL DEFAULT '',   -- 没认出来存空串，不存 NULL
        note     TEXT    NOT NULL DEFAULT ''
    )

    CREATE TABLE IF NOT EXISTS budgets (
        month    TEXT    NOT NULL,              -- 'YYYY-MM'
        category TEXT    NOT NULL,              -- 类别键，或 'all' 表示总预算
        amount   INTEGER NOT NULL,              -- 单位：分
        PRIMARY KEY (month, category)
    )

为什么 amount 永远存正数：用负数表示支出的活，sum(amount) 得到的是
「结余」不是「支出」，每个统计函数都要记得加 where type='expense'，
忘一次就错一次。存正数之后统计时显式选边，不可能忘。

为什么 merchant 默认空串不用 NULL：NOT NULL 只挡 NULL 不挡空串，
既然空串能进库，就统一用空串，前端判断 if (merchant) 就够了。

13 个函数：

init_db() -> None
    建表，重复调用不报错。

add_row(day, amount, type, category, merchant, note) -> int
    返回新 id。amount 是整数分，函数内不做任何 /100。

list_rows(limit=20, offset=0, month=None, category=None, type=None, q=None)
        -> list[dict]
    按 day 倒序、id 倒序。q 在 merchant 和 note 里模糊搜。

count_rows(month=None, category=None, type=None, q=None) -> int
    和 list_rows 同样筛选条件下的总数，给分页算 total。

delete_row(tx_id) -> int        返回删除行数（0 或 1）

category_totals(month=None, type='expense') -> dict
    {类别: 金额}。只返回库里有的，不补零——补零是路由层的事。

month_summary(month) -> tuple   返回 (expense, income, count)

daily_totals(month, type='expense') -> list
    [(day, 金额)]，只返回有记录的天，不补天。

query_sum(day_from, day_to, category=None, type=None) -> tuple
    (总额, 笔数)

query_ranking(day_from, day_to, limit=5, type='expense') -> list
    [(类别, 金额)]

get_budget(month, category) -> int | None
    单位分；没设过返回 None。

set_budget(month, category, amount) -> None
    用 ON CONFLICT(month, category) DO UPDATE，禁用 INSERT OR REPLACE。

list_budgets(month) -> list[dict]
    一次取出这个月所有预算行。

写 db.py 的三条纪律（审代码时逐条查）：
    一、amount 进出都是整数分，函数内不做任何 /100，换算只在前端
    二、所有 sum(amount) 前面必须有 where type = ?，漏一次收支就混了
    三、category_totals 和 daily_totals 都不补零、不补天，那是路由层的活


============ v2 四、改动规则 ============

1. 这个文件只有组长能改。别人有意见在 issue 里提，不要直接改。
2. 任何人改完后端，本地先跑一遍，确认 11 条接口的行为和这里写的一致。
3. 契约改了就是 v3，要重新广播，不许在 v2 上偷偷改细节。
4. 每人只能改自己负责的那个文件：
       contract.py         组长
       backend/main.py     组长
       backend/db.py       C
       backend/parser.py   B
       frontend/           A
   谁都不许改别人的文件。这既是避免冲突，也是 review 的前提。
"""

# =============================================================================
# 契约 v3 · 2026-11-26
#
# 本段取代 v2。v1 / v2 原文保留在上面只作历史对照，实际开发一律以 v3 为准。
# v3 只加了两件 AI 相关的事，v2 的 11 条接口、字段形状、表结构、金额单位一个都没改：
#   1. 新增第 12 条 POST /api/receipt（小票图片 → 一笔流水草稿）
#   2. 第 8 条 /api/query 的 answer 允许由模型改写（数字仍来自规则层）
# =============================================================================

"""
============ v3 一、口径补充 ============

（v2 第一节全部继续有效，下面三条是新增总则）

AI 是可选能力，默认关闭
    AI_ENABLED=0 时三条 AI 入口的行为与 v2 完全一致：
    /api/parse 原样返回 parser 的结果、/api/query 返回规则答案原文、
    /api/receipt 返回 500（AI 未开启）。不用 AI 时不需要配任何变量。

模型不参与算术
    金额、笔数、日期区间只能来自 parser 或 db。模型只做两件事：
    从一句话里补字段、把已经算好的结果写成一两句中文。
    「模型自己算出来的数字」一律算 bug，不是特性。

AI 不写库
    AI 只产出草稿（parse 形状），写库仍然只走 POST /api/transactions。
    小票识别同理：返回草稿，用户确认后前端再提交。


============ v3 二、HTTP 接口 ============

v2 的 11 条接口全部不变。第 8 条补充 answer 规则，并新增第 12 条。

8. POST /api/query —— AI 查账（补充）
   请求与响应形状和 v2 第 8 条完全一致，变的只是 answer 怎么来：

   - answer 由 backend.ai.compose_answer(question, parsed, data, fallback) 生成；
   - 数字护栏：改写后的回答里出现的数字，必须已经在规则答案 fallback 里出现过，
     否则判为编造，整句退回 fallback；
   - 超过 120 字、空字符串、模型超时、401、返回不是 JSON 等任何异常，
     一律逐字返回 fallback，/api/query 仍然 200；
   - AI_ENABLED=0 时与 v2 逐字一致。
   understood 和 data 仍然由 parser / db 产出，模型不碰。

12. POST /api/receipt —— 小票图片识别（新增）
   请求：multipart/form-data，文件字段名固定为 file
   校验顺序（前三条在路由层，返回 400）：
     1. Content-Type 必须 image/*；
     2. 文件内容不能为空；
     3. 文件不能超过 5MB（5 * 1024 * 1024 字节）。
   路由层通过后再按文件头（魔数）判真实格式，只认 PNG / JPEG / WebP，
   不信浏览器声明的 Content-Type。
   返回 200：与 POST /api/parse 完全相同的 7 个键，不多不少：
     {"day": "YYYY-MM-DD", "amount": 整数分或 null, "type": "expense|income",
      "category": "类别", "merchant": "", "note": "小票说明",
      "understood": {"day": bool, "amount": bool, "type": bool,
                     "category": bool, "merchant": bool}}
   500 + {"detail": "人话"} 的四种情况：
     - AI 未开启（AI_ENABLED=0）；
     - 视觉模型没配置（缺 AI_VISION_* 且主配置没填）；
     - 模型超时 / 报错 / 返回非 JSON；
     - 图片里没有小票内容（合计金额和商户都认不出）。
   一期只返回一笔（合计金额那一笔），多商品拆分不在本轮；返回的是草稿，
   不写库，前端确认后走 POST /api/transactions。
   响应里不允许出现 items 这类额外字段；要在 200 里多返回字段，必须先升 v4。


============ v3 三、Python 函数 ============

parser.py / db.py 的函数与表结构全部沿用 v2，不重复。新增一个模块：

ai.py（AI 负责人，单文件，只有这个文件归 AI 负责人改）
--------------------------------------------------------
maybe_fill(text, parsed) -> dict
    解析兜底。输入输出都是 parser.parse_text 的同形状 dict。
    AI 关闭、未触发、模型失败时原样返回 parsed（fail-open），/api/parse 永远 200。

ocr_receipt(image_bytes, mime) -> dict
    小票图片 → 与 parse 同形状的一笔流水（7 键）。
    失败统一 raise AIError，由 main.py 翻译成 500 + detail。
    amount 必须是整数分，禁止 float 元。

compose_answer(question, parsed, data, fallback) -> str
    把规则答案改写成一两句中文。任何异常 return fallback。
    返回纯字符串，不超过 120 字。

内部约定（改 ai.py 的人自己守）：
    - 不 import backend.db、不写库；数字只用传进来的 data / fallback；
    - understood 为 true 的字段不覆盖；safe 策略下 AI 补了值也保持 false；
    - key 只放环境变量或仓库根 .env，不进代码、不进日志、不进 PR。


============ v3 四、改动规则 ============

v2 第四节继续有效；其中第 3 条「契约改了就是 v3」由本节第 7 条取代，
其余照旧。文件归属表更新为：

       contract.py         组长
       backend/main.py     组长
       backend/ai.py       AI 负责人
       backend/db.py       C
       backend/parser.py   B
       frontend/           A

新增三条：
5. main.py 的三处 AI 接线由组长维护，AI 负责人不改 main.py；
6. ai.py 可以加可选调试参数（如 today / config / client），但必填参数和返回
   形状不能变；要改必填参数，先升契约；
7. 契约改了就是 v4，要重新广播，不许在 v3 上偷偷改细节。
"""
