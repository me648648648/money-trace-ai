# B 返工单 · `backend/parser.py` 按契约 v2 重写

> 发给：B（解析层）
> 分支：`back-analyze`，**不要直接推 main**
> 只允许改：`backend/parser.py`。不要碰 `db.py`、`main.py`、`contract.py`、前端。
> 依据：`contract.py` 里「契约 v2 · 2026-11-18」横幅以下的全部内容。
> 注意：`contract.py` 顶部的 v1 段已经废弃，**别照着写**（v1 段里那句「金额一律 float」是 v1 的，v2 改成了整数分）。

---

## 0. 开工前先做这 3 步

1. 回到 main 并拉最新：

   ```
   git checkout main
   git pull
   ```

2. 切到自己的分支（已存在就合并 main）：

   ```
   git checkout back-analyze
   git merge main
   ```

3. 打开 `contract.py`，从「契约 v2 · 2026-11-18」横幅往下读到文件末尾，确认看到这四句话：金额整数分、8 个类别、新增 `type` 和 `merchant`、`understood` 取代 `source`。看不全就先别动手。

---

## 1. 这次要交什么

文件顶部补 4 个常量（v1 没有，`main.py` 已经按 v2 引用它们了，缺一个就 `AttributeError`）：

| 常量 | 类型 | 内容 |
| --- | --- | --- |
| `CATEGORIES` | `dict` | 7 个支出类别 → 关键词列表 |
| `OTHER` | `str` | `"其他"` |
| `INCOME` | `str` | `"收入"` |
| `ALL_CATEGORIES` | `list` | 8 个键，顺序固定：餐饮、交通、购物、居住、娱乐、健康医疗、学习教育、其他 |

五个函数全部保留，但返回形状换成 v2：

```
cn_to_int(text) -> int | None
_find_date(text, today) -> str          # 'YYYY-MM-DD'
_find_range(text, today) -> (str, str)
parse_text(text, today=None) -> dict
parse_question(text, today=None) -> dict
```

---

## 2. 返回形状（逐字段写死）

`parse_text`：

```python
{
    "day": "2026-11-16",        # 'YYYY-MM-DD'，必须补零
    "amount": 2300,             # 整数分；认不出来是 None，不许用 0 冒充
    "type": "expense",          # 只有 'expense' / 'income'
    "category": "交通",         # 8 类之一；收入固定 "收入"
    "merchant": "",             # 认不出来是空串，不是 None
    "note": "昨天打车 23 块",   # 原句
    "understood": {
        "day": True, "amount": True, "type": False,
        "category": True, "merchant": False,
    },
}
```

`parse_question`：

```python
{
    "from": "2026-10-01",
    "to": "2026-10-31",
    "category": "餐饮",         # None 表示不限类别
    "type": "expense",
    "metric": "sum",            # 只有 'sum' / 'count' / 'ranking'
    "understood": {
        "from": True, "to": True, "category": True,
        "type": False, "metric": True,
    },
}
```

**`understood` 的语义（建议口径，等组长确认）：**
`True` = 这句话里确实认到了；`False` = 用了默认值（默认今天、默认支出、默认 sum、没认出类别）。前端拿它把「猜的字段」标黄让用户改。
契约 v2 第一节写「四个布尔值」，但同一节的示例是 5 个键（day/amount/type/category/merchant）。**按示例的 5 个键实现**，这是契约正文的笔误，组长会统一。

---

## 3. 四个根因分别怎么改

v1 的 8 个 bug 不是 8 个独立错误，是 4 个根因：

### 根因 1：金额正则吃掉了日期

v1 用 `re.search(r'\d+(\.\d+)?', text)` 直接找第一段数字。`'2026-11-13 打车 30'` 最先撞到的是年份 `2026`，于是金额变成 2026 元。

改法：**先认日期、把日期片段从文本里删掉，再找金额**。顺序不能反。

```
原句 → 找日期片段（记下起止位置）→ 从文本里抠掉 → 在剩下的文本里找金额
```

要抠的日期形态：

- `2026-11-13`、`2026/11/13`
- `11月13日`、`11月13号`
- `今天`、`昨天`、`前天`、`明天`

### 根因 2：`_find_date` 完全不认显式日期

v1 只认昨天/前天/明天，`day` 永远是今天附近。所以 `'2026-11-13 打车 30'` 的日期也是错的。

改法：按优先级认，认到就返回：

1. `YYYY-MM-DD` / `YYYY/M/D`
2. `M月D日` / `M月D号`——年份取 `today.year`；如果算出来的日期比今天晚，**仍然取今年**（不跨年推断，保持简单，遇到跨年再说）
3. 今天（`1`）、昨天（`-1`）、前天（`-2`）、明天（`+1`）
4. 都认不到 → 返回今天

