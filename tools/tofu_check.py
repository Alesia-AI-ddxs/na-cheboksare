# -*- coding: utf-8 -*-
"""Проверка «тофу» (квадратики □ вместо букв) — языковой модуль, ТЗ мультиязычности р.6 и р.10.

Что делает: для КАЖДОГО письменного варианта берёт все его строки (locales/<код>.json), тест-строку из листа ЯЗЫКИ
(locales/_meta.json), эндоним и названия произношений (src/i18n/languages.ts) и проверяет по таблице символов шрифта
(fontTools), что каждая буква есть в шрифтах, которыми приложение рисует этот язык:
  - латиница и кириллица — PT Sans (обычный и жирный); заголовки — Prata (кроме языков с displayFromBody, напр. tr-TR);
  - китайский, деванагари, арабское письмо — ПОДМНОЖЕСТВА Noto из assets/fonts/subset/ (v1.1.1; их собирает генератор,
    tools/font_subset.py). Дополнительно: ни одна нужная буква, которая есть в полном шрифте, не должна потеряться
    в подмножестве (иначе — ошибка «потеряно в подмножестве»). Письмо без подмножества допустимо только у варианта
    без текстов («готовится»: сейчас традиционный китайский и кантонский).
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
SUB = ROOT / 'assets' / 'fonts' / 'subset'
FONTS = {
    'PTSans': [NM / 'pt-sans/400Regular/PTSans_400Regular.ttf', NM / 'pt-sans/700Bold/PTSans_700Bold.ttf'],
    'Prata': [NM / 'prata/400Regular/Prata_400Regular.ttf'],
}
# полные шрифты письменностей (для проверки «ничего не потеряно»)
FULL = {
    'NotoSansSC': [NM / 'noto-sans-sc/400Regular/NotoSansSC_400Regular.ttf'],
    'NotoSansTC': [NM / 'noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf'],
    'NotoSansHK': [NM / 'noto-sans-hk/400Regular/NotoSansHK_400Regular.ttf'],
    'NotoSansDevanagari': [NM / 'noto-sans-devanagari/400Regular/NotoSansDevanagari_400Regular.ttf',
                           NM / 'noto-sans-devanagari/700Bold/NotoSansDevanagari_700Bold.ttf'],
    'NotoNaskhArabic': [NM / 'noto-naskh-arabic/400Regular/NotoNaskhArabic_400Regular.ttf',
                        NM / 'noto-naskh-arabic/700Bold/NotoNaskhArabic_700Bold.ttf'],
}
# подмножества, которыми приложение рисует письмо (src/i18n/fontFiles.ts)
SUBSETS = {fam: [SUB / f'{fam}.ttf'] + ([SUB / f'{fam}_Bold.ttf'] if len(files) > 1 else []) for fam, files in FULL.items()}
SYMBOLS = set('★✓←→▸◂▾▶🔒•·')

# реестр: код → (шрифт письма, заголовки обычным шрифтом) — из src/i18n/languages.ts
src = (ROOT / 'src/i18n/languages.ts').read_text(encoding='utf-8')
REG = {}
ENDONYMS = {}
starts = list(re.finditer(r"\{ code: '([^']+)', endonym: '[^']*', nameRu: '[^']*', script: '(\w+)'", src))
for i, st in enumerate(starts):
    seg = src[st.start(): starts[i + 1].start() if i + 1 < len(starts) else len(src)]
    fam = re.search(r"fontFamily: '(\w+)'(, displayFromBody: true)?", seg)
    REG[st.group(1)] = (fam.group(1), bool(fam.group(2)))
    ENDONYMS[st.group(1)] = re.findall(r"endonym: '([^']*)'", seg)  # эндоним и названия произношений

cmaps = {}
def cmap_files(key, files):
    """символы, которые есть во ВСЕХ файлах (обычный и жирный)"""
    if key not in cmaps:
        sets = [set(TTFont(str(p)).getBestCmap().keys()) for p in files]
        cmaps[key] = set.intersection(*sets)
    return cmaps[key]

def cmap_all(name):
    if name in FONTS:
        return cmap_files(name, FONTS[name])
    return cmap_files('subset:' + name, SUBSETS[name])

meta = json.loads((ROOT / 'locales/_meta.json').read_text(encoding='utf-8'))
bad = 0
print('Проверка «тофу»: каждая буква каждой строки есть в шрифте приложения (письменности — подмножества)')
for code, (family, display_body) in REG.items():
    pack = json.loads((ROOT / f'locales/{code}.json').read_text(encoding='utf-8'))
    test = meta['variants'].get(code, {}).get('testString', '')
    texts = list(pack.values()) + ([test] if test else []) + ENDONYMS.get(code, [])
    chars = {ch for s in texts for ch in s if not ch.isspace() and ch not in SYMBOLS and ord(ch) > 32}
    body = 'PTSans' if family == 'brand' else family
    brand = cmap_all('PTSans')
    if family != 'brand' and not all(p.exists() for p in SUBSETS[family]):
        if pack:
            bad += 1
            print(f'  {code:9s} {body:19s} строк {len(pack):4d}: НЕТ ПОДМНОЖЕСТВА ШРИФТА {SUB.name}/{family}.ttf — запустите генератор')
        else:
            print(f'  {code:9s} {body:19s} строк    0: шрифт не включён (вариант «готовится», не выбирается)')
        continue
    own = cmap_all(body)
    missing = sorted(ch for ch in chars if ord(ch) not in own and ord(ch) not in brand)
    if family != 'brand':
        full = cmap_files('full:' + family, FULL[family])
        lost = sorted(ch for ch in chars if ord(ch) in full and ord(ch) not in own)
        if lost:
            bad += 1
            print(f'  {code:9s} {body:19s} ПОТЕРЯНО В ПОДМНОЖЕСТВЕ: {"".join(lost[:40])}')
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
print('Подмножества:', ', '.join(f'{p.name} {p.stat().st_size / 1024:.0f} КБ' for p in sorted(SUB.glob('*.ttf'))) or '—')
print('Итог:', 'тофу нет ни в одном варианте' if not bad else f'вариантов с пропусками: {bad}')
sys.exit(1 if bad else 0)
