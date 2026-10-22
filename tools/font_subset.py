# -*- coding: utf-8 -*-
"""Подмножества шрифтов письменностей (языковой модуль, приложение 1.1.1).

Зачем: китайский шрифт целиком весит ≈10 МБ, а приложению нужны несколько сотен иероглифов из таблицы.
Подмножество — тот же шрифт, в котором оставлены только нужные буквы. Вид букв не меняется.

Что делает (вызывается из tools/content_build.py после сборки языковых пакетов; можно и отдельно):
  1) для каждого шрифта письма (Noto Sans SC / TC / HK, Noto Sans Devanagari, Noto Naskh Arabic) собирает буквы:
     все строки языков этого письма (locales/<код>.json) и их «лестницы» фолбэка, тест-строки листа ЯЗЫКИ,
     эндонимы и названия произношений (src/i18n/languages.ts), справочный слой content.json (факты, источники —
     они на русском и видны в «О проекте»), а также цифры, латиницу и знаки препинания (код прохождения «ND-…»);
     у арабского письма и деванагари — весь основной блок письма (названия месяцев в датах пишет система);
     у китайского — знаки 年 月 日 и китайская пунктуация (даты «2026年10月22日»);
  2) если у письма НЕТ ни одного переведённого языка (сейчас — традиционный китайский и кантонский), шрифт
     не включается в сборку вообще: вариант «готовится» и не выбирается. Появятся тексты — подмножество создастся само;
  3) пишет assets/fonts/subset/<Семейство>.ttf (+ _Bold для арабского и деванагари) и список для приложения
     src/i18n/fontFiles.ts (создаётся автоматически, руками не править);
  4) проверяет, что ни одна нужная буква, которая была в полном шрифте, не потерялась (иначе — ошибка).

Нужно: pip install fonttools brotli; полные шрифты — из node_modules/@expo-google-fonts (npm install).
Отдельный запуск:  python3 -I tools/font_subset.py
"""
import json
import re
import sys
from pathlib import Path

from fontTools import subset as ft_subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
NM = 'node_modules/@expo-google-fonts'
OUT_DIR = 'assets/fonts/subset'
TS_OUT = 'src/i18n/fontFiles.ts'

# семейство -> [(имя начертания в приложении, путь к полному шрифту в node_modules)]; первое — обычное, второе — жирное
SOURCES = {
    'NotoSansSC': [('NotoSansSC', 'noto-sans-sc/400Regular/NotoSansSC_400Regular.ttf')],
    'NotoSansTC': [('NotoSansTC', 'noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf')],
    'NotoSansHK': [('NotoSansHK', 'noto-sans-hk/400Regular/NotoSansHK_400Regular.ttf')],
    'NotoSansDevanagari': [('NotoSansDevanagari', 'noto-sans-devanagari/400Regular/NotoSansDevanagari_400Regular.ttf'),
                           ('NotoSansDevanagari_Bold', 'noto-sans-devanagari/700Bold/NotoSansDevanagari_700Bold.ttf')],
    'NotoNaskhArabic': [('NotoNaskhArabic', 'noto-naskh-arabic/400Regular/NotoNaskhArabic_400Regular.ttf'),
                        ('NotoNaskhArabic_Bold', 'noto-naskh-arabic/700Bold/NotoNaskhArabic_700Bold.ttf')],
}


def rng(a, b):
    return {chr(c) for c in range(a, b + 1)}


# общее для всех: латиница и цифры (код «ND-XXXX», ссылки), пробелы, типографские знаки
COMMON = rng(0x20, 0x7E) | set(' «»·—–…‘’“”„•№×°±') | rng(0x2000, 0x206F) | rng(0x00A1, 0x00BF)
EXTRA = {
    # китайский: даты Intl («2026年10月22日»), цифры прописью, пунктуация CJK и полноширинные формы
    'NotoSansSC': set('年月日时分〇一二三四五六七八九十') | rng(0x3000, 0x303F) | rng(0xFF01, 0xFF5E),
    'NotoSansTC': set('年月日時分〇一二三四五六七八九十') | rng(0x3000, 0x303F) | rng(0xFF01, 0xFF5E),
    'NotoSansHK': set('年月日時分〇一二三四五六七八九十') | rng(0x3000, 0x303F) | rng(0xFF01, 0xFF5E),
    # деванагари: весь блок (месяцы и цифры в датах пишет система) + ZWJ/ZWNJ и пунктирный кружок
    'NotoSansDevanagari': rng(0x0900, 0x097F) | rng(0xA8E0, 0xA8FF) | {'‌', '‍', '◌', '₹'},
    # арабское письмо (арабский, фарси): весь основной блок + знаки направления и тире-кашида
    'NotoNaskhArabic': rng(0x0600, 0x06FF) | rng(0x0750, 0x077F) | {'‌', '‍', '‎', '‏', '◌', '﴾', '﴿'},
}
EMOJI_SYSTEM = set('★✓←→▸◂▾▶🔒')  # значки рисует система


def parse_registry(root):
    """Письменные варианты из src/i18n/languages.ts: код -> {family, endonyms[], fallback[]}"""
    src = (root / 'src/i18n/languages.ts').read_text(encoding='utf-8')
    starts = list(re.finditer(r"\{ code: '([^']+)', endonym: '([^']*)', nameRu: '[^']*', script: '(\w+)'", src))
    reg = {}
    for i, m in enumerate(starts):
        seg = src[m.start(): starts[i + 1].start() if i + 1 < len(starts) else len(src)]
        fam = re.search(r"fontFamily: '(\w+)'", seg).group(1)
        fb = re.search(r"fallback: \[([^\]]*)\]", seg)
        fallback = re.findall(r"'([^']+)'", fb.group(1)) if fb else []
        endonyms = re.findall(r"endonym: '([^']*)'", seg)
        reg[m.group(1)] = {'family': fam, 'endonyms': endonyms, 'fallback': fallback, 'script': m.group(3)}
    return reg


