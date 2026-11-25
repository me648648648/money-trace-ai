# AI 兜底接入说明（骨架版）

> 状态：**只有骨架，实现由 AI 负责人写。**
> 代码位置：`backend/ai.py`（单文件）
> 本文位置：`backend/_AI接入说明.md`（跟 `_B_返工单.md`、`_C_返工单.md` 放一起）
> 适用 main：`fe46772`
> 更新：2026-11-24

---

## 1. 范围

三条入口，路由都在 `main.py`（组长维护），AI 负责人只改 `backend/ai.py`：

- 解析兜底：`/api/parse`，`parser.parse_text` 认不出来时补字段；
- 小票识别：`POST /api/receipt`，收一张图片，返回一笔流水；
- 查账回答：`/api/query`，数字仍由 db 算，模型只把结果写成一两句中文。

不做多轮对话、不做分析总结、不做单独的类别纠错接口。
新增了 `/api/receipt` 和 `/api/query` 的 answer 生成，契约需要组长补一段 v3
（把新路由和 501 写进去）；`/api/parse` 的返回形状没变。

---

## 2. 文件结构

只有一个文件：`backend/ai.py`。里面从上到下分五块：

| 区块 | 现在有什么 | 组员要补什么 |
| --- | --- | --- |
| 配置 | `AIConfig` 字段 | `load_config()`、`missing_fields()` |
| 提示词 | `SYSTEM_TEMPLATE` 占位 | 提示词、`build_messages()` |
| 调模型 | `AIError`、`OpenAICompatClient` 签名 | `chat()`、`make_client()` |
| 触发与合并 | `needs_ai()`、`merge_suggestion()` 签名 + 约束注释 | 两个函数的实现 |
| 小票识别 | `ocr_receipt()` 签名 | 实现（视觉模型） |
| 查账回答 | `compose_answer()` 空实现 | 实现（失败必须返回规则答案） |
| 入口 | `maybe_fill()` 空壳 | 换成实现，保留 fail-open |

`maybe_fill()` 现在是 `return parsed`、`compose_answer()` 现在是 `return fallback`，
`ocr_receipt()` 抛 `NotImplementedError`（路由翻译成 501），所以骨架合进 main 后
线上行为完全不变。
AI 只有一个人负责，代码就一个文件，免得为改一句提示词在几个文件之间跳。
`main.py` 的 import 仍是 `from backend.ai import maybe_fill`，不受影响。
不要把 AI 逻辑写进 `parser.py`，parser 是纯函数，不碰网络。

---

## 3. 实现必须遵守的规则

### 3.1 输入输出

输入是 `parser.parse_text(text)` 的返回值：

```python
{"day": "YYYY-MM-DD", "amount": 整数分或None, "type": "expense|income",
 "category": "类别", "merchant": "", "note": "原句",
 "understood": {"day": bool, "amount": bool, "type": bool,
                "category": bool, "merchant": bool}}
```

输出必须是同样形状，`understood` 五个键一个都不能少。

### 3.2 触发（`needs_ai`）

`strict` 只问两种情况：`amount is None`，或 `understood.category is False`。

注意：普通支出 `打车 23块` 的 `day`、`type`、`merchant` 本来就是 false（默认今天、默认支出），
**不是解析失败**。用「任何 false 都问」会让每条正常记账都调一次模型。

四种模式：`off` / `strict` / `any` / `always`，后两种只用于调试。

### 3.3 模型只输出五个字段

```json
{"day": "YYYY-MM-DD 或 null",
 "amount_text": "原文金额片段或 null",
 "type": "expense | income | null",
 "category": "类别或 null",
 "merchant": "商户名或空字符串"}
```

`amount_text` 必须是原文片段（如 `"23块"`、`"二十三块五毛"`），不是数字。
换算调用 `parser._extract_amount`，**不接受模型自己算的数**，否则元/分容易差 100 倍。

### 3.4 合并（`merge_suggestion`）校验表

| 字段 | 接受条件 | 不满足 |
| --- | --- | --- |
| `day` | 补零 `YYYY-MM-DD` 且真实存在；原句有日期说法，或等于今天 | 丢弃 |
| `amount_text` | 是原句子串；换算结果是正整数（分） | 丢弃 |
| `type` | `expense` / `income`；income 时类别强制「收入」 | 丢弃 |
| `category` | 属于 7 个支出类 + 其他；「收入」只能配 income | 丢弃 |
| `merchant` | 非空、≤30 字、原句子串 | 丢弃 |

另外两条：`understood` 为 true 的字段一律不改；任何异常都原样返回 `parsed`。

### 3.5 标记策略

前端用 `understood` 决定提示「请核对：xx」，值照用。

- `safe`（默认）：AI 补了值但标记保持 false，前端会提示用户核对；
- `trust`：AI 补了值就把标记改 true。模型稳定后再切。

---

