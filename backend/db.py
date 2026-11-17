"""C 负责：数据层，全项目唯一写 SQL 的地方。"""

import sqlite3
from pathlib import Path
from contextlib import contextmanager

# 数据库文件路径
DB_PATH = Path(__file__).resolve().parent.parent / "data" / "ledger.db"


@contextmanager
def _conn():
    """上下文管理器：自动处理数据库连接与关闭，无需在每个函数里写 try...finally"""
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
            CREATE TABLE IF NOT EXISTS records (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                day      TEXT    NOT NULL,
                amount   REAL    NOT NULL,
                category TEXT    NOT NULL,
                note     TEXT    DEFAULT ''
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS budgets (
                month  TEXT PRIMARY KEY,
                amount REAL NOT NULL
            )
        """)
        conn.commit()


def add_row(day, amount, category, note='') -> int:
    """新增一条记录，返回新记录的 id。"""
    if not day or amount is None:
        raise ValueError("日期和金额不能为空")

    try:
        amount = round(float(amount), 2)
    except (ValueError, TypeError):
        raise ValueError("金额必须是有效的数字")

    with _conn() as conn:
        cur = conn.execute(
            "INSERT INTO records (day, amount, category, note) VALUES (?, ?, ?, ?)",
            (day, amount, category, note or ""),
        )
        conn.commit()
        return cur.lastrowid


def list_rows(limit=20) -> list[dict]:
    """最近 limit 条记录，按日期倒序。返回包含字典的列表。"""
    with _conn() as conn:
        rows = conn.execute(
            "SELECT id, day, amount, category, note FROM records ORDER BY day DESC, id DESC LIMIT ?",
            (int(limit),),
        ).fetchall()
        return [dict(r) for r in rows]


def delete_row(tx_id) -> int:
    """按 id 删除，返回删除的行数（0 或 1）。"""
    try:
        tx_id = int(tx_id)
    except (ValueError, TypeError):
        raise ValueError("无效的记录 ID")

    with _conn() as conn:
        cur = conn.execute("DELETE FROM records WHERE id = ?", (tx_id,))
        conn.commit()
        return cur.rowcount


def category_totals() -> dict:
    """所有分类的累计支出。返回字典 {类别: 金额}。"""
    with _conn() as conn:
        rows = conn.execute("""
            SELECT category, SUM(amount) AS total
            FROM records
            GROUP BY category
        """).fetchall()
        return {row["category"]: row["total"] for row in rows}


def month_summary(month) -> tuple:
    """某月汇总，返回元组 (总额, 笔数)。"""
    with _conn() as conn:
        row = conn.execute("""
            SELECT
                COALESCE(SUM(amount), 0) AS total,
                COUNT(*) AS count
            FROM records
            WHERE day LIKE ?
        """, (f"{month}-%",)).fetchone()
        return (row["total"], row["count"])


def query_sum(day_from, day_to, category=None) -> tuple:
    """区间求和，返回元组 (总额, 笔数)。"""
    with _conn() as conn:
        sql = "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM records WHERE day BETWEEN ? AND ?"
        params = [day_from, day_to]
        if category:
            sql += " AND category = ?"
            params.append(category)

        row = conn.execute(sql, params).fetchone()
        return (row["total"], row["count"])


def query_ranking(day_from, day_to, limit=5) -> list:
    """区间内按分类排行，返回列表 [(类别, 金额)]。"""
    with _conn() as conn:
        rows = conn.execute("""
            SELECT category, SUM(amount) AS total
            FROM records
            WHERE day BETWEEN ? AND ?
            GROUP BY category
            ORDER BY total DESC
            LIMIT ?
        """, (day_from, day_to, int(limit))).fetchall()
        return [(row["category"], row["total"]) for row in rows]


def get_budget(month) -> float | None:
    """查某月预算，没有返回 None。"""
    with _conn() as conn:
        row = conn.execute(
            "SELECT amount FROM budgets WHERE month = ?", (month,)
        ).fetchone()
        return None if row is None else row["amount"]


def set_budget(month, amount) -> None:
    """设置/更新某月预算，有则覆盖。"""
    try:
        amount = round(float(amount), 2)
    except (ValueError, TypeError):
        raise ValueError("预算金额必须是有效的数字")

    with _conn() as conn:
        conn.execute(
            """
            INSERT INTO budgets (month, amount) VALUES (?, ?)
            ON CONFLICT(month) DO UPDATE SET amount = excluded.amount
            """,
            (month, amount),
        )
        conn.commit()


if __name__ == "__main__":
    # 自测代码：清空库并验证契约格式
    import os

    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print("旧数据库已清理，开始全新测试...\n")

    init_db()

    rid1 = add_row("2026-11-01", 30.123, "餐饮", "午饭")
    rid2 = add_row("2026-11-02", 100, "交通", "打车")
    add_row("2026-11-03", 45, "餐饮", "晚饭")
    print(f"[add_row] 返回 ID: {rid1}, {rid2} (类型: int)")

    print("\n[list_rows] 返回:", list_rows(), "(类型: list[dict])")
    print("[category_totals] 返回:", category_totals(), "(类型: dict)")
    print("[query_sum 全部] 返回:", query_sum("2026-11-01", "2026-11-30"), "(类型: tuple)")
    print("[query_ranking] 返回:", query_ranking("2026-11-01", "2026-11-30"), "(类型: list)")
    print("[month_summary] 返回:", month_summary("2026-11"), "(类型: tuple)")
    print("[delete_row] 返回:", delete_row(rid1), "(类型: int)")