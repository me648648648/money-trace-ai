# C 返工单 · `backend/db.py` 按契约 v2 重写

> 发给：C（数据层）
> 分支：`back-store`，**不要直接推 main**
> 只允许改：`backend/db.py`。不要碰 `parser.py`、`main.py`、`contract.py`、前端。
> 依据：`contract.py` 里「契约 v2 · 2026-11-18」横幅以下，重点看第三节 db 部分。
> 注意：`contract.py` 顶部的 v1 段已经废弃。现在仓库里的 `db.py` 也是 v1（183 行），这次是**重写**，不是小修。

---

## 0. 开工前先做这 3 步

1. 回 main 拉最新，切自己的分支：

   ```
   git checkout main
   git pull
   git checkout back-store
   git merge main
   ```

2. 打开 `contract.py` 第三节 db 部分，确认看到两张表的建表 SQL 和 13 个函数签名。看不到就别动手。

3. **删掉旧的数据库文件**（如果你本机跑过 v1 服务，`data/ledger.db` 里已经有 `records` 表）：

   ```
   python -c "import pathlib; pathlib.Path('data/ledger.db').unlink(missing_ok=True); print('已删除')"
   ```

   为什么必须删：`init_db()` 用的是 `CREATE TABLE IF NOT EXISTS`。旧库里已经有 `records` 表，它不会自动变成 `transactions`，也不会改列类型。不删的话你会建出一个「旧表还在、新表也建了」的库，自测时数据对不上还找不到原因。`data/*.db` 已经在 `.gitignore` 里，不会误提交。

   > 仓库里现在 `data/` 只有 `.gitkeep`，没有 db 文件；这一步是防你本机之前跑过。

---

## 1. 表结构（照抄，别改列名）

```sql
CREATE TABLE IF NOT EXISTS transactions (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    day      TEXT    NOT NULL,              -- 'YYYY-MM-DD'，必须补零
    amount   INTEGER NOT NULL,              -- 单位：分，永远正数
    type     TEXT    NOT NULL,              -- 'expense' / 'income'
    category TEXT    NOT NULL,
    merchant TEXT    NOT NULL DEFAULT '',   -- 没认出来存空串，不存 NULL
    note     TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS budgets (
    month    TEXT    NOT NULL,              -- 'YYYY-MM'
    category TEXT    NOT NULL,              -- 类别键，或 'all' 表示总预算
    amount   INTEGER NOT NULL,              -- 单位：分
    PRIMARY KEY (month, category)
);
```

两个容易写错的地方：

- `amount` 是 `INTEGER`，不是 `REAL`。这是 v2 最核心的改动。
- `budgets` 的主键是 `(month, category)` 两列，不是只有 `month`。

---

## 2. 13 个函数（签名和返回写死）

按契约顺序：

```python
init_db() -> None
add_row(day, amount, type, category, merchant, note) -> int
list_rows(limit=20, offset=0, month=None, category=None, type=None, q=None) -> list[dict]
count_rows(month=None, category=None, type=None, q=None) -> int
delete_row(tx_id) -> int
category_totals(month=None, type="expense") -> dict
month_summary(month) -> tuple
daily_totals(month, type="expense") -> list
query_sum(day_from, day_to, category=None, type=None) -> tuple
query_ranking(day_from, day_to, limit=5, type="expense") -> list
get_budget(month, category) -> int | None
set_budget(month, category, amount) -> None
list_budgets(month) -> list[dict]
```

逐个说清楚：

### `add_row`
- 6 个业务参数，`merchant` / `note` **必须传**，没有值就传空串——缺省值由 `main.py` 补，db 不替调用方兜底，签名和契约第三节 `add_row` 的写法保持一致。
- 返回 `cur.lastrowid`。
- `amount` 进来就已经是整数分，**函数内不做 `/100`、不做 `round(float(...))`**。如果传进来的不是 `int`，直接 `raise ValueError("金额必须是整数分")`，不要静默转换——静默转换会把 `2300.9` 截成 `2300`，bug 更难查。

### `list_rows`
- 返回 `list[dict]`，每项 **7 个键**：`id, day, amount, type, category, merchant, note`。
- 排序：`ORDER BY day DESC, id DESC`（同一天后记的在前）。
- 筛选条件：
  - `month` → `day LIKE ?`，参数 `f"{month}-%"`
  - `category` → `category = ?`
  - `type` → `type = ?`
  - `q` → `(merchant LIKE ? OR note LIKE ?)`，参数都写 `f"%{q}%"`
- 分页：`LIMIT ? OFFSET ?`，`int()` 一下防字符串。
- 用 `conn.row_factory = sqlite3.Row`，返回前 `dict(row)`。不要直接把 `Row` 丢出去，FastAPI 能序列化但类型不对。

