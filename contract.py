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
