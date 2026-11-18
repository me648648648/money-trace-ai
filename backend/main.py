"""main.py —— 路由层（组长负责）

v2 · 2026-11-18

接口形状以 contract.py 为准。这一层只做三件事：

    1. 把 HTTP 请求翻译成对 parser / db 的调用；
    2. 做契约里写明「由路由层负责」的事：类别补零、日期补天、limit 夹取；
    3. 把业务错误翻译成 400 / 404，detail 写人话。

这一层不写 SQL，也不做文本解析，那两件事分别在 backend/db.py 和 backend/parser.py。

注意：B 的 parser v2 和 C 的 db v2 交付前，下面的路由调不到对应函数。
服务能启动（顶层只调了 v1 也有的 db.init_db），但请求会 500。这是预期状态，
不是路由写错了。等 B、C 合并后逐条联调。
"""

import re
from datetime import date, timedelta
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend import db, parser

APP_DIR = Path(__file__).resolve().parent.parent
FRONTEND = APP_DIR / "frontend" / "finora-ai"

app = FastAPI(title="账页 mini API")

# 建表。必须放在模块顶层，服务一启动就执行。
# 用 try 包住是因为 C 的 db.py 万一还没交实现，init_db 会抛 NotImplementedError，
# 不 try 的话 uvicorn 一启动就崩，全组连服务都起不来。
try:
    db.init_db()
except NotImplementedError:
    pass


# ---------------------------------------------------------------- 全局错误形状

@app.exception_handler(RequestValidationError)
async def _on_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    """把 FastAPI 默认的 422 翻译成契约要求的 400。

    契约第 27～28 行写死：错误一律 {"detail": "人话说明"}，状态码 400/404/500。
    不装这个处理器的话，?limit=abc 这种参数会返回 422，前端按契约只认 400，
    就会把错误当成功处理。
    """
    errors = exc.errors()
    first = errors[0] if errors else {}
    loc = ".".join(str(x) for x in first.get("loc", []) if x != "body")
    msg = first.get("msg", "参数不合法")
    detail = f"{loc} 参数不合法：{msg}" if loc else f"参数不合法：{msg}"
    return JSONResponse(status_code=400, content={"detail": detail})


# ---------------------------------------------------------------- 工具函数

_MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
_DAY_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")


def _categories() -> list[str]:
    """返回 8 个类别的键，顺序固定：7 个有词表的 + 「其他」。"""
    return list(parser.ALL_CATEGORIES)


def _this_month() -> str:
    """当前月份 'YYYY-MM'。不把默认值写死成 2026-11，否则下个月就错了。"""
    return date.today().strftime("%Y-%m")


def _require_month(month: object) -> None:
    """月份必须是 'YYYY-MM'，否则 400。"""
    if not isinstance(month, str) or not _MONTH_RE.match(month):
        raise HTTPException(status_code=400, detail="month 格式必须是 YYYY-MM，例如 2026-11")


def _require_day(day: object) -> None:
    """日期必须是补零的 'YYYY-MM-DD'，而且得是真实存在的日期。

    正则只能挡住格式，挡不住 2026-02-30；所以再用 date.fromisoformat 验一次。
    日期不补零（'2026-11-5'）会让那笔账在 SQL 的字典序比较里静默漏掉。
    """
    if not isinstance(day, str) or not _DAY_RE.match(day):
        raise HTTPException(status_code=400, detail="day 格式必须是 YYYY-MM-DD，并且月、日要补零")
    try:
        date.fromisoformat(day)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"day 不是有效日期：{day}")


def _require_type(type_: object, allow_none: bool = False) -> None:
    if allow_none and type_ is None:
        return
    if type_ not in ("expense", "income"):
        raise HTTPException(status_code=400, detail="type 只能是 'expense' 或 'income'")


def _yuan(cents: int) -> str:
    """整数分 → 展示用字符串。全程不经过 float，避免 0.1 + 0.2 那种尾数。"""
    sign = "-" if cents < 0 else ""
    cents = abs(cents)
    return f"{sign}{cents // 100}.{cents % 100:02d}"


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
    d, end, out = date(year, mon, 1), date.fromisoformat(nxt), []
    while d < end:
        out.append(d.isoformat())
        d += timedelta(days=1)
    return out


def _month_range(month: str) -> tuple[str, str]:
    """'2026-11' -> ('2026-11-01', '2026-11-30')，算预算已用和分类笔数要用。"""
    days = _days_in(month)
    return days[0], days[-1]


# ---------------------------------------------------------------- 11 条接口

@app.post("/api/parse")
def api_parse(payload: dict) -> dict:
    """解析一句话。收 {text}，原样返回 parser.parse_text 的结果。

    这里不补字段、不改形状：契约把 parse 的返回定死在 parser 层，
    路由层再加工一次就会出现两份真相。
    """
    text = payload.get("text") if isinstance(payload, dict) else None
    if not isinstance(text, str) or not text.strip():
        raise HTTPException(status_code=400, detail="text 不能为空")
    return parser.parse_text(text.strip())


