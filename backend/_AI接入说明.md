# AI 接入说明（已实现版）

> 状态：**三条入口已实现并合并进 main**（PR #14，merge commit `e7cbc1f`）。
> 代码位置：`backend/ai.py`（单文件，只归 AI 负责人改）
> 契约位置：`contract.py`「契约 v3 · 2026-11-26」第 8 条补充和第 12 条
> 本文位置：`backend/_AI接入说明.md`
> 适用 main：`e7cbc1f`
> 更新：2026-11-26

---

## 1. 范围

三条入口，路由都在 `main.py`（组长维护），AI 负责人只改 `backend/ai.py`：

- 解析兜底：`/api/parse`，`parser.parse_text` 认不出来时补字段；
- 小票识别：`POST /api/receipt`，收一张图片，返回一笔流水草稿；
- 查账回答：`/api/query`，数字仍由 db 算，模型只把结果写成一两句中文。

不做多轮对话、不做分析总结、不做单独的类别纠错接口。
`/api/parse` 和 `/api/query` 的返回形状没变；`/api/receipt` 是 v3 新增的第 12 条。
前端的小票上传按钮还没接后端（`index.html` / `app.js` 是 A 的文件），属于下一轮。

---

## 2. 文件结构

只有一个文件：`backend/ai.py`，从上到下分七块：

| 区块 | 内容 |
| --- | --- |
| 配置 | `AIConfig`、`load_config()`、`describe_config()`（不含 key） |
| 提示词 | `SYSTEM_TEMPLATE`、`RECEIPT_SYSTEM_TEMPLATE`、`ANSWER_SYSTEM_TEMPLATE` |
| 调模型 | `AIError`（带 `retryable`）、`StubClient`、`OpenAICompatClient`、`make_client()` |
| 触发与合并 | `needs_ai()`、`merge_suggestion()` 及其校验 |
| 小票识别 | `ocr_receipt()`、`_receipt_to_parsed()`、`_sniff_mime()` |
| 查账回答 | `compose_answer()`、数字护栏 `_numbers_allowed()` |
| 入口 | `maybe_fill()` |

`main.py` 顶部只 import 四个名字：`AIError, compose_answer, maybe_fill, ocr_receipt`。
不要把 AI 逻辑写进 `parser.py`，parser 是纯函数，不碰网络。

---

## 3. 运行行为对照

| 场景 | `/api/parse` | `/api/query` | `/api/receipt` |
| --- | --- | --- | --- |
| `AI_ENABLED=0`（默认） | 与 v2 逐字一致 | 与 v2 逐字一致 | 500「AI 未开启」 |
| `AI_ENABLED=1` + `AI_MODE=stub` | stub 建议合并进结果 | 规则答案（stub 不参与改写） | 200，固定假小票 18.50 |
| `AI_ENABLED=1` + `AI_MODE=cloud` | 模型补字段 | 模型改写措辞 | 视觉模型识别 |

失败时（fail-open）：

| 情况 | 结果 |
| --- | --- |
| parse：模型超时 / 401 / 非 JSON / 合并异常 | 200，原样返回 parser 结果，形状不变 |
| query：任意异常 / 编造数字 / 超过 120 字 | 200，`answer` 与规则答案逐字一致 |
| receipt：未开启 / 未配置 / 模型失败 / 认不出小票 | 500 + 可读 `detail` |

---

## 4. 实现必须遵守的规则

### 4.1 输入输出

输入是 `parser.parse_text(text)` 的返回值：

```python
{"day": "YYYY-MM-DD", "amount": 整数分或None, "type": "expense|income",
 "category": "类别", "merchant": "", "note": "原句",
 "understood": {"day": bool, "amount": bool, "type": bool,
                "category": bool, "merchant": bool}}
```

输出必须是同样形状，`understood` 五个键一个都不能少。

### 4.2 触发（`needs_ai`）

`strict` 只问两种情况：`amount is None`，或 `understood.category is False`。

注意：普通支出 `打车 23块` 的 `day`、`type`、`merchant` 本来就是 false（默认今天、默认支出），
**不是解析失败**。用「任何 false 都问」会让每条正常记账都调一次模型。

