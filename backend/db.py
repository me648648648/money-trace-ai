"""C 负责：数据层，全项目唯一写 SQL 的地方。"""

import sqlite3
from pathlib import Path
from contextlib import contextmanager

# 数据库文件路径
DB_PATH = Path(__file__).resolve().parent.parent / "data" / "ledger.db"


@contextmanager
def _conn():
    """上下文管理器：自动处理数据库连接与关闭"""
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    """建表，重复调用不报错。"""
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS transactions(
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                day      TEXT    NOT NULL,
                amount   INTEGER NOT NULL,
                type     TEXT    NOT NULL,
                category TEXT    NOT NULL,
                merchant TEXT    NOT NULL DEFAULT '',
                note     TEXT    NOT NULL DEFAULT ''
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS budgets(
                month    TEXT    NOT NULL,
                category TEXT    NOT NULL,
                amount   INTEGER NOT NULL,
                PRIMARY KEY(month,category)
            )
        """)
        conn.commit()


def add_row(day, amount, type, category, merchant, note) -> int:
    """新增一条记录，返回新记录的 id。"""
    if not isinstance(amount, int):
        raise ValueError("金额必须是整数分")

    # 防止外部传入 None，这里做一次兜底转换成空串
    merchant = merchant or ""
    note = note or ""

    with _conn() as conn:
        cur = conn.execute(
            """INSERT INTO transactions (day, amount, type, category, merchant, note)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (day, amount, type, category, merchant, note),
        )
        conn.commit()
        return cur.lastrowid


def _build_where(month=None, category=None, type=None, q=None) -> tuple[str, list]:
    """内部辅助函数：拼接 WHERE 条件，确保 list_rows 和 count_rows 完全一致。"""
    conditions = []
    params = []

    if month:
        conditions.append("day LIKE ?")
        params.append(f"{month}-%")
    if category:
        conditions.append("category = ?")
        params.append(category)
    if type:
        conditions.append("type = ?")
        params.append(type)
    if q:
        conditions.append("(merchant LIKE ? OR note LIKE ?)")
        params.append(f"%{q}%")
        params.append(f"%{q}%")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    return where_clause, params


def list_rows(limit=20, offset=0, month=None, category=None, type=None, q=None) -> list[dict]:
    """按条件查询流水，分页返回。"""
    where_clause, params = _build_where(month, category, type, q)

    sql = f"""
        SELECT id, day, amount, type, category, merchant, note 
        FROM transactions 
        {where_clause} 
        ORDER BY day DESC, id DESC 
        LIMIT ? OFFSET ?
    """
    params.extend([int(limit), int(offset)])

    with _conn() as conn:
        rows = conn.execute(sql, params).fetchall()
        return [dict(r) for r in rows]


def count_rows(month=None, category=None, type=None, q=None) -> int:
    """查询符合条件的总数，用于分页。"""
    where_clause, params = _build_where(month, category, type, q)

    sql = f"SELECT COUNT(*) AS count FROM transactions {where_clause}"

    with _conn() as conn:
        row = conn.execute(sql, params).fetchone()
        return row["count"]


def delete_row(tx_id) -> int:
    """按 id 删除，返回删除的行数（0 或 1）。"""
    try:
        tx_id = int(tx_id)
    except (ValueError, TypeError):
        raise ValueError("无效的记录 ID")

    with _conn() as conn:
        cur = conn.execute("DELETE FROM transactions WHERE id = ?", (tx_id,))
        conn.commit()
        return cur.rowcount


def category_totals(month=None, type="expense") -> dict:
    """所有分类的累计支出。返回字典 {类别: 金额}。"""
    conditions = ["type = ?"]
    params = [type]

    if month:
        conditions.append("day LIKE ?")
        params.append(f"{month}-%")

    where_clause = f"WHERE {' AND '.join(conditions)}"

    with _conn() as conn:
        rows = conn.execute(f"""
            SELECT category, SUM(amount) AS total
            FROM transactions
            {where_clause}
            GROUP BY category
        """, params).fetchall()
        return {row["category"]: row["total"] for row in rows}


def month_summary(month) -> tuple:
    """某月汇总，返回元组 (expense, income, count)。"""
    with _conn() as conn:
        row = conn.execute("""
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0)  AS income,
                COUNT(*) AS count
            FROM transactions
            WHERE day LIKE ?
        """, (f"{month}-%",)).fetchone()
        return (row["expense"], row["income"], row["count"])


def daily_totals(month, type="expense") -> list:
    """某月每日流水趋势，返回 [(day, amount), ...]，只含有记录的天。"""
    with _conn() as conn:
        rows = conn.execute("""
            SELECT day, SUM (amount) AS total
            FROM transactions
            WHERE day LIKE ? AND type = ?
            GROUP BY day
            ORDER BY day ASC
        """, (f"{month}-%", type)).fetchall()
        return [(row["day"], row["total"]) for row in rows]


def query_sum(day_from, day_to, category=None, type=None) -> tuple:
    """区间求和，返回元组 (总额, 笔数)。"""
    sql = "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM transactions WHERE day BETWEEN ? AND ?"
    params = [day_from, day_to]

    if category:
        sql += " AND category = ?"
        params.append(category)
    if type:
        sql += " AND type = ?"
        params.append(type)

    with _conn() as conn:
        row = conn.execute(sql, params).fetchone()
        return (row["total"], row["count"])


def query_ranking(day_from, day_to, limit=5, type="expense") -> list:
    """区间内按分类排行，返回列表 [(类别, 金额)]。"""
    with _conn() as conn:
        rows = conn.execute("""
            SELECT category, SUM(amount) AS total
            FROM transactions
            WHERE day BETWEEN ? AND ? AND type = ?
            GROUP BY category
            ORDER BY total DESC
            LIMIT ?
        """, (day_from, day_to, type, int(limit))).fetchall()
        return [(row["category"], row["total"]) for row in rows]


def get_budget(month, category) -> int | None:
    """查某月某类别预算，没有返回 None。"""
    with _conn() as conn:
        row = conn.execute(
            "SELECT amount FROM budgets WHERE month = ? AND category = ?",
            (month, category)
        ).fetchone()
        return None if row is None else row["amount"]


def set_budget(month, category, amount) -> None:
    """设置/更新某月某类别预算，使用 ON CONFLICT 保证幂等性。"""
    if not isinstance(amount, int):
        raise ValueError("金额必须是整数分")

    with _conn() as conn:
        conn.execute(
            """
            INSERT INTO budgets (month, category, amount)
            VALUES (?, ?, ?) ON CONFLICT(month, category) DO
            UPDATE SET amount = excluded.amount
            """,
            (month, category, amount),
        )
        conn.commit()


def list_budgets(month) -> list[dict]:
    """列出某月所有的预算项。"""
    with _conn() as conn:
        rows = conn.execute(
            "SELECT month, category, amount FROM budgets WHERE month = ? ORDER BY category",
            (month,)
        ).fetchall()
        return [dict(r) for r in rows]