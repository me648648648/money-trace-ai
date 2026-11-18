"""main.py —— 路由层（组长负责）

v2 · 2026-11-18
接口形状以 contract.py 为准，这里只负责「把 HTTP 请求翻译成对 db / parser 的调用」。
这一层不写 SQL，也不做文本解析，那两件事分别在 backend/db.py 和 backend/parser.py。

现在 11 条路由都是 NotImplementedError 的占位，等 B 和 C 按 v2 交付后逐条填。
每条上面的注释写清了三件事：收什么、交给谁、返回什么。
"""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend import db, parser

APP_DIR = Path(__file__).resolve().parent.parent
# 前端放在 frontend/finora-ai/，和 208980f 那次提交的路径保持一致，历史能对上
FRONTEND = APP_DIR / "frontend" / "finora-ai"

app = FastAPI(title="账页 mini API")

# 建表。必须放在模块顶层，服务一启动就执行。
# 用 try 包住是因为 C 的 db.py 万一还没交实现，init_db 会抛 NotImplementedError，
# 不 try 的话 uvicorn 一启动就崩，全组连服务都起不来。
try:
    db.init_db()
except NotImplementedError:
    pass


# ---------------------------------------------------------------- 工具函数

def _categories() -> list[str]:
    """返回 8 个类别的键，顺序固定：7 个有词表的 + 「其他」。"""
    return parser.ALL_CATEGORIES


def _fill_zero(bucket: dict, keys: list[str]) -> dict:
    """把 {类别: 值} 补成全部 keys 都有，缺的填 0。

    为什么不放在 db.py：类别清单是业务知识，db.py 只该回答「我库里有什么」。
    GROUP BY 只对存在的行分堆，一条购物记录都没有就没有「购物」这一堆，
    前端柱子会凭空少几根而且不报错。这层补零是路由层的责任。
    """
    return {k: bucket.get(k, 0) for k in keys}


def _days_in(month: str) -> list[str]:
    """'2026-11' -> ['2026-11-01', ..., '2026-11-30']，给折线图补天用。"""
    year, mon = (int(x) for x in month.split("-"))
    if mon == 12:
        nxt = f"{year + 1}-01-01"
    else:
        nxt = f"{year}-{mon + 1:02d}-01"
    from datetime import date, timedelta
    d, end, out = date(year, mon, 1), date.fromisoformat(nxt), []
    while d < end:
        out.append(d.isoformat())
        d += timedelta(days=1)
    return out


# ---------------------------------------------------------------- 11 条接口

@app.post("/api/parse")
def api_parse(payload: dict) -> dict:
    """收 {text}；交给 parser.parse_text；返回 {day, amount, type, category,
    merchant, note, understood}。text 缺了 → 400。"""
    raise NotImplementedError


@app.get("/api/transactions")
def api_list(limit: int = 20, offset: int = 0, month: str | None = None,
             category: str | None = None, type: str | None = None,
             q: str | None = None) -> dict:
    """流水页。limit 必须夹到 1~100（limit=0 和 -1 都要纠正）。
    items 来自 db.list_rows，total 来自 db.count_rows，同样筛选条件各调一次。"""
    raise NotImplementedError


@app.post("/api/transactions")
def api_create(payload: dict) -> dict:
    """记一笔。必填 day / amount / type / category，缺一个 → 400；
    写库前把 type 限定成 expense/income、category 限定成 8 类之一，否则 400。
    金额进库前必须已经是整数分。返回带 id 的整条记录。"""
    raise NotImplementedError


@app.delete("/api/transactions/{tx_id}")
def api_delete(tx_id: int) -> dict:
    """db.delete_row 返回 0 → 404 + detail；否则 {deleted: true, id}。"""
    raise NotImplementedError


@app.get("/api/summary")
def api_summary(month: str = "2026-11") -> dict:
    """db.month_summary 返回 (expense, income, count)，再算 balance = income - expense。
    没有数据要返回 0，不要返回 404。"""
    raise NotImplementedError


@app.get("/api/categories")
def api_categories(month: str = "2026-11", type: str = "expense") -> dict:
    """db.category_totals 只返回库里有的类别，这里用 _fill_zero 补齐成 8 个，
    再拼上 count（需要 db 那边一并返回笔数，或再加一次查询）。"""
    raise NotImplementedError


@app.get("/api/trend")
def api_trend(month: str = "2026-11", type: str = "expense") -> dict:
    """db.daily_totals 只返回有记录的天，这里用 _days_in(month) 补齐每一天，
    缺的填 0。一天都不能少，否则折线图会断。"""
    raise NotImplementedError


@app.post("/api/query")
def api_query(payload: dict) -> dict:
    """收 {question}；parser.parse_question 得到 {from, to, category, type, metric}；
    按 metric 分别调 db.query_sum / db.query_ranking；最后拼一段人话 answer。"""
    raise NotImplementedError


@app.get("/api/budget")
def api_budget_get(month: str = "2026-11") -> dict:
    """db.list_budgets(month) 取出所有预算行，每个类别再算 used
    （db.query_sum(月初, 月末, category, 'expense')）和 ratio = used / budget。
    budget 为 None 时 ratio 也是 None，不要让前端除出 Infinity。
    'all' 那条一定返回，没设过就给 budget: null。"""
    raise NotImplementedError


@app.put("/api/budget")
def api_budget_put(payload: dict) -> dict:
    """收 {month, category, amount}；category 必须是 'all' 或 8 类之一，否则 400。
    db.set_budget 是幂等的（ON CONFLICT DO UPDATE），重复调结果一样。"""
    raise NotImplementedError


@app.get("/api/meta")
def api_meta() -> dict:
    """前端启动时读一次：类别清单、收入常量、今天的日期。
    有了它，前端不用再硬编码一份类别表，否则后端加了类别前端不知道。"""
    raise NotImplementedError


# ---------------------------------------------------------------- 静态页面

@app.get("/")
def index() -> FileResponse:
    return FileResponse(FRONTEND / "index.html")


# finora 的 index.html 里用的是 ./assets/... 相对路径，
# 页面在 /，所以资源就落在 /assets/... 上
app.mount("/assets", StaticFiles(directory=FRONTEND / "assets"), name="assets")