四种模式：`off` / `strict` / `any` / `always`，后两种只用于调试。

### 4.3 模型只输出五个字段

```json
{"day": "YYYY-MM-DD 或 null",
 "amount_text": "原文金额片段或 null",
 "type": "expense | income | null",
 "category": "类别或 null",
 "merchant": "商户名或空字符串"}
```

`amount_text` 必须是原文片段（如 `"23块"`、`"二十三块五毛"`），不是数字。
换算调用 `parser._extract_amount`，**不接受模型自己算的数**，否则元/分容易差 100 倍。

### 4.4 合并（`merge_suggestion`）校验表

| 字段 | 接受条件 | 不满足 |
| --- | --- | --- |
| `day` | 补零 `YYYY-MM-DD` 且真实存在；原句有日期说法，或等于今天 | 丢弃 |
| `amount_text` | 是原句子串；换算结果是正整数（分） | 丢弃 |
| `type` | `expense` / `income`；income 时类别强制「收入」 | 丢弃 |
| `category` | 属于 7 个支出类 + 其他；「收入」只能配 income | 丢弃 |
| `merchant` | 非空、≤30 字、原句子串 | 丢弃 |

另外两条：`understood` 为 true 的字段一律不改；任何异常都原样返回 `parsed`。

### 4.5 标记策略

前端用 `understood` 决定提示「请核对：xx」，值照用。

- `safe`（默认）：AI 补了值但标记保持 false，前端会提示用户核对；
- `trust`：AI 补了值就把标记改 true。模型稳定后再切。

### 4.6 小票与回答的硬约束

小票：

- 只返回 `parse_text` 的 7 个键，**不允许**出现 `items`、`source` 之类的额外字段；
- 一期只返回一笔（合计金额那一笔），不写库；
- `amount` 是整数分；认不出用 `null` 且 `understood.amount=False`；
- 真实格式按文件头魔数判断，只认 PNG / JPEG / WebP，不信浏览器声明的 Content-Type；
- `items` 被模型返回成对象、字符串、None 时一律当空列表，不能抛 `TypeError`；
- 失败统一 `raise AIError`，由路由翻译成 500 + detail。

查账回答：

- 数字护栏：回答里出现的数字必须已经在规则答案 `fallback` 里出现过，否则整句退回 `fallback`；
- 超过 120 字、空字符串、任何异常，一律 `return fallback`；
- 支持 `AI_FLAG_POLICY` 的 `safe` / `trust` 两种模式。

---

## 5. 配置变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `AI_ENABLED` | `0` | 总开关 |
| `AI_MODE` | `cloud` | `cloud` / `stub`（stub 不联网，只跑链路和演示） |
| `AI_BASE_URL` | 空 | 只填到 `/v1`，例 `https://api.deepseek.com/v1` |
| `AI_API_KEY` | 空 | 只放本机，不进代码 |
| `AI_MODEL` | 空 | 例 `deepseek-chat`、`qwen2.5:7b` |
| `AI_TIMEOUT` | `8` | 秒，夹在 1~120 |
| `AI_TRIGGER` | `strict` | `off` / `strict` / `any` / `always` |
| `AI_FLAG_POLICY` | `safe` | `safe` / `trust` |
| `AI_JSON_MODE` | `0` | 1 = 带 `response_format=json_object` |
| `AI_RETRIES` | `0` | 最多 1；只重试 5xx / 408 / 超时 / 网络错误，401/403/404/429 不重试 |
| `AI_DEBUG` | `0` | 1 = 打印触发原因和耗时，不打原文 |
| `AI_LOG_TEXT` | `0` | 1 = 连原文一起打（本地调试才开） |
| `AI_VISION_BASE_URL` | 空 | 留空沿用 `AI_BASE_URL` |
| `AI_VISION_API_KEY` | 空 | 留空沿用 `AI_API_KEY` |
| `AI_VISION_MODEL` | 空 | 留空沿用 `AI_MODEL`；视觉模型例 `qwen-vl-plus`、`llava` |
| `AI_VISION_TIMEOUT` | `30` | 秒，视觉请求单独的超时 |

常用取值：