### `count_rows`
- 和 `list_rows` **同样的 WHERE**，只是不加 LIMIT/OFFSET，返回 `SELECT COUNT(*)`。
- 这一条是分页的 `total`。如果两边的筛选条件写得不一样，就会出现「第一页 20 条、总数 18 条」这种鬼数据。建议把 WHERE 拼装抽成一个内部小函数，两个函数共用，从结构上保证一致。

### `delete_row`
- `DELETE ... WHERE id = ?`，返回 `cur.rowcount`（0 或 1）。

### `category_totals`
- 返回 `{类别: 金额}`，例如 `{"餐饮": 3012, "交通": 10000}`。
- **必须带 `WHERE type = ?`**，默认 `'expense'`。不加就把收入也算进支出。
- 有 `month` 就再加 `day LIKE ?`。
- `GROUP BY category`。
- **只返回库里有的类别，不补零**。补零是 `main.py` 的事，契约 v2 第 6 条 `/api/categories` 的说明写明了。

### `month_summary`
- 返回 `(expense, income, count)` 三元组。
- `expense` = 该月 `type='expense'` 的金额和；`income` = 该月 `type='income'` 的金额和；`count` = 该月**全部**笔数（支出+收入）。
- 没有数据时三项都返回 0，不要返回 `None`。
- 一条 SQL 就能做完，用 `CASE WHEN`：

  ```sql
  SELECT
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense,
      COALESCE(SUM(CASE WHEN type = 'income'  THEN amount END), 0) AS income,
      COUNT(*) AS count
  FROM transactions
  WHERE day LIKE ?
  ```

### `daily_totals`
- 返回 `[(day, 金额), ...]`，例如 `[("2026-11-01", 12000), ("2026-11-03", 500)]`。
- `WHERE day LIKE ? AND type = ?`，`GROUP BY day`，**`ORDER BY day ASC`**（折线图要从左到右）。
- **只返回有记录的天，不补天**。补天是 `main.py` 的 `_days_in()` 干的。

### `query_sum`
- 返回 `(总额, 笔数)`。
- `WHERE day BETWEEN ? AND ?`；`category` 有值再加 `category = ?`；`type` 有值再加 `type = ?`。
- `type=None` 表示支出和收入都算。注意：预算和统计调用时 `main.py` 会传 `type='expense'`，别自己默认成 `'expense'` 覆盖掉入参。
- 没有记录返回 `(0, 0)`。

### `query_ranking`
- 返回 `[(类别, 金额), ...]`，按金额从大到小，`LIMIT ?`。
- `WHERE day BETWEEN ? AND ? AND type = ?`，`GROUP BY category ORDER BY 金额 DESC`。

### `get_budget`
- `SELECT amount FROM budgets WHERE month = ? AND category = ?`。
- 没有记录返回 `None`（不是 0）。

### `set_budget`
- 必须是：

  ```sql
  INSERT INTO budgets (month, category, amount) VALUES (?, ?, ?)
  ON CONFLICT(month, category) DO UPDATE SET amount = excluded.amount
  ```

- **不要用 `INSERT OR REPLACE`**。它先删整行再插，以后 `budgets` 加列（比如加备注、加创建时间），没在 INSERT 里写的列会被重置成默认值。
- 重复调同一组参数，结果必须一样（幂等）。

### `list_budgets`
- 返回 `list[dict]`，每项 3 个键：`month, category, amount`。
- `WHERE month = ?`；没有记录返回 `[]`。
- 排序随意，建议 `ORDER BY category`；`'all'` 放不放第一由 `main.py` 处理，db 不用管。

---

## 3. 三条纪律（组长 review 会逐条查）

### 纪律一：amount 进出都是整数分，函数内不出现 `/100`

自测时跑这句，输出必须是 0：

```
grep -n "/100" backend/db.py
```

（Windows cmd / PowerShell 里没有 grep 就直接在编辑器里搜 `/100`。）

### 纪律二：所有 `SUM(amount)` 前面必须有 `type` 条件

自测时搜 `SUM(amount)`，每一处都要能说清楚「这个和是支出还是收入」。漏一次，收支就混了。用 `CASE WHEN type = ...` 也算满足。

### 纪律三：`category_totals` 和 `daily_totals` 不补零、不补天

这两个函数只回答「库里有什么」。类别补到 8 个、日期补满整月，是路由层的活。你在 db 里补了，`main.py` 再补一次，逻辑就重复了，以后改类别要改两处。

---

## 4. 自测顺序（照这个顺序跑，出错好定位）