@app.get("/api/transactions")
def api_list(limit: int = 20, offset: int = 0, month: str | None = None,
             category: str | None = None, type: str | None = None,
             q: str | None = None) -> dict:
    """流水页。limit 夹到 1~100，offset 不能为负。

    items 来自 db.list_rows，total 来自 db.count_rows，两个函数必须收到
    完全相同的筛选条件，否则会出现「本页 20 条、总数 18 条」。
    """
    limit = max(1, min(100, limit))
    offset = max(0, offset)
    if month is not None:
        _require_month(month)
    _require_type(type, allow_none=True)
    if category == "all":
        category = None
    if q is not None:
        q = q.strip() or None

    items = db.list_rows(limit=limit, offset=offset, month=month,
                         category=category, type=type, q=q)
    total = db.count_rows(month=month, category=category, type=type, q=q)
    return {"items": items, "count": len(items), "total": total}


@app.post("/api/transactions")
def api_create(payload: dict) -> dict:
    """记一笔。必填 day / amount / type / category，缺一个就 400。

    金额进库前必须已经是整数分。这里挡住 float 和负数：如果前端传 30.5，
    说明它没乘 100，直接报错比静默存成 30 分要好。
    """
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="请求体必须是 JSON 对象")

    missing = [k for k in ("day", "amount", "type", "category")
               if payload.get(k) is None or payload.get(k) == ""]
    if missing:
        raise HTTPException(status_code=400, detail=f"缺少必填字段：{', '.join(missing)}")

    day = payload["day"]
    amount = payload["amount"]
    type_ = payload["type"]
    category = payload["category"]

    _require_day(day)
    if not isinstance(amount, int) or isinstance(amount, bool) or amount <= 0:
        raise HTTPException(status_code=400, detail="amount 必须是正整数（单位：分）")
    _require_type(type_)
    if type_ == "income":
        if category != parser.INCOME:
            raise HTTPException(status_code=400, detail=f"收入记录的 category 必须是「{parser.INCOME}」")
    elif category not in _categories():
        raise HTTPException(status_code=400, detail="category 必须是 8 个类别之一")

    merchant = payload.get("merchant") or ""
    note = payload.get("note") or ""
    if not isinstance(merchant, str) or not isinstance(note, str):
        raise HTTPException(status_code=400, detail="merchant / note 必须是字符串")

    new_id = db.add_row(day, amount, type_, category, merchant, note)
    return {"id": new_id, "day": day, "amount": amount, "type": type_,
            "category": category, "merchant": merchant, "note": note}


@app.delete("/api/transactions/{tx_id}")
def api_delete(tx_id: int) -> dict:
    """删一笔。db.delete_row 返回 0 说明 id 不存在，按契约给 404。"""
    if db.delete_row(tx_id) == 0:
        raise HTTPException(status_code=404, detail=f"没有 id={tx_id} 的记录")
    return {"deleted": True, "id": tx_id}


@app.get("/api/summary")
def api_summary(month: str | None = None) -> dict:
    """总览页顶部。balance 可以为负；没有数据返回 0，不返回 404。"""
    month = month or _this_month()
    _require_month(month)
    expense, income, count = db.month_summary(month)
    return {"month": month, "expense": expense, "income": income,
            "balance": income - expense, "count": count}


@app.get("/api/categories")
def api_categories(month: str | None = None, type: str = "expense") -> dict:
    """分析页柱状图。

    db.category_totals 只返回库里有的类别，这里用 _fill_zero 补满 8 类。
    契约写死「必须返回全部 8 个类别，没有记录的返回 0」，所以收入也返回
    8 类（除「收入」外都是 0），不按 type 少返回。
    契约还要 count，但 db 没有按类别计数的函数，所以每个类别再调一次
    query_sum（它同时返回金额和笔数）。量级很小，不用为它改契约。
    """
    month = month or _this_month()
    _require_month(month)
    _require_type(type)

    keys = _categories()
    totals = _fill_zero(db.category_totals(month=month, type=type), keys)
    first, last = _month_range(month)
    items = []
    for cat in keys:
        _, cnt = db.query_sum(first, last, cat, type)
        items.append({"category": cat, "amount": totals[cat], "count": cnt})
    return {"month": month, "type": type, "items": items}


@app.get("/api/trend")
def api_trend(month: str | None = None, type: str = "expense") -> dict:
    """分析页折线图。db.daily_totals 只返回有记录的天，这里补满整月。

    一天都不能少：缺一天折线就断了，而且不会报错。
    """
    month = month or _this_month()
    _require_month(month)
    _require_type(type)
    by_day = dict(db.daily_totals(month, type))
    items = [{"day": d, "amount": by_day.get(d, 0)} for d in _days_in(month)]
    return {"month": month, "items": items}