返回值一律 `date.isoformat()`，别用 `str(today)`——如果传进来的是 `datetime`，`str()` 会带 `' 00:00:00'`，格式就不是 `YYYY-MM-DD` 了。

### 根因 3：类别里的 `break` 只跳出内层循环

```python
for cat, keywords in CATEGORIES.items():
    for kw in keywords:
        if kw in text:
            category = cat
            break          # 只跳出内层，外层继续，最后匹配的赢
```

结果就是「打车去吃饭」判成交通、「买了一杯奶茶」判成购物。

改法：**不要用「最后一个赢」，改成打分**：

1. 遍历 8 个类别（含「其他」，但它没有关键词，永远 0 分）；
2. 每命中一个关键词，把**关键词长度**加进这个类别的分（`吃` 加 1，`吃饭` 加 2，`奶茶` 加 2）；
3. 取分数最高的类别；
4. 最高分是 0 → `"其他"`；并列 → 也给 `"其他"`（宁可判不出来，也别乱猜）。

为什么按长度累加而不是命中个数：`'打车去吃饭 50'` 里交通命中「打车」=2 分，餐饮命中「吃」+「饭」+「吃饭」=1+1+2=4 分，餐饮赢；`'买了一杯奶茶 18'` 里购物「买」=1 分，餐饮「奶茶」=2 分，餐饮赢。用命中个数则前者 1:1 并列、后者 1:1 并列，两个都判不出来。

### 根因 4：`_find_range` 把「上个月」当成 today-30 天

契约 v2 第三节 `_find_range` 的说明写死了：**「上个月」必须是 2026-10-01 ~ 2026-10-31，不是 today-30 天**。另外 v1 没有「最近 30 天」分支，所以 `'最近30天消费多少'` 退化成今天一天。

---

## 4. 时间区间对照表（验收基准 today = 2026-11-17，周二）

| 说法 | from | to | 说明 |
| --- | --- | --- | --- |
| 本月 / 这个月 | 2026-11-01 | 2026-11-30 | 自然整月。契约 v2 第 8 条 `/api/query` 的示例就是整月 |
| 上个月 / 上月 | 2026-10-01 | 2026-10-31 | 自然月，不是减 30 天 |
| 最近 30 天 / 近30天 | 2026-10-19 | 2026-11-17 | 含今天共 30 天 |
| 本周 / 这周 | 2026-11-16 | 2026-11-17 | 周一到今天 |
| 上周 | 2026-11-09 | 2026-11-15 | 上一个完整自然周（周一~周日） |
| 今天 | 2026-11-17 | 2026-11-17 | |
| 都认不出来 | 2026-11-01 | 2026-11-30 | 默认本月整月 |

「上周」的端点契约没写死，上面是建议口径（自然周）。组长确认后按这个来；不确定就先用它，并在 PR 描述里写明。

---

## 5. 金额怎么换算成分（不许用 float）

`30.5 元` 要变成 `3050`。**不要写 `int(30.5 * 100)`**——浮点数会给你 `3049.9999999999995`，`int()` 一截就成 3049。

两种安全写法，任选一种：

- 按字符串拆：`'30.5'.split('.')` → 整数部分 `30`、小数部分 `5`，小数补成两位 `50`，结果 `30*100 + 50`；
- 或者 `Decimal('30.5') * 100` 再取整。

中文数字只在**后面跟着单位**时才当金额：「二十块」→ 2000、「三十元」→ 3000。单独一个「一」「两」不算——`'买了一本书'` 的 1 是量词，不是钱。这条就是 bug 列表里 `amount=1.0` 的来源。

一句话里同时有「三十块」和「2026」时，先抠日期（根因 1），再按单位找金额。

---

## 6. 收支和商家（B 自己定，PR 里写清楚）

契约只规定了字段，没给词表，这两块由你设计，但要在 PR 描述里列出你加了哪些词，方便组长 review 和组长更新文档。

- `type`：句子里出现「工资 / 薪水 / 生活费 / 红包 / 兼职 / 报销 / 退款 / 奖金 / 利息 / 到账」等 → `income`，`category` 固定 `"收入"`；否则 `expense`。
- `merchant`：维护一份常见商家词表（麦当劳、肯德基、星巴克、瑞幸、蜜雪冰城、美团、饿了么、滴滴、淘宝、京东、拼多多……），命中就填，认不到就 `""`。
- 商家词可以同时给类别加分（「麦当劳」给餐饮加分），但别让商家词把类别带偏。

---

