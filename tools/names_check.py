# -*- coding: utf-8 -*-
"""Проверка имён по листу ИМЕНА (npm run qa:names) — приложение 1.1.1, решение владельца 22.10.2026.

Для КАЖДОГО готового языка (в пакете locales/<код>.json есть строки) проверяет:
  1) в листе ИМЕНА у языка заполнены «Чебоксары», «На Чебоксаре», «Волга», «Сетнер»;
  2) ui.title = название игры из ИМЕНА (прописными, как русское «НА ЧЕБОКСАРЕ»; у письменностей без регистра — как есть);
  3) spk.setner содержит имя Сетнера из ИМЕНА;
  4) в строках языка нет «чужих» написаний: имён из других колонок ИМЕНА (например, немецкое «Wolga» в английском,
     русское «Сетнер» в китайском) и известных неверных вариантов (транслит «Na Cheboksare», 塞特内尔 / 塞特涅尔, सेत्नेर).
Лист ИМЕНА генератор переносит в locales/_meta.json (поле names), поэтому проверка работает без Excel.

Запуск:  python3 -I tools/names_check.py      (код выхода 1 — есть расхождения)
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ['Чебоксары (город)', 'На Чебоксаре (название)', 'Волга (река)', 'Сетнер (помощник)']
TITLE, SETNER = 'На Чебоксаре (название)', 'Сетнер (помощник)'
# известные неверные написания (были в черновиках до v2.8) — запрещены во всех языках
KNOWN_WRONG = [
    (r'(?i)\bna\s+cheboksare\b', 'транслит названия «Na Cheboksare» (название — из ИМЕНА)'),
    ('塞特内尔', 'Сетнер по-китайски — 谢特涅尔 (ИМЕНА)'),
    ('塞特涅尔', 'Сетнер по-китайски — 谢特涅尔 (ИМЕНА)'),
    ('सेत्नेर', 'Сетнер на хинди — सेतनेर (ИМЕНА)'),
]
# строки, где «чужое» имя стоит законно (цитата и т.п.): {код: {(ID строки, написание)}}
ALLOW = {}


def is_spaced_script(s):
    """латиница/кириллица — ищем как отдельное слово; иероглифы, деванагари, арабское письмо — как подстроку"""
    return all(ch.isspace() or ch in "'’-" or ('A' <= ch <= 'z') or ('À' <= ch <= 'ɏ') or ('Ѐ' <= ch <= 'ӿ')
               for ch in s)


def title_form(code, name):
    return (name.replace('i', 'İ') if code == 'tr-TR' else name).upper()


def main():
    meta = json.loads((ROOT / 'locales/_meta.json').read_text(encoding='utf-8'))
    names = meta.get('names') or {}
    if not names:
        print('ОШИБКА: в locales/_meta.json нет листа ИМЕНА — пересоберите генератором (таблица v2.8+)')
        return 1
    ready = [c for c, v in meta['variants'].items() if v.get('strings')]
    bad = 0
    print(f'Проверка имён по листу ИМЕНА: готовых языков {len(ready)}, имён {len(names)}')
    for code in ready:
        pack = json.loads((ROOT / f'locales/{code}.json').read_text(encoding='utf-8'))
        problems = []
        for row in REQUIRED:
            if not (names.get(row) or {}).get(code):
                problems.append(f'в ИМЕНА пусто: {row}')
        title = (names.get(TITLE) or {}).get(code)
        if title and pack.get('ui.title') != title_form(code, title):
            problems.append(f'ui.title «{pack.get("ui.title")}» ≠ ИМЕНА «{title_form(code, title)}»')
        setner = (names.get(SETNER) or {}).get(code)
        if setner and setner not in (pack.get('spk.setner') or ''):
            problems.append(f'spk.setner «{pack.get("spk.setner")}» без имени из ИМЕНА «{setner}»')
        # чужие написания
        own_all = [v for row in names.values() for c, v in row.items() if c == code]
        foreign = []
        for row, vals in names.items():
            own = vals.get(code, '')
            for c, v in vals.items():
                if c == code or not v or v == own or (own and (v in own)) or any(v == o or v in o for o in own_all):
                    continue
                foreign.append((row, c, v))
        allow = ALLOW.get(code, set())
        hits = {}
        for sid, text in pack.items():
            for row, c, v in foreign:
                if (sid, v) in allow:
                    continue
                if is_spaced_script(v):
                    found = re.search(r'(?<![\w])' + re.escape(v) + r'(?![\w])', text, re.I)
                else:
                    found = v in text
                if found:
                    owners = ', '.join(cc for cc, vv in names[row].items() if vv == v)
                    hits.setdefault(f'«{v}» ({row.split(" (")[0]}: {owners})', []).append(sid)
            for pat, why in KNOWN_WRONG:
                if re.search(pat, text):
                    hits.setdefault(why, []).append(sid)
        for what, sids in hits.items():
            problems.append(f'чужое написание {what}: {", ".join(sorted(set(sids))[:8])}')
        print(f'  {code:9s} строк {len(pack):4d}: ' + ('имена по ИМЕНА' if not problems else 'РАСХОЖДЕНИЯ'))
        for p in problems:
            print('      -', p)
        bad += bool(problems)
    print('Итог:', 'расхождений нет' if not bad else f'языков с расхождениями: {bad}')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