def collect_texts(root, packs, meta_variants):
    """Справочный слой content.json (факты, источники, ссылки) — виден в «О проекте» на любом языке"""
    out = []
    try:
        c = json.loads((root / 'src/content/content.json').read_text(encoding='utf-8'))
        for f in c.get('facts', []):
            out += [str(f.get(k, '')) for k in ('text', 'topic', 'year', 'layer', 'source', 'link')]
        for s in c.get('sources', []):
            out += [str(s.get(k, '')) for k in ('title', 'gives', 'status', 'link')]
        out += [str(v) for v in (c.get('links') or {}).values()]
    except FileNotFoundError:
        pass
    return out


def build(root=ROOT, packs=None, meta_variants=None, log=print):
    """Собрать подмножества. packs: код -> {ID: строка}; meta_variants: код -> {testString}. Возвращает отчёт."""
    root = Path(root)
    if packs is None:
        packs = {p.stem: json.loads(p.read_text(encoding='utf-8')) for p in (root / 'locales').glob('*.json') if p.stem != '_meta'}
    if meta_variants is None:
        meta_variants = json.loads((root / 'locales/_meta.json').read_text(encoding='utf-8'))['variants']
    reg = parse_registry(root)
    shared = collect_texts(root, packs, meta_variants)
    out_dir = root / OUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    report, errors, written = {}, [], set()
    for family, faces in SOURCES.items():
        langs = [c for c, r in reg.items() if r['family'] == family]
        ready = [c for c in langs if packs.get(c)]
        if not ready:
            report[family] = {'included': False, 'langs': langs}
            continue
        texts = []
        for c in langs:
            chain = [c] + reg[c]['fallback'] + (['ru-RU'] if 'ru-RU' not in reg[c]['fallback'] else [])
            for cc in chain:
                texts += list(packs.get(cc, {}).values())
            texts.append((meta_variants.get(c) or {}).get('testString', ''))
            texts += reg[c]['endonyms']
        texts += shared
        want = {ch for s in texts for ch in s if ch not in EMOJI_SYSTEM} | COMMON | EXTRA[family]
        want = {ch for ch in want if ord(ch) >= 0x20}
        files = []
        for face, rel in faces:
            src = root / NM / rel
            if not src.exists():
                raise SystemExit(f'ОШИБКА: нет полного шрифта {src} — выполните npm install')
            full = TTFont(str(src), recalcTimestamp=False)
            have = set(full.getBestCmap().keys())
            uni = sorted(ord(ch) for ch in want if ord(ch) in have)
            opts = ft_subset.Options()
            opts.layout_features = ['*']  # лигатуры и формы букв (арабский, деванагари) сохраняем все
            opts.name_IDs = ['*']
            opts.name_languages = ['*']
            opts.notdef_outline = True
            opts.glyph_names = False
            opts.hinting = False
            opts.recalc_timestamp = False
            sub = ft_subset.Subsetter(opts)
            sub.populate(unicodes=uni)
            sub.subset(full)
            dst = out_dir / f'{face}.ttf'
            full.save(str(dst))
            written.add(dst.name)
            got = set(TTFont(str(dst)).getBestCmap().keys())
            lost = [chr(u) for u in uni if u not in got]
            if lost:
                errors.append(f'{face}: потеряны буквы {"".join(lost[:30])}')
            files.append({'face': face, 'file': f'{OUT_DIR}/{face}.ttf', 'bytes': dst.stat().st_size,
                          'fullBytes': src.stat().st_size, 'chars': len(uni)})
        report[family] = {'included': True, 'langs': langs, 'ready': ready, 'files': files}
    # убрать старые подмножества (письмо больше не нужно)
    for old in out_dir.glob('*.ttf'):
        if old.name not in written:
            old.unlink()
    # список для приложения
    lines = ['// СОЗДАНО АВТОМАТИЧЕСКИ: tools/font_subset.py (вызывается из tools/content_build.py). Руками не править.',
             '// Подмножества шрифтов письменностей: в файле только буквы из строк мастер-таблицы (+ цифры, латиница, знаки).',
             '// Письма без переведённых языков (сейчас — традиционный китайский и кантонский) сюда не попадают.',
             '/* eslint-disable @typescript-eslint/no-require-imports */',
             'export const SUBSET_FONTS: Record<string, Record<string, number>> = {']
    for family, r in report.items():
        if not r['included']:
            continue
        faces = ', '.join(f"{f['face']}: require('../../{f['file']}')" for f in r['files'])
        lines.append(f'  {family}: {{ {faces} }},')
    lines += ['};', '']
    ts = root / TS_OUT
    new = '\n'.join(lines)
    if not ts.exists() or ts.read_text(encoding='utf-8') != new:
        ts.write_text(new, encoding='utf-8')
    log('\nПодмножества шрифтов → ' + OUT_DIR)
    for family, r in report.items():
        if not r['included']:
            log(f'  {family:19s} НЕ включён: у {", ".join(r["langs"])} пока нет текстов (вариант «готовится»)')
            continue
        for f in r['files']:
            log(f'  {f["face"]:24s} букв {f["chars"]:5d}  {f["bytes"] / 1024:8.1f} КБ  (было {f["fullBytes"] / 1024 / 1024:.2f} МБ)')
    if errors:
        for e in errors:
            log('ОШИБКА ПОДМНОЖЕСТВА: ' + e)
    return {'report': report, 'errors': errors}


if __name__ == '__main__':
    res = build()
    sys.exit(2 if res['errors'] else 0)
