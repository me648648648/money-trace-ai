# Finora AI · 校园账本

一句话记账、规则解析、小票识别、AI 查账、预算提醒。
后端 FastAPI + SQLite，前端原生 HTML/CSS/JS，没有框架、没有构建步骤。

## 快速开始

```bash
python -m pip install -r requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

浏览器打开 <http://localhost:8000>，接口文档在 <http://localhost:8000/docs>。

> 用 `python -m uvicorn` 而不是直接敲 `uvicorn`，避免脚本目录不在 PATH。
> 如果 8000 被系统或安全软件占用（Windows 报 `WinError 10013`），换一个端口即可，
> 例如 `--port 8001`，页面里的接口都是相对路径，不用改代码。

前后端同一个端口：`main.py` 把 `frontend/finora-ai` 挂在根路径，同源，不用配 CORS。

## 功能

- **一句话记账**：`parser` 规则解析；认不出的字段由 AI 兜底补，`understood` 标记会告诉前端哪些字段需要核对。
- **小票识别**：上传小票/支付截图 → `POST /api/receipt` → 返回一笔流水草稿 → 用户确认后才写入账本。
- **AI 查账**：`POST /api/query` 的数字由 db 计算，AI 只把结果润色成一两句中文；数字对不上或模型失败时逐字退回规则答案。
- **流水 / 分析 / 预算**：分页筛选、分类统计、支出趋势、月度预算进度。
- **首页 AI 助手**：支持记账和查账；与账本无关的输入会明确提示「只支持记账/查账/小票识别」，不会乱查账。

## 目录

| 路径 | 负责人 | 说明 |
| --- | --- | --- |
| `contract.py` | 组长 | 接口契约（当前 **v3**），签名和返回形状不准私改 |
| `backend/main.py` | 组长 | 路由层，12 条 HTTP 接口 |
| `backend/parser.py` | B | 规则解析：一句话 → 结构化数据 |
| `backend/db.py` | C | 数据层，全项目唯一写 SQL 的地方 |
| `backend/ai.py` | AI 负责人 | AI 三入口：`maybe_fill` / `ocr_receipt` / `compose_answer` |
| `backend/_AI接入说明.md` | AI 负责人 | AI 实现边界、配置、验收与已知问题 |
| `frontend/finora-ai/index.html` | A | 页面结构 |
| `frontend/finora-ai/assets/js/app.js` | A | 交互逻辑，全部通过 `fetch` 拿数据 |
| `frontend/finora-ai/assets/css/app.css` | A | 样式 |
| `data/ledger.db` | 运行时 | SQLite 数据库，首次启动自动创建，已在 `.gitignore` |
| `docs/流程图.md` | 全员 | 业务流程与数据流 |

## AI 接入（可选，默认关闭）

不配任何 AI 变量也能完整使用：`AI_ENABLED=0` 时解析、查账、预算等行为与接入前完全一致。
需要 AI 时，在**仓库根目录**新建 `.env`（已被 `.gitignore` 忽略，**不要把 key 提交进仓库**）：

```ini
AI_ENABLED=1
AI_MODE=cloud
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=sk-你的key
AI_MODEL=qwen-plus
AI_VISION_MODEL=qwen3-vl-plus

AI_TIMEOUT=8
AI_TRIGGER=strict
AI_FLAG_POLICY=safe
AI_JSON_MODE=0
AI_RETRIES=0
AI_DEBUG=0
AI_LOG_TEXT=0
AI_VISION_TIMEOUT=30
```

常用配置：

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `AI_ENABLED` | `0` | 总开关，`0` 时所有 AI 路径短路 |
| `AI_MODE` | `cloud` | `cloud` / `stub`（stub 不联网，用固定假数据联调） |
| `AI_BASE_URL` | 空 | OpenAI 兼容地址，只填到 `/v1` |
| `AI_API_KEY` | 空 | 只放本机 `.env` |
| `AI_MODEL` | 空 | 文字模型，如 `qwen-plus`、`deepseek-chat` |
| `AI_VISION_MODEL` | 空 | 小票识别用的视觉模型，如 `qwen3-vl-plus`、`llava`；留空则沿用 `AI_MODEL` |
| `AI_VISION_BASE_URL` / `AI_VISION_API_KEY` | 空 | 视觉模型单独一家时再填，否则沿用主配置 |
| `AI_TRIGGER` | `strict` | `off` / `strict` / `any` / `always`，后两个只用于调试 |
| `AI_FLAG_POLICY` | `safe` | `safe` 时 AI 补的值仍标 false，前端提示核对；`trust` 才标 true |
| `AI_JSON_MODE` | `0` | `1` 时带 `response_format=json_object` |
| `AI_RETRIES` | `0` | 最多 `1`；只重试超时/网络错误/5xx/408，401/403 不重试 |
| `AI_DEBUG` | `0` | `1` 时打印触发原因和耗时 |
| `AI_LOG_TEXT` | `0` | `1` 时连原句一起打印（本地调试才开） |

示例服务商：

- 阿里云百炼：`https://dashscope.aliyuncs.com/compatible-mode/v1`，文字 `qwen-plus`，视觉模型以控制台「模型广场 → 视觉理解」当前名称为准；
- 本地 Ollama：`http://localhost:11434/v1`，文字 `qwen2.5:7b`，看图 `llava` / `qwen2.5vl`；
- DeepSeek：`https://api.deepseek.com/v1`，`deepseek-chat`（纯文本，小票要另配视觉模型）。

