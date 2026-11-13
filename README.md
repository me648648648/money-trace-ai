# ledger-mini-web · 个人记账

一句话记账、规则解析、查账、预算提醒。
后端 FastAPI + SQLite，前端原生 HTML/CSS/JS，没有框架、没有构建步骤。

## 快速开始


pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000


浏览器打开 http://localhost:8000 。

接口文档（自动生成，可以直接点着试）：http://localhost:8000/docs

> 前后端同一个端口：`main.py` 把 `frontend/` 挂在根路径，所以打开 8000 就是页面。
> 好处是同源，不用配 CORS。

## 目录

| 路径 | 负责人 | 说明 |
| --- | --- | --- |
| `contract.py` | 组长 | HTTP 接口 + Python 函数的契约，签名不准改 |
| `backend/main.py` | 组长 | 路由层。现在返回假数据，B/C 写好就换成真调用 |
| `backend/parser.py` | B | 解析层：一句话 → 结构化数据 |
| `backend/db.py` | C | 数据层：全项目唯一写 SQL 的地方 |
| `frontend/index.html` | A | 页面结构 |
| `frontend/app.js` | A | 交互逻辑，全部通过 `fetch` 拿数据 |
| `frontend/style.css` | A | 样式 |

## 分工与流程

见 `docs/分工与流程.md`。

## 设计要点

**先有假数据，再有真实现。** `main.py` 每个接口都先返回写死的假数据，前端 A 第一天就能把三个页面做完。B、C 的实现上线后，把 `main.py` 里的 MOCK 换成真函数调用，前端一行不用改。

**页面不算数。** `app.js` 里没有任何金额计算，合计、排序、百分比全部来自后端。前端只负责发请求和画页面。

**日期格式是契约。** 一律 `YYYY-MM-DD`，月份一律 `YYYY-MM`。这套格式下字典序就是时间序，SQL 的 `BETWEEN` 才能直接比字符串。

**XSS 防护。** 渲染备注用 `textContent` 而不是 `innerHTML`，因为备注是用户输入。


