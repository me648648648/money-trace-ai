"""B 负责：一句话 → 结构化数据。纯函数，不写库、不碰网络。"""

CATEGORIES = {
    "餐饮": [],
    "交通": [],
    "购物": [],
    "居住": [],
    "娱乐": [],
}


def cn_to_int(text):
    raise NotImplementedError


def _find_date(text, today):
    raise NotImplementedError


def _find_range(text, today):
    raise NotImplementedError


def parse_text(text, today=None):
    raise NotImplementedError


def parse_question(text, today=None):
    raise NotImplementedError