1. `init_db()` 连调两次，不报错。
2. `add_row(...)` 插 3 条：一笔支出、一笔支出、一笔收入。返回的 id 是 int。
3. `list_rows()` 能查到 3 条，第一条是日期最大的；每项 7 个键。
4. `count_rows()` 不带条件 = 3；`count_rows(type="income")` = 1。
5. `category_totals("2026-11")` 只含支出类别，金额是分。
6. `month_summary("2026-11")` 返回 `(支出和, 收入和, 3)`。
7. `daily_totals("2026-11")` 只含有记录的天。
8. `query_sum("2026-11-01", "2026-11-30", type="expense")` 等于支出和、笔数对。
9. `query_ranking(...)` 金额从大到小。
10. `set_budget("2026-11", "all", 170000)` → `get_budget` 读到 170000；再设成 180000，读 180000；重复设 180000，仍是 180000。
11. `list_budgets("2026-11")` 条数对。
12. `delete_row(id)` 返回 1，再删同一个返回 0。

自测脚本放 `D:\pycharm\PyCharmMiscProject\project1\_check_db.py`，**不要提交进仓库**。开头这样写，避免污染 `data/ledger.db`：

```python
import sys, pathlib
sys.path.insert(0, r"D:\GitHubproject\money-trace-ai")

import backend.db as db

# 把数据库指到临时文件，别动仓库里的 data/ledger.db
db.DB_PATH = pathlib.Path(r"D:\pycharm\PyCharmMiscProject\project1\_tmp_ledger.db")
db.DB_PATH.unlink(missing_ok=True)

db.init_db()
# 下面按第 4 节的 12 步写 assert……
```

> `_conn()` 里是用模块级 `DB_PATH`，所以这样改能生效。跑完记得把 `_tmp_ledger.db` 删掉。

**不要**把 v1 那段 `if __name__ == "__main__":` 自测代码留在 `db.py` 里——它会 `os.remove(DB_PATH)` 把真库删掉，而且调的是旧签名。提 PR 前删干净。

---

## 5. 验收命令（贴 PR 里）

建表对不对：

```
python -c "import sqlite3; c=sqlite3.connect('data/ledger.db'); print(c.execute('PRAGMA table_info(transactions)').fetchall()); print(c.execute('PRAGMA table_info(budgets)').fetchall())"
```

期望：`transactions` 有 `id, day, amount, type, category, merchant, note` 七列，`amount` 的类型是 `INTEGER`；`budgets` 三列。

函数齐不齐：

```
python -c "import inspect, backend.db as d; [print(n, inspect.signature(getattr(d, n))) for n in ['init_db','add_row','list_rows','count_rows','delete_row','category_totals','month_summary','daily_totals','query_sum','query_ranking','get_budget','set_budget','list_budgets']]"
```

期望：13 行，参数名和契约一致。

再启动一次服务，确认 `data/ledger.db` 自动创建、`/docs` 打得开。

---

## 6. 常见坑

1. 沿用 v1 的 `records` 表名 → 接口全 500 报 `no such table`。
2. `amount REAL` → 攒几十笔后出现 `832.9999999`。
3. `add_row` 里又做一次 `round(float(amount), 2)` → 分被当元再 round，金额缩小 100 倍。
4. `SUM(amount)` 忘了 `type` 条件 → 支出把收入加进去。
5. `list_rows` 和 `count_rows` 的 WHERE 不一致 → 分页总数错。
6. `daily_totals` 用了 `DESC` → 折线图从右往左。
7. `set_budget` 用 `INSERT OR REPLACE`。
8. `budgets` 主键只写 `month` → 第二个类别设预算时把第一个覆盖掉。
9. 直接返回 `sqlite3.Row` → 前端拿到的是不可 JSON 序列化的对象（或字段名对不上）。
10. `month` 筛选写成 `day = ?` → 一条都查不到，要用 `LIKE 'YYYY-MM-%'`。

---

## 7. 完成标准（Definition of Done）

- [ ] 第 4 节 12 步自测全过，贴输出到 PR。
- [ ] 第 5 节两条验收命令的输出贴到 PR。
- [ ] `grep "/100" backend/db.py` 无输出。
- [ ] 只改了 `backend/db.py` 一个文件；`__main__` 自测块已删除。
- [ ] PR 由组长 review 后合并，自己不合自己的 PR。

---

## 附：一个契约缺口，先别自己发明

`/api/categories` 的响应要 `{category, amount, count}`（契约 v2 第 6 条 `/api/categories`），但 `db.category_totals` 只返回 `{类别: 金额}`，13 个函数里**没有**「按类别统计笔数」的函数。

这次先按契约把 `category_totals` 写成只返回金额，**不要**自己加第 14 个函数、也不要偷偷改返回结构——契约只有组长能改。这个缺口组长会定：要么加一个 `category_stats`，要么把 `category_totals` 的返回值扩成带笔数。定了会广播，届时再改。
