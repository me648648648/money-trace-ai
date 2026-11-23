"""B 负责：一句话 → 结构化数据。纯函数，不写库、不碰网络。"""
import re
import jieba
import cn2an
import dateparser
from datetime import datetime, timedelta

CATEGORIES = {
    "餐饮": ["饭", "吃", "麦当劳", "肯德基", "外卖", "喝", "餐", "夜宵", "奶茶", "火锅", "星巴克", "瑞幸"],
    "交通": ["打车", "公交", "地铁", "滴滴", "高铁", "车", "油费", "机票", "共享单车"],
    "购物": ["买", "淘宝", "京东", "超市", "衣服", "鞋", "日用品", "拼多多"],
    "居住": ["房租", "水电", "物业", "宽带", "燃气"],
    "娱乐": ["电影", "游戏", "唱歌", "旅游", "玩", "KTV", "网吧"],
}

def extract_amount(text):

    match_multi = re.search(r'([零一二两三四五六七八九十百千万\d]+)块([零一二两三四五六七八九\d]+)[毛角]?', text)
    if match_multi:
        try:
            yuan = float(cn2an.cn2an(match_multi.group(1), "smart"))
            jiao = float(cn2an.cn2an(match_multi.group(2), "smart"))
            return yuan + jiao / 10
        except Exception:
            pass

    match_unit = re.search(r'(\d+(?:\.\d+)?|[一二两三四五六七八九十百千万]+)\s*(?:块|元|块钱)', text)
    if match_unit:
        val = match_unit.group(1)
        try:
            return float(val) if val.replace('.', '', 1).isdigit() else float(cn2an.cn2an(val, "smart"))
        except:
            pass

    an_text = cn2an.transform(text, "cn2an")
    nums = re.findall(r'\d+(?:\.\d+)?', an_text)

    valid_nums = []
    for n in nums:
        num = float(n)
        if re.search(f'{n}[点月号日]', text):
            continue
        valid_nums.append(num)

    return max(valid_nums) if valid_nums else None

def extract_category(text):
    words = jieba.lcut(text)
    category_scores = {cat: 0 for cat in CATEGORIES}
    for cat, keywords in CATEGORIES.items():
        for kw in keywords:
            if kw in words: category_scores[cat] += 2
            elif kw in text: category_scores[cat] += 1

    best_cat = max(category_scores, key=category_scores.get)
    return best_cat if category_scores[best_cat] > 0 else "其他"

def extract_date_range(text, today):


    parsed = dateparser.parse(text, languages=['zh'], settings={'RELATIVE_BASE': datetime.combine(today, datetime.min.time())})

    if "上个月" in text or "上月" in text:
        last_day = today.replace(day=1) - timedelta(days=1)
        return str(last_day.replace(day=1)), str(last_day)
    if "上周" in text:
        last_week_sun = today - timedelta(days=today.weekday() + 1)
        return str(last_week_sun - timedelta(days=6)), str(last_week_sun)
    if "这个月" in text or "本月" in text:
        return str(today.replace(day=1)), str(today)

    if parsed:
        return str(parsed.date()), str(parsed.date())
    return str(today), str(today)

def parse_text(text, today=None):
    if today is None: today = datetime.now().date()
    day_str, _ = extract_date_range(text, today)
    return {
        "day": day_str,
        "amount": extract_amount(text),
        "category": extract_category(text),
        "detail": text,
        "source": "rule"
    }

def parse_question(text, today=None):
    if today is None: today = datetime.now().date()
    cat = extract_category(text)
    return {
        "from": extract_date_range(text, today)[0],
        "to": extract_date_range(text, today)[1],
        "category": cat if cat != "其他" else None,
        "metric": "ranking" if any(k in text for k in ["最多", "排行", "哪类"]) else ("count" if any(k in text for k in ["几次", "多少笔"]) else "sum"),
        "source": "rule"
    }