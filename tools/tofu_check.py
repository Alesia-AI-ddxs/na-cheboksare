# -*- coding: utf-8 -*-
"""Проверка «тофу» (квадратики □ вместо букв) — языковой модуль, ТЗ мультиязычности р.6 и р.10.

Что делает: для КАЖДОГО письменного варианта берёт все его строки (locales/<код>.json) и тест-строку из листа ЯЗЫКИ
(locales/_meta.json) и проверяет по таблице символов шрифта (fontTools), что каждая буква есть в шрифтах, которыми
приложение рисует этот язык:
  - латиница и кириллица — PT Sans (обычный и жирный); заголовки — Prata (кроме языков с displayFromBody, напр. tr-TR);
  - китайский — Noto Sans SC / TC / HK; деванагари — Noto Sans Devanagari; арабское письмо — Noto Naskh Arabic.
Буквы чужого письма внутри строки (например, кириллическая надпись «БЕРЕЗОВЫЙ ЛЕ…» в арабском описании находки)
проверяются по фирменному PT Sans — приложение и система подставляют его сами.
Значки (★ ✓ ← → ▸ ◂ ▾ ▶ 🔒) рисует система — они в проверку не входят.

Запуск:  python3 -I tools/tofu_check.py      (код выхода 1 — найдены буквы без шрифта)
"""
import json
import re
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
NM = ROOT / 'node_modules' / '@expo-google-fonts'
FONTS = {
    'PTSans': [NM / 'pt-sans/400Regular/PTSans_400Regular.ttf', NM / 'pt-sans/700Bold/PTSans_700Bold.ttf'],
    'Prata': [NM / 'prata/400Regular/Prata_400Regular.ttf'],
    'NotoSansSC': [NM / 'noto-sans-sc/400Regular/NotoSansSC_400Regular.ttf'],
    'NotoSansTC': [NM / 'noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf'],
    'NotoSansHK': [NM / 'noto-sans-hk/400Regular/NotoSansHK_400Regular.ttf'],
    'NotoSansDevanagari': [NM / 'noto-sans-devanagari/400Regular/NotoSansDevanagari_400Regular.ttf',
                           NM / 'noto-sans-devanagari/700Bold/NotoSansDevanagari_700Bold.ttf'],
    'NotoNaskhArabic': [NM / 'noto-naskh-arabic/400Regular/NotoNaskhArabic_400Regular.ttf',
                        NM / 'noto-naskh-arabic/700Bold/NotoNaskhArabic_700Bold.ttf'],
}
SYMBOLS = set('★✓←→▸◂▾▶🔒•·')

# реестр: код → (шрифт письма, заголовки обычным шрифтом) — из src/i18n/languages.ts
src = (ROOT / 'src/i18n/languages.ts').read_text(encoding='utf-8')
REG = {}
for m in re.finditer(r"\{ code: '([^']+)', endonym: '[^']*', nameRu: '[^']*', script: '(\w+)'[^}]*?fontFamily: '(\w+)'(, displayFromBody: true)?", src, re.S):
    REG[m.group(1)] = (m.group(3), bool(m.group(4)))

cmaps = {}
def cmap_all(name):
    """символы, которые есть во ВСЕХ файлах семейства (обычный и жирный)"""
    if name not in cmaps:
        sets = [set(TTFont(str(p)).getBestCmap().keys()) for p in FONTS[name]]
        cmaps[name] = set.intersection(*sets)
    return cmaps[name]

meta = json.loads((ROOT / 'locales/_meta.json').read_text(encoding='utf-8'))
bad = 0
print('Проверка «тофу»: каждая буква каждой строки есть в шрифте приложения')
for code, (family, display_body) in REG.items():
    pack = json.loads((ROOT / f'locales/{code}.json').read_text(encoding='utf-8'))
    test = meta['variants'].get(code, {}).get('testString', '')
    texts = list(pack.values()) + ([test] if test else [])
    chars = {ch for s in texts for ch in s if not ch.isspace() and ch not in SYMBOLS and ord(ch) > 32}
    body = 'PTSans' if family == 'brand' else family
    own = cmap_all(body)
    brand = cmap_all('PTSans')
    missing = sorted(ch for ch in chars if ord(ch) not in own and ord(ch) not in brand)
    by_brand = sorted(ch for ch in chars if ord(ch) not in own and ord(ch) in brand)
    line = f'  {code:9s} {body:19s} строк {len(pack):4d}, символов {len(chars):4d}: '
    if missing:
        bad += 1
        line += 'НЕТ В ШРИФТЕ: ' + ' '.join(missing)
    else:
        line += 'тофу нет'
    if by_brand:
        line += f' (чужое письмо внутри строк рисует PT Sans: {"".join(by_brand[:20])}{"…" if len(by_brand) > 20 else ""})'
    if family == 'brand' and not display_body:
        prata = cmap_all('Prata')
        nd = sorted(ch for ch in chars if ord(ch) not in prata and ord(ch) in brand)
        if nd:
            line += f' · заголовки Prata без: {"".join(nd)} (система подставит; лучше displayFromBody)'
    print(line)
print('Итог:', 'тофу нет ни в одном варианте' if not bad else f'вариантов с пропусками: {bad}')
sys.exit(1 if bad else 0)