@app.post("/api/query")
def api_query(payload: dict) -> dict:
    """AI 查账。

    parser 只负责「把问题翻译成条件」，这里按 metric 选统计函数，最后拼
    answer。answer 只是展示，真正的数字全在 data 里，前端要核对也方便。
    """
    question = payload.get("question") if isinstance(payload, dict) else None
    if not isinstance(question, str) or not question.strip():
        raise HTTPException(status_code=400, detail="question 不能为空")

    parsed = parser.parse_question(question.strip())
    day_from, day_to = parsed["from"], parsed["to"]
    category = parsed.get("category")
    type_ = parsed.get("type") or "expense"
    metric = parsed.get("metric") or "sum"

    _require_type(type_)
    if metric not in ("sum", "count", "ranking"):
        raise HTTPException(status_code=500, detail=f"parser 返回了不认识的 metric：{metric!r}")

    if metric == "ranking":
        rows = db.query_ranking(day_from, day_to, limit=5, type=type_)
        data = {"items": [{"category": c, "amount": a} for c, a in rows]}
        kind = "收入" if type_ == "income" else "支出"
        if rows:
            body = "、".join(f"{c} {_yuan(a)} 元" for c, a in rows)
            answer = f"{day_from} 到 {day_to}，{kind}排行：{body}。"
        else:
            answer = f"{day_from} 到 {day_to} 没有{kind}记录。"
    else:
        amount, count = db.query_sum(day_from, day_to, category, type_)
        data = {"amount": amount, "count": count}
        label = category or (parser.INCOME if type_ == "income" else "支出")
        if metric == "count":
            answer = f"{day_from} 到 {day_to}，{label}共 {count} 笔。"
        else:
            answer = f"{day_from} 到 {day_to}，{label}共 {_yuan(amount)} 元，{count} 笔。"

    return {
        "answer": answer,
        "understood": {"from": day_from, "to": day_to, "category": category,
                       "type": type_, "metric": metric},
        "data": data,
    }


@app.get("/api/budget")
def api_budget_get(month: str | None = None) -> dict:
    """预算页。

    'all' 那条一定返回，没设过就 budget: null。分类条目只返回用户设过的。
    budget 为 None（或 0）时 ratio 也是 None，别让前端除出 Infinity。
    """
    month = month or _this_month()
    _require_month(month)
    first, last = _month_range(month)

    rows = db.list_budgets(month)
    budgets = {r["category"]: r["amount"] for r in rows}

    all_budget = budgets.get("all")
    all_used, _ = db.query_sum(first, last, None, "expense")
    items = [{"category": "all", "budget": all_budget, "used": all_used,
              "ratio": (all_used / all_budget) if all_budget else None}]

    order = {k: i for i, k in enumerate(_categories())}
    for cat in sorted((c for c in budgets if c != "all"), key=lambda c: order.get(c, 99)):
        budget = budgets[cat]
        used, _ = db.query_sum(first, last, cat, "expense")
        items.append({"category": cat, "budget": budget, "used": used,
                      "ratio": (used / budget) if budget else None})

    return {"month": month, "items": items}


@app.put("/api/budget")
def api_budget_put(payload: dict) -> dict:
    """设置预算。category 必须是 'all' 或 8 类之一。

    用 PUT 不用 POST：同一个位置重复设成同一个值，结果必须一样。
    db.set_budget 用 ON CONFLICT DO UPDATE 保证幂等。
    """
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="请求体必须是 JSON 对象")

    month = payload.get("month") or _this_month()
    category = payload.get("category")
    amount = payload.get("amount")

    _require_month(month)
    if category != "all" and category not in _categories():
        raise HTTPException(status_code=400, detail="category 必须是 'all' 或 8 个类别之一")
    if not isinstance(amount, int) or isinstance(amount, bool) or amount < 0:
        raise HTTPException(status_code=400, detail="amount 必须是非负整数（单位：分）")

    db.set_budget(month, category, amount)
    return {"month": month, "category": category, "amount": amount}


@app.get("/api/meta")
def api_meta() -> dict:
    """前端启动时读一次：类别清单、收入常量、今天的日期。

    有了它，前端不用再硬编码一份类别表，否则后端加了类别前端不知道。
    """
    return {
        "categories": [{"key": k, "label": k} for k in _categories()],
        "income": parser.INCOME,
        "today": date.today().isoformat(),
    }


# ---------------------------------------------------------------- 静态页面

@app.get("/")
def index() -> FileResponse:
    return FileResponse(FRONTEND / "index.html")


# finora 的 index.html 里用的是 ./assets/... 相对路径，
# 页面在 /，所以资源就落在 /assets/... 上
app.mount("/assets", StaticFiles(directory=FRONTEND / "assets"), name="assets")
