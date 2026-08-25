# -*- coding: utf-8 -*-
"""OSMINOG landing — сборка посадочных из template.html.
Добавить новую нишу = добавить запись в NICHES и запустить `python build.py`."""
import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

NICHES = [
    {   # основная посадочная (корень)
        "out": "index.html",
        "root": "",
        "meta_title": "OSMINOG — разработка сайтов, которые приводят клиентов | Веб-студия",
        "meta_desc": "Кастомная разработка сайтов под ключ: лендинги, корпоративные сайты, интернет-магазины. 12+ лет, 100+ проектов, год гарантии. Индивидуальный дизайн, готовность к рекламе и SEO.",
        "hero_badge": "Веб-разработка полного цикла",
        "h1": "Делаем сайты, которые <span class=\"grad-text\">приводят клиентов</span> вашему бизнесу",
        "lead": "Проектируем, дизайним и разрабатываем сайты под ключ — от лендинга до интернет-магазина. Индивидуальный дизайн, адаптив под все устройства, готовность к рекламе и SEO.",
        "hero_primary": "Рассчитать проект",
        "niche_key": "",
        "featured": "landing",
        "niche_name": "сайт",
    },
    {   # клиники / медцентры
        "out": os.path.join("kliniki", "index.html"),
        "root": "../",
        "meta_title": "Сайты для клиник и медцентров под ключ | OSMINOG",
        "meta_desc": "Разрабатываем сайты для клиник и медицинских центров: онлайн-запись, каталог услуг и врачей, интеграция с CRM. 12+ лет опыта, год гарантии, поэтапная оплата.",
        "hero_badge": "Сайты для клиник и медцентров",
        "h1": "Сайты для клиник, которые <span class=\"grad-text\">записывают пациентов</span>",
        "lead": "Сайт медцентра с онлайн-записью, каталогом услуг и врачей и интеграцией с CRM. Удобно пациенту, выгодно клинике — и сразу готово к рекламе.",
        "hero_primary": "Обсудить сайт клиники",
        "niche_key": "medicina",
        "featured": "korp",
        "niche_name": "сайт для клиники",
    },
    {   # интернет-магазины
        "out": os.path.join("magaziny", "index.html"),
        "root": "../",
        "meta_title": "Разработка интернет-магазинов под ключ | OSMINOG",
        "meta_desc": "Создаём интернет-магазины, которые продают: каталог, корзина, онлайн-оплата, интеграция с 1С и маркетплейсами. 12+ лет, год гарантии, поэтапная оплата.",
        "hero_badge": "Интернет-магазины под ключ",
        "h1": "Интернет-магазины, которые <span class=\"grad-text\">продают</span>",
        "lead": "Каталог, корзина, онлайн-оплата и интеграция с 1С и маркетплейсами. Магазин, который удобно вести и который сам приносит заказы.",
        "hero_primary": "Обсудить интернет-магазин",
        "niche_key": "",
        "featured": "magazin",
        "niche_name": "интернет-магазин",
    },
]

REPL = {
    "{{ROOT}}": "root",
    "{{META_TITLE}}": "meta_title",
    "{{META_DESC}}": "meta_desc",
    "{{HERO_BADGE}}": "hero_badge",
    "{{H1}}": "h1",
    "{{LEAD}}": "lead",
    "{{HERO_PRIMARY}}": "hero_primary",
    "{{NICHE_KEY}}": "niche_key",
    "{{FEATURED}}": "featured",
    "{{NICHE_NAME}}": "niche_name",
}

with open(os.path.join(ROOT_DIR, "template.html"), encoding="utf-8") as f:
    tpl = f.read()

for n in NICHES:
    html = tpl
    for token, key in REPL.items():
        html = html.replace(token, n[key])
    out_path = os.path.join(ROOT_DIR, n["out"])
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    print("built", n["out"])

# GitHub Pages: не прогонять через Jekyll
open(os.path.join(ROOT_DIR, ".nojekyll"), "w").close()
print("done")
