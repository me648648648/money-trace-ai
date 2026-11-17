"""C 负责：数据层，全项目唯一写 SQL 的地方。"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "ledger.db"


def _conn():
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    raise NotImplementedError


def add_row(day, amount, category, note):
    raise NotImplementedError


def list_rows(limit=20):
    raise NotImplementedError


def delete_row(tx_id):
    raise NotImplementedError


def category_totals():
    raise NotImplementedError


def month_summary(month):
    raise NotImplementedError


def query_sum(day_from, day_to, category=None):
    raise NotImplementedError


def query_ranking(day_from, day_to, limit=5):
    raise NotImplementedError


def get_budget(month):
    raise NotImplementedError


def set_budget(month, amount):
    raise NotImplementedError