改完 `.env` 必须**重启服务**才生效（uvicorn 的 `--reload` 只监听 `.py`）。

## 接口一览

完整请求/响应见 `contract.py` 的「契约 v3」和 `/docs`：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/parse` | 一句话 → 一笔流水草稿（带 `understood`） |
| POST | `/api/receipt` | 小票图片（multipart `file`）→ 一笔流水草稿 |
| GET | `/api/transactions` | 流水列表，支持 month/category/type/q/分页 |
| POST | `/api/transactions` | 新增流水 |
| DELETE | `/api/transactions/{id}` | 删除流水 |
| GET | `/api/summary` | 月度收支汇总 |
| GET | `/api/categories` | 分类统计（固定 8 类） |
| GET | `/api/trend` | 每日趋势（补满整月） |
| POST | `/api/query` | 查账，`answer` 可由 AI 润色 |
| GET / PUT | `/api/budget` | 预算查询 / 设置 |
| GET | `/api/meta` | 类别、收入常量、今天 |

小票接口边界：只收 `image/*`、非空、≤ 5MB；按文件头只认 PNG / JPEG / WebP；
AI 未开启、视觉模型未配置、模型失败、认不出小票时返回 `500 + detail`；成功返回与 `/api/parse` 相同的 7 个键。

## 设计要点

- **金额一律整数「分」**：接口、数据库、AI 都不出现 float 元，前端展示时才 `/100`。
- **日期格式即契约**：日期 `YYYY-MM-DD`、月份 `YYYY-MM`，字典序就是时间序。
- **模型不参与算术**：金额、笔数、区间只能来自 `parser` 或 `db`；AI 只补字段或润色措辞。
- **AI 不写库**：小票和一句话记账都只产出草稿，写库统一走 `POST /api/transactions`。
- **失败不能带崩主流程**：`/api/parse` 永远 200（fail-open），`/api/query` 失败退回规则答案，
  `/api/receipt` 失败返回可读 `detail`。
- **XSS 防护**：渲染用户输入统一 `escape()`，不直接拼 `innerHTML`。

## 测试与回归

- 组长本地维护 `_check_parser.py`（16/16）和 `_smoke_api.py`（129 项），合并前跑一遍；
- AI 改动额外要求：`AI_ENABLED=0` 时 `/api/parse`、`/api/query` 与合并前逐字段一致；
- 小票回归：txt → 400、空文件 → 400、超 5MB → 400、AI 关闭 → 500、
  `AI_MODE=stub` → 200 且 7 键、`understood` 5 键；
- AI 负责人自测用例见 `backend/_AI接入说明.md` 第 7 节。

## 已知边界

- `麦当劳 三十`（中文数字不带「块/元」）金额仍认不出，属于换算层问题，不在 AI 这层绕过；
- `满30减5` 取最早的金额、`3块5` 只算 3000，都是 parser 既有行为；
- 小票一期只返回一笔（合计金额那笔），多商品拆分不在本轮；
- 小票只认 PNG / JPEG / WebP，HEIC 等格式前端会先拦掉；
- `AI_MODE=stub` 的小票是写死的假数据（18.50、校园咖啡店），只用于演示/联调；
- 不做缓存，同一句话重复解析会重复调模型。

## 协作规则

- 每人只改自己负责的文件（见目录表）；`contract.py`、`backend/main.py` 只有组长能改；
- 改接口形状属于升契约（当前 v3 → v4），要先广播再动代码；
- 开发分支提 PR 到 `main`，描述首行写「已 merge main，当前 main HEAD = xxxx」，作者不合自己的 PR；
- `.env`、`data/*.db` 不进仓库；key 只放本机。