## 7. 验收用例（today = 2026-11-17）

前 8 条是交接文档里实测出来的 bug，必须全过；后 6 条是补充的边界。

| # | 输入 | 期望 |
| --- | --- | --- |
| 1 | `2026-11-13 打车 30` | day=2026-11-13，amount=3000，category=交通 |
| 2 | `11月13日 吃饭 30块` | day=2026-11-13，amount=3000，category=餐饮 |
| 3 | `买了一本书` | amount=None（不许是 100）；category 允许「学习教育」或「其他」 |
| 4 | `打车去吃饭 50` | category=餐饮（打分法必须过） |
| 5 | `买了一杯奶茶 18` | category=餐饮，amount=1800 |
| 6 | `上个月吃饭花了多少` | from=2026-10-01，to=2026-10-31，category=餐饮 |
| 7 | `最近30天消费多少` | from=2026-10-19，to=2026-11-17，category=None |
| 8 | `哪个分类花得最多` | from=2026-11-01，to=2026-11-30，metric=ranking |
| 9 | `二十块买菜` | amount=2000 |
| 10 | `昨天打车 23 块` | day=2026-11-16，amount=2300，category=交通，understood.day/amount/type/category 都是 True，merchant=False |
| 11 | `前天麦当劳 35.5` | day=2026-11-15，amount=3550，category=餐饮，merchant=麦当劳，understood.merchant=True |
| 12 | `今天公交 2` | day=2026-11-17，amount=200 |
| 13 | `本周吃饭花了多少` | from=2026-11-16，to=2026-11-17，category=餐饮，metric=sum |
| 14 | `上周打车多少笔` | from=2026-11-09，to=2026-11-15，category=交通，metric=count |

补充判断规则：

- metric：出现「几次 / 多少笔 / 几笔 / 笔数」→ `count`；出现「最多 / 排行 / 哪个分类 / 哪类」→ `ranking`；其余 `sum`。
- `parse_question` 的 `type` 默认 `expense`；出现收入词才 `income`。

---

## 8. 自测脚本放哪（别放进仓库）

`parser.py` 是纯函数模块，不要在里面加 `if __name__ == "__main__"` 自测。

在 `D:\pycharm\PyCharmMiscProject\project1\` 下新建 `_check_parser.py`（这个目录不在仓库里，不会被提交），开头把仓库路径加进去：

```python
import sys
sys.path.insert(0, r"D:\GitHubproject\money-trace-ai")

from datetime import date
from backend.parser import parse_text, parse_question

TODAY = date(2026, 11, 17)

r = parse_text("2026-11-13 打车 30", today=TODAY)
assert r["day"] == "2026-11-13", r
assert r["amount"] == 3000, r
assert r["category"] == "交通", r
print("case 1 ok", r)
```

把第 7 节 14 条逐条写成 `assert`，全绿再提 PR。哪条红就把那行输入和实际返回贴到群里，别自己猜。

---

## 9. 常见坑（对照自查）

1. `str(datetime(...))` 会带时分秒 → 用 `.date().isoformat()`。
2. 金额用 `float * 100` 会出现 3049.999… → 按字符串拆或 `Decimal`。
3. 类别匹配 `break` 只跳内层 → 打分，不 break。
4. 日期没补零：`2026-11-5` 会让那笔账在 SQL 里静默漏掉 → 用 `f"{y:04d}-{m:02d}-{d:02d}"`。
5. 先找金额后抠日期 → 年份被当金额。
6. 把「上个月」写成 `today - 30 天`。
7. 单独的中文「一」「两」被当金额。
8. 在 `parser.py` 里 `import db` 或 `import main` → 死循环/启动报错，parser 必须独立。

---

## 10. 完成标准（Definition of Done）

- [ ] 第 7 节 14 条用例全过（贴运行输出到 PR）。
- [ ] `import backend.parser` 没有任何副作用（不建库、不读文件）。
- [ ] 只改了 `backend/parser.py` 一个文件。
- [ ] PR 描述里列出：新增的类别关键词、收入关键词、商家词表、任何你自己定的口径（如「上周」端点）。
- [ ] PR 由组长 review 后合并，自己不合自己的 PR。

---

## 附：需要组长先拍板的 3 个点

这 3 个点契约没写死，B 实现前最好在群里确认，避免返工：

1. `understood` 到底是 5 个键还是 4 个（本单按 5 个实现）；`True` 表示「认到了」还是「是猜的」（本单按「认到了」）。
2. `parse_question` 的 `understood` 子键形状（本单按 from/to/category/type/metric 五个布尔）。
3. 「本周 / 上周」按自然周还是滚动 7 天（本单按自然周）。
