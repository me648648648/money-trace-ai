"""B 负责：一句话 → 结构化数据。纯函数，不写库、不碰网络。"""
import re
from datetime import datetime, timedelta

# 类别与关键词映射库
CATEGORIES = {
    "餐饮": ["饭", "吃", "麦当劳", "肯德基", "外卖", "喝", "餐", "夜宵", "奶茶", "火锅"],
    "交通": ["打车", "公交", "地铁", "滴滴", "高铁", "车", "油费", "机票"],
    "购物": ["买", "淘宝", "京东", "超市", "衣服", "鞋", "日用品"],
    "居住": ["房租", "水电", "物业", "宽带", "燃气"],
    "娱乐": ["电影", "游戏", "唱歌", "旅游", "玩", "KTV"],
}


def cn_to_int(text):

    num_dict = {"一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5,
                "六": 6, "七": 7, "八": 8, "九": 9}

    if text == "十": return 10
    if text.isdigit(): return int(text)

    if text.startswith("十") and len(text) == 2:
        return 10 + num_dict.get(text[1], 0)

    if text.endswith("十") and len(text) == 2:
        return num_dict.get(text[0], 0) * 10

    if "十" in text and len(text) == 3:
        tens = num_dict.get(text[0], 0) * 10
        ones = num_dict.get(text[2], 0)
        return tens + ones

    return num_dict.get(text, None)


def _find_date(text, today):

    if "昨天" in text:
        return str(today - timedelta(days=1))
    elif "前天" in text:
        return str(today - timedelta(days=2))
    elif "明天" in text:
        return str(today + timedelta(days=1))
    else:

        return str(today)


def _find_range(text, today):

    start_date = today
    end_date = today

    if "上个月" in text or "上月" in text:

        start_date = today - timedelta(days=30)
        end_date = today
    elif "这个月" in text or "本月" in text:
        start_date = today.replace(day=1)
        end_date = today
    elif "上周" in text:
        start_date = today - timedelta(days=7)
        end_date = today
    elif "本周" in text or "这周" in text:
        start_date = today - timedelta(days=today.weekday())
        end_date = today

    return str(start_date), str(end_date)


def parse_text(text, today=None):

    if today is None:
        today = datetime.now().date()


    amount = None

    match = re.search(r'\d+(\.\d+)?', text)
    if match:
        amount = float(match.group())
    else:

        cn_match = re.search(r'[一二两三四五六七八九十]+', text)
        if cn_match:
            converted = cn_to_int(cn_match.group())
            if converted is not None:
                amount = float(converted)


    category = "其他"
    for cat, keywords in CATEGORIES.items():
        for kw in keywords:
            if kw in text:
                category = cat
                break

    day_str = _find_date(text, today)

    return {
        "day": day_str,
        "amount": amount,
        "category": category,
        "note": text,
        "source": "text"
    }


def parse_question(text, today=None):

    if today is None:
        today = datetime.now().date()


    start_date, end_date = _find_range(text, today)

    category = None
    for cat, keywords in CATEGORIES.items():
        for kw in keywords:
            if kw in text:
                category = cat
                break

    metric = "sum"
    if "几次" in text or "多少笔" in text:
        metric = "count"
    elif "最多" in text or "排行" in text or "哪类" in text:
        metric = "ranking"

    return {
        "from": start_date,
        "to": end_date,
        "category": category,
        "metric": metric,
        "source": "text"
    }