- 云端 DeepSeek：`AI_BASE_URL=https://api.deepseek.com/v1`，`AI_MODEL=deepseek-chat`
- 云端通义：`AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`，`AI_MODEL=qwen-plus`
- 本地 Ollama：`AI_BASE_URL=http://localhost:11434/v1`，`AI_MODEL=qwen2.5:7b`，key 随便填
- 本地 LM Studio：`AI_BASE_URL=http://localhost:1234/v1`

`.env` 放仓库根，已被 `.gitignore` 忽略。
注意：`load_config()` 每次会读 `.env`，但**已经存在的环境变量优先**，所以改完 `.env`
必须重启 uvicorn；`--reload` 只盯代码文件，不会因为 `.env` 变化自动重启。

---

## 6. 接线（组长维护，AI 负责人不碰 main.py）

`backend/main.py` 顶部：

```python
from backend.ai import AIError, compose_answer, maybe_fill, ocr_receipt
```

三处接线：

```python
# /api/parse
return maybe_fill(text.strip(), parser.parse_text(text.strip()))

# /api/query 的返回里
"answer": compose_answer(question, parsed, data, answer),

# /api/receipt 路由
return ocr_receipt(data, mime=file.content_type or "")
```

小票路由的边界（路由层先拦）：只收 `image/*`、非空、≤5MB，三条不满足都是 400；
`ocr_receipt` 抛 `AIError` 时返回 500 + detail。`requirements.txt` 有 `python-multipart`，
FastAPI 收文件必须有它，缺了服务连启动都启动不了。

---

## 7. 验收与回归

每次改完 `ai.py`，按这个清单跑：

- [ ] `_check_parser.py` 仍 16/16（AI 默认关闭，不影响解析）
- [ ] `_smoke_api.py` 仍 0 失败（2026-11-26 实测 129 项全过）
- [ ] `AI_ENABLED=0` 时 `/api/parse` 与合并前逐字段一致
- [ ] `AI_ENABLED=0` 时 `/api/query` 的 answer 与规则答案逐字一致
- [ ] `POST /api/receipt`：txt → 400、空文件 → 400、超 5MB → 400、AI 关闭 → 500
- [ ] `AI_MODE=stub` 时 `/api/receipt` → 200，7 键、`understood` 5 键、`amount=1850`
- [ ] 模型超时 / 401 / 返回非 JSON 时，`/api/parse` 仍 200 且形状不变
- [ ] 模型乱返回 `items` 时小票接口不抛未捕获异常（500 + detail，不是裸 500）
- [ ] `打车 23块` 在 strict 下不调模型
- [ ] 仓库里搜不到 key，`.env` 在 `.gitignore` 里
- [ ] PR 描述贴验收输出，key 打码

---

## 8. 归属与 PR 流程

`backend/ai.py` 只归 AI 负责人；`main.py`、`contract.py` 只有组长能改。

后续修改流程：

1. 从最新 main 开分支（例 `ai-fallback-v2`），只改 `backend/ai.py`；
2. PR base = `main`，描述首行写「已 merge main，当前 main HEAD = xxxx」；
3. 组长审、组长合，作者不合自己的 PR；
4. 改了必填参数或返回形状的，先升契约（v4）再改代码。

前端小票上传（选图 → POST `/api/receipt` → 填表单 → 处理 400/500）是 A 的活，
只改 `frontend/finora-ai/index.html` 和 `assets/js/app.js`。

---

## 9. 已知边界

- `麦当劳 三十`（中文数字不带「块/元」）金额仍认不出：换算是规则层的事，
  不要为了让 AI 补上而在这一层绕过去。
- `满30减5` 仍取最早的金额，`3块5` 仍只算 3000，都是 parser 既有行为。
- 小票一期只返回一笔，多商品拆分不在本轮；`items` 不进响应。
- 小票图片只认 PNG / JPEG / WebP；超过 5MB 路由直接 400。
- `AI_MODE=stub` 的小票是写死的假数据（18.50、校园咖啡店），只能在演示/联调用。
- 不做缓存，同一句话重复解析会重复调模型，量小先不做。
- 小票类别兜底借用了 `parser._classify`（私有函数）；parser 若改名，`ai.py` 要同步改。
- 429 目前不重试；量小暂无影响，将来要加退避再说。