## 4. 配置变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `AI_ENABLED` | `0` | 总开关 |
| `AI_MODE` | `cloud` | `cloud` / `stub` |
| `AI_BASE_URL` | 空 | 只填到 `/v1`，例 `https://api.deepseek.com/v1` |
| `AI_API_KEY` | 空 | 只放本机，不进代码 |
| `AI_MODEL` | 空 | 例 `deepseek-chat`、`qwen2.5:7b` |
| `AI_TIMEOUT` | `8` | 秒 |
| `AI_TRIGGER` | `strict` | `off` / `strict` / `any` / `always` |
| `AI_FLAG_POLICY` | `safe` | `safe` / `trust` |
| `AI_JSON_MODE` | `0` | 1 = 带 `response_format=json_object` |
| `AI_RETRIES` | `0` | 最多 1 |
| `AI_DEBUG` | `0` | 1 = 打印触发原因和耗时，不打原文 |
| `AI_LOG_TEXT` | `0` | 1 = 连原文一起打（本地调试才开） |

常用取值：

- 云端 DeepSeek：`AI_BASE_URL=https://api.deepseek.com/v1`，`AI_MODEL=deepseek-chat`
- 云端通义：`AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`，`AI_MODEL=qwen-plus`
- 本地 Ollama：`AI_BASE_URL=http://localhost:11434/v1`，`AI_MODEL=qwen2.5:7b`，key 随便填
- 本地 LM Studio：`AI_BASE_URL=http://localhost:1234/v1`

`.env` 放仓库根。仓库的 `.gitignore` 已经包含 `.env`（2026-11-24 核对），不用再加。

---

## 5. 接线（组长改，组员不碰 main.py）

`backend/main.py` 顶部：

```python
from backend.ai import AIError, compose_answer, maybe_fill, ocr_receipt
```

三处接线（已经加好，组员不用动）：

```python
# /api/parse
return maybe_fill(text.strip(), parser.parse_text(text.strip()))

# /api/query 的返回里
"answer": compose_answer(question, parsed, data, answer),

# /api/receipt 新路由
return ocr_receipt(data, mime=file.content_type or "")
```

小票路由的边界：只收 `image/*`、非空、≤5MB；`ocr_receipt` 没实现时返回 501，
模型报错返回 500。`requirements.txt` 已加 `python-multipart`，FastAPI 收文件必须有它。

---

## 6. 组员任务与验收

实现顺序：

1. 读懂 `parser.parse_text` 和 `understood` 五个键；
2. 补 `ai.py` 里的 `load_config`、`chat`，先用 stub 把链路跑通；
3. 写 `ai.py` 顶部的 `SYSTEM_TEMPLATE`，接本地 Ollama 调提示词；
4. 补 `needs_ai`、`merge_suggestion`，最后把 `maybe_fill` 换成实现；
5. 接云端模型，手工验收。

DoD：

- 自己写的验收用例全过（测试由组员自己写，不在这个骨架里）；
- `_check_parser.py` 仍 16/16、接口冒烟仍 128/128（两个脚本在组长本地，找组长要）；
- `AI_ENABLED=0` 时 `/api/parse` 与合并前逐字段一致；
- 模型超时、401、返回非 JSON 时，`/api/parse` 仍 200 且形状不变；
- 模型失败时 `/api/query` 的 `answer` 与规则答案逐字一致；
- `POST /api/receipt` 非图片 400、未实现 501、实现后 200 且形状同 `/api/parse`；
- 视觉模型可用：云端用视觉版，本地 Ollama 用 llava / qwen2.5-vl 之类；
- `打车 23块` 在 strict 下不调模型；
- 仓库里搜不到 key，`.env` 在 `.gitignore`；
- PR 描述贴验收输出，key 打码。

---

## 7. 归属与 PR 流程

契约 v2 写死 `main.py` 只有组长能改，所以：

1. 组长先把骨架和接线合进 main（AI 关闭，零行为变化）；
2. 组员从最新 main 开 `ai-fallback` 分支，只改 `backend/ai.py`；
3. PR base = `main`，描述首行写「已 merge main，当前 main HEAD = xxxx」；
4. 组长审、组长合，作者不合自己的 PR。

小票识别的前端图片上传是 A 的文件，AI 负责人只交付后端 `ocr_receipt()`；
查账回答的 `answer` 字段形状没变，前端不用改。

---

## 8. 已知边界

- `麦当劳 三十`（中文数字不带「块/元」）金额仍认不出：换算是规则层的事，
  不要为了让 AI 补上而在这一层绕过去。
- `满30减5` 仍取最早的金额，`3块5` 仍只算 3000，都是 parser 既有行为。
- 小票一期只返回一笔，因为 parse 的形状就是一筆；多商品拆分不在本轮。
- 图片上限 5MB，超了直接 400；视觉模型不支持图片时 `ocr_receipt` 会报错。
- 不做缓存。同一句话重复解析会重复调模型，量小先不做。
