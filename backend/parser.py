"""B 负责：一句话 → 结构化数据。纯函数，不写库、不碰网络。

口径按 contract.py「契约 v2 · 2026-11-18」：金额是整数分，类别 7+1，
流水带 type / merchant，parse 返回 understood 置信标记。
"""
import calendar
import re
from datetime import date, datetime, timedelta

import cn2an

OTHER = "其他"
INCOME = "收入"

CATEGORIES = {
    "餐饮": [
        "吃饭", "外卖", "奶茶", "火锅", "麦当劳", "肯德基", "星巴克", "瑞幸",
        "蜜雪冰城", "夜宵", "早餐", "午餐", "晚餐", "餐厅", "食堂", "咖啡",
        "烧烤", "麻辣烫", "包子", "面包", "零食", "水果", "聚餐", "喝酒",
    ],
    "交通": [
        "打车", "公交", "地铁", "高铁", "滴滴", "油费", "油价", "出租车",
        "网约车", "单车", "火车", "机票", "飞机", "加油", "停车", "高速费",
        "过路费", "大巴",
    ],
    "购物": [
        "超市", "淘宝", "京东", "拼多多", "购物", "衣服", "鞋子", "裤子",
        "日用品", "化妆品", "护肤品", "家电", "数码", "商场", "买菜", "快递",
    ],
    "居住": [
        "房租", "水电", "物业", "宽带", "燃气", "水费", "电费", "取暖费",
        "房贷", "租金", "中介费",
    ],
    "娱乐": [
        "电影", "游戏", "旅游", "唱歌", "演唱会", "酒吧", "网吧", "桌游",
        "剧本杀", "门票", "景点", "KTV",
    ],
    "健康医疗": [
        "医院", "药店", "挂号", "体检", "看病", "买药", "药费", "门诊",
        "住院", "手术", "牙医", "疫苗", "健身", "医药",
    ],
    "学习教育": [
        "学费", "课程", "教材", "培训", "文具", "补习", "网课", "考试",
        "报名费", "书籍", "学习",
    ],
}

ALL_CATEGORIES = ["餐饮", "交通", "购物", "居住", "娱乐", "健康医疗", "学习教育", OTHER]

MERCHANT_CATEGORY = {
    "麦当劳": "餐饮", "肯德基": "餐饮", "星巴克": "餐饮", "瑞幸": "餐饮",
    "蜜雪冰城": "餐饮", "奈雪的茶": "餐饮", "海底捞": "餐饮", "华莱士": "餐饮",
    "必胜客": "餐饮", "沙县小吃": "餐饮", "美团": "餐饮", "饿了么": "餐饮",
    "滴滴": "交通",
    "淘宝": "购物", "天猫": "购物", "京东": "购物", "拼多多": "购物",
    "沃尔玛": "购物", "永辉": "购物", "全家": "购物", "罗森": "购物",
    "便利蜂": "购物",
}

INCOME_WORDS = [
    "工资", "薪水", "生活费", "红包", "兼职", "报销", "退款", "奖金",
    "利息", "到账", "收入",
]

COUNT_WORDS = ["几次", "多少笔", "几笔", "笔数"]
RANK_WORDS = ["最多", "排行", "哪个分类", "哪类"]

# 日期长相只有这一份：_find_date 和 parse_text 抠日期都引用它
DATE_RE = re.compile(
    r"(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}月\d{1,2}[日号]|大前天|前天|昨天|今天|明天)"
)
_YMD_RE = re.compile(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})")
_MD_RE = re.compile(r"(\d{1,2})月(\d{1,2})[日号]")

_JIAO_RE = re.compile(r"([零〇一二两三四五六七八九十百千万]+)\s*块\s*([零〇一二两三四五六七八九])\s*[毛角]")
_CHINESE_UNIT_RE = re.compile(r"([零〇一二两三四五六七八九十百千万]+)\s*(?:块|元)")
_ARABIC_UNIT_RE = re.compile(r"(\d+(?:\.\d+)?)\s*(?:块|元)")
_ARABIC_RE = re.compile(r"\d+(?:\.\d+)?")

_KEYWORDS = {kw for keywords in CATEGORIES.values() for kw in keywords}


def cn_to_int(text):
    """中文数字转整数。转不了返回 None。"""
    if not text:
        return None
    try:
        return int(cn2an.cn2an(text, "smart"))
    except Exception:
        return None


def _as_date(value):
    if value is None:
        return date.today()
    if isinstance(value, datetime):
        return value.date()
    return value


def _arabic_to_fen(value):
    """'30.5' → 3050，全程按字符串拆，不碰浮点。"""
    if "." in value:
        whole, frac = value.split(".", 1)
        frac = (frac + "00")[:2]
        return int(whole or "0") * 100 + int(frac)
    return int(value) * 100


def _find_date(text, today):
    today = _as_date(today)

    m = _YMD_RE.search(text)
    if m:
        try:
            return date(int(m.group(1)), int(m.group(2)), int(m.group(3))).isoformat()
        except ValueError:
            pass

    m = _MD_RE.search(text)
    if m:
        try:
            return date(today.year, int(m.group(1)), int(m.group(2))).isoformat()
        except ValueError:
            pass

    # 「大前天」必须排在「前天」之前，否则被包含匹配吃掉
    if "大前天" in text:
        return (today - timedelta(days=3)).isoformat()
    if "前天" in text:
        return (today - timedelta(days=2)).isoformat()
    if "昨天" in text:
        return (today - timedelta(days=1)).isoformat()
    if "明天" in text:
        return (today + timedelta(days=1)).isoformat()
    return today.isoformat()


def _month_end(day):
    return day.replace(day=calendar.monthrange(day.year, day.month)[1])


def _resolve_range(text, today):
    """返回 (from, to, 是否显式认到时间说法)。"""
    today = _as_date(today)

    if re.search(r"(?:最近|近)\s*(?:30|三十)\s*天", text):
        return (today - timedelta(days=29)).isoformat(), today.isoformat(), True
    if "上个月" in text or "上月" in text:
        last_day = today.replace(day=1) - timedelta(days=1)
        return last_day.replace(day=1).isoformat(), last_day.isoformat(), True
    if "上周" in text:
        start = today - timedelta(days=today.weekday() + 7)
        return start.isoformat(), (start + timedelta(days=6)).isoformat(), True
    if "这个月" in text or "本月" in text:
        return today.replace(day=1).isoformat(), _month_end(today).isoformat(), True
    if "本周" in text or "这周" in text:
        return (today - timedelta(days=today.weekday())).isoformat(), today.isoformat(), True
    if "今天" in text:
        return today.isoformat(), today.isoformat(), True
    return today.replace(day=1).isoformat(), _month_end(today).isoformat(), False


def _find_range(text, today):
    start, end, _ = _resolve_range(text, today)
    return start, end


def _extract_amount(text):
    """返回整数分；认不出来返回 None。日期片段必须由调用方先抠掉。"""
    m = _JIAO_RE.search(text)
    if m:
        yuan = cn_to_int(m.group(1))
        jiao = cn_to_int(m.group(2))
        if yuan is not None and jiao is not None:
            return yuan * 100 + jiao * 10

    candidates = []
    for m in _ARABIC_UNIT_RE.finditer(text):
        candidates.append((m.start(), _arabic_to_fen(m.group(1))))
    for m in _CHINESE_UNIT_RE.finditer(text):
        yuan = cn_to_int(m.group(1))
        if yuan is not None:
            candidates.append((m.start(), yuan * 100))
    if candidates:
        return min(candidates)[1]

    m = _ARABIC_RE.search(text)
    if m:
        return _arabic_to_fen(m.group(0))
    return None


def _classify(text):
    """返回 (类别, 是否显式认到)。并列或 0 分都判「其他」。"""
    scores = {cat: 0 for cat in CATEGORIES}
    for cat, keywords in CATEGORIES.items():
        for kw in keywords:
            if kw in text:
                scores[cat] += len(kw)

    for merchant, cat in MERCHANT_CATEGORY.items():
        if merchant in text and merchant not in _KEYWORDS:
            scores[cat] += len(merchant)

    best = max(scores.values())
    if best == 0:
        return OTHER, False
    winners = [cat for cat, score in scores.items() if score == best]
    if len(winners) > 1:
        return OTHER, False
    return winners[0], True


def _find_merchant(text):
    for merchant in sorted(MERCHANT_CATEGORY, key=len, reverse=True):
        if merchant in text:
            return merchant
    return ""


def _is_income(text):
    return any(word in text for word in INCOME_WORDS)


def _detect_metric(text):
    if any(word in text for word in COUNT_WORDS):
        return "count", True
    if any(word in text for word in RANK_WORDS):
        return "ranking", True
    return "sum", False


def parse_text(text, today=None):
    today = _as_date(today)
    has_day = bool(DATE_RE.search(text))
    day = _find_date(text, today)
    amount = _extract_amount(DATE_RE.sub(" ", text))

    if _is_income(text):
        type_ = "income"
        category = INCOME
        has_category = True
    else:
        type_ = "expense"
        category, has_category = _classify(text)

    merchant = _find_merchant(text)
    return {
        "day": day,
        "amount": amount,
        "type": type_,
        "category": category,
        "merchant": merchant,
        "note": text,
        "understood": {
            "day": has_day,
            "amount": amount is not None,
            "type": type_ == "income",
            "category": has_category,
            "merchant": bool(merchant),
        },
    }


def parse_question(text, today=None):
    day_from, day_to, has_range = _resolve_range(text, today)
    category, has_category = _classify(text)
    if not has_category:
        category = None

    if _is_income(text):
        type_ = "income"
        has_type = True
    else:
        type_ = "expense"
        has_type = False

    metric, has_metric = _detect_metric(text)
    return {
        "from": day_from,
        "to": day_to,
        "category": category,
        "type": type_,
        "metric": metric,
        "understood": {
            "from": has_range,
            "to": has_range,
            "category": has_category,
            "type": has_type,
            "metric": has_metric,
        },
    }
