# -*- coding: utf-8 -*-
"""v2.7 -> v2.8: решения владельца от 22.10.2026 (приложение «На Чебоксаре» 1.1.1).

Что делает (старую v2.7 НЕ трогает — работает с копией):
 1) Сетнер получает язык — в таблице только журнал (формат ссылки живёт в коде: src/setnerLink.ts);
 2) ru-RU = ИСХОДНИК — утверждено владельцем (ЯЗЫКИ — без изменений, ВЫЧИТКА — отметка);
 3) ЯЗЫКИ: новая колонка «Страны (ISO 3166-1)» — где вариант естественно предложить (страна из настроек телефона);
 4) L03: в русском оригинале латинские ă / ě заменены на чувашские ӑ / ӗ (лист «Легенды»; CSV Unity — тем же скриптом);
 5) ИМЕНА: колонки для всех 22 вариантов; пустые ячейки «Чебоксары», «На Чебоксаре», «Волга», «Сетнер» — ЧЕРНОВИК ИИ
    (для языков России, где нет уверенности, — пусто); строки готовых языков приведены к ИМЕНА
    (название игры вместо транслита «NA CHEBOKSARE», Сетнер по-китайски 谢特涅尔, на хинди सेतनेर);
 6) новый ключ ui.content_version («Версия содержания {version} · {date}») — на 9 готовых языках;
 7) журнал v2.7 -> v2.8 на листе «Как устроено».

Запуск (из папки app_build):  python3 -I apply_v28.py [путь_к_CSV_Unity_Legends]
"""
import re
import shutil
import sys
from copy import copy
from pathlib import Path

import openpyxl
from openpyxl.styles import Alignment
from openpyxl.utils import get_column_letter

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / 'xlsx_work' / 'КОНТЕНТ_На_Чебоксаре_v2.7_2026-10-22.xlsx'
DST = HERE.parent / 'xlsx_work' / 'КОНТЕНТ_На_Чебоксаре_v2.8_2026-10-22.xlsx'
CSV_LEGENDS = Path(sys.argv[1]) if len(sys.argv) > 1 else (
    HERE.parent / 'base' / 'unity' / 'G-101_НА_ЧЕБОКСАРЕ' / '08_UNITY_ПРОЕКТ' / 'Assets' / 'NaCheboksare' / 'Resources'
    / 'Text' / 'NaCheboksare_Legends.csv')

READY = ['ru-RU', 'en-GB', 'en-US', 'de-DE', 'fr-FR', 'zh-Hans', 'hi-IN', 'tr-TR', 'ar']
ALL22 = ['ru-RU', 'cv', 'mdf', 'myv', 'mhr', 'mrj', 'tt', 'ba', 'en-US', 'en-GB', 'de-DE', 'fr-FR', 'es-ES', 'es-419',
         'tr-TR', 'fa-IR', 'zh-Hans', 'zh-Hant', 'yue-Hant', 'hi-IN', 'mr-IN', 'ar']

# ---------------------------------------------------------------- п.3: страны (ISO 3166-1 alpha-2) — решение владельца
REGIONS = {
    'ru-RU': 'RU, BY, KZ, KG',
    'cv': 'RU', 'tt': 'RU', 'ba': 'RU', 'mhr': 'RU', 'mrj': 'RU', 'mdf': 'RU', 'myv': 'RU',
    'en-GB': 'GB, IE, AU, NZ', 'en-US': 'US, CA',
    'de-DE': 'DE, AT, CH, LI', 'fr-FR': 'FR, BE, CH, LU, MC',
    'es-ES': 'ES', 'es-419': 'MX, AR, CO, CL, PE, VE, EC, GT, CU, BO, DO, HN, PY, SV, NI, CR, PA, UY',
    'zh-Hans': 'CN, SG', 'zh-Hant': 'TW', 'yue-Hant': 'HK, MO',
    'hi-IN': 'IN', 'mr-IN': 'IN',
    'ar': 'SA, AE, EG, QA, KW, BH, OM, JO, LB, SY, IQ, YE, PS, LY, TN, DZ, MA, SD',
    'fa-IR': 'IR, AF, TJ', 'tr-TR': 'TR, CY',
}
assert sorted(REGIONS) == sorted(ALL22)

# ---------------------------------------------------------------- п.5: ИМЕНА — черновик ИИ (None = оставить пусто)
NAMES_DRAFT = {
    'Чебоксары (город)': {
        'mdf': None, 'myv': None, 'mhr': 'Шупашкар', 'mrj': 'Шупашкар', 'tt': 'Чабаксар', 'ba': None,
        'es-419': 'Cheboksari', 'tr-TR': 'Çeboksarı', 'fa-IR': 'چبوکساری',
    },
    'На Чебоксаре (название)': {
        # по летописной фразе «ночевали на Чебоксаре» — так, как её уже перевели в ui.splash_quote каждого языка
        'de-DE': 'In Tscheboksar', 'fr-FR': 'À Tcheboksar', 'es-ES': 'En Cheboksar', 'es-419': 'En Cheboksar',
        'tr-TR': "Çeboksar'da", 'hi-IN': 'चेबोक्सार में', 'mr-IN': 'चेबोक्सारमध्ये', 'fa-IR': 'در چبوکسار',
        'mdf': None, 'myv': None, 'mhr': None, 'mrj': None, 'tt': None, 'ba': None,
    },
    'Волга (река)': {
        'mdf': 'Рав', 'myv': 'Рав', 'mhr': 'Юл', 'mrj': None, 'tt': 'Идел', 'ba': None,
        'es-419': 'el Volga', 'tr-TR': 'Volga', 'fa-IR': 'ولگا',
    },
    'Сетнер (помощник)': {
        'mdf': 'Сетнер', 'myv': 'Сетнер', 'mhr': 'Сетнер', 'mrj': 'Сетнер', 'tt': 'Сетнер', 'ba': 'Сетнер',
        'es-419': 'Setner', 'tr-TR': 'Setner', 'fa-IR': 'ستنر',
    },
}
# Исправление ИМЕНА по текстам (очевидное расхождение): хинди/маратхи «Чебоксары» — во всех 20 строках хинди
# написано चेबोक्सारी (ударное «са» = долгое ā), в ИМЕНА — चेबोक्सरी. Приводим ИМЕНА к текстам (ЧЕРНОВИК).
NAMES_FIX = {('Чебоксары (город)', 'hi-IN'): 'चेबोक्सारी', ('Чебоксары (город)', 'mr-IN'): 'चेबोक्सारी'}
TOFU_FIX = {'hi-IN': ('चेबोक्सरी', 'चेबोक्सारी'), 'mr-IN': ('चेबोक्सरी', 'चेबोक्सारी')}

# ---------------------------------------------------------------- п.5: приведение строк готовых языков к ИМЕНА
# название игры в ui.share_text (кавычки — по правилам языка, как в соседних строках)
SHARE_FIX = {
    'en-GB': ('in the game Na Cheboksare', 'in the game ‘Along the Cheboksar’'),
    'en-US': ('in the game Na Cheboksare', 'in the game “Along the Cheboksar”'),
    'de-DE': ('im Spiel Na Cheboksare', 'im Spiel „In Tscheboksar“'),
    'fr-FR': ('du jeu Na Cheboksare', 'du jeu « À Tcheboksar »'),
    'hi-IN': ('«Na Cheboksare»', '«चेबोक्सार में»'),
    'tr-TR': ('Na Cheboksare oyununda', '“Çeboksar\'da” oyununda'),
    'zh-Hans': ('《Na Cheboksare》', '《切博克萨雷寻踪》'),
}
# имя Сетнера: zh-Hans — по ИМЕНА 谢特涅尔 (русско-китайская практическая транскрипция: Се→谢, т→特, не→涅, р→尔);
# hi-IN — по ИМЕНА सेतनेर (в части строк было सेत्नेर)
SETNER_FIX = {'zh-Hans': [('塞特内尔', '谢特涅尔'), ('塞特涅尔', '谢特涅尔')], 'hi-IN': [('सेत्नेर', 'सेतनेर')]}

# ---------------------------------------------------------------- п.6: версия содержания на языке гостя (ICU)
CONTENT_VERSION = {
    'ru-RU': 'Версия содержания {version} · {date}',
    'en-GB': 'Content version {version} · {date}',
    'en-US': 'Content version {version} · {date}',
    'de-DE': 'Inhaltsversion {version} · {date}',
    'fr-FR': 'Version du contenu {version} · {date}',
    'zh-Hans': '内容版本 {version} · {date}',
    'hi-IN': 'सामग्री संस्करण {version} · {date}',
    'tr-TR': 'İçerik sürümü {version} · {date}',
    'ar': 'إصدار المحتوى {version} · {date}',
}

# ---------------------------------------------------------------- п.3: заголовок блока «Предлагаем» на экране выбора языка
# (в блоке теперь может быть несколько вариантов: язык телефона + варианты страны телефона). Переводы — ЧЕРНОВИК ИИ.
LANG_SUGGEST_TITLE = {
    'ru-RU': 'Предлагаем', 'en-GB': 'Suggested', 'en-US': 'Suggested', 'de-DE': 'Vorschläge', 'fr-FR': 'Suggestions',
    'zh-Hans': '推荐', 'hi-IN': 'सुझाव', 'tr-TR': 'Önerilenler', 'ar': 'مقترحات',
}

# ---------------------------------------------------------------- п.4: латинские «чувашские» буквы -> кириллица
CHUV_MAP = {'ă': 'ӑ', 'Ă': 'Ӑ', 'ĕ': 'ӗ', 'Ĕ': 'Ӗ', 'ě': 'ӗ', 'Ě': 'Ӗ', 'ç': 'ҫ', 'Ç': 'Ҫ',
            'ÿ': 'ӳ', 'Ÿ': 'Ӳ', 'ü': 'ӳ', 'Ü': 'Ӳ'}
WORD = re.compile(r'[^\W\d_]+', re.U)


def fix_chuvash(text):
    """В словах, где есть кириллица, латинские ă ĕ ě ç ÿ ü -> чувашские ӑ ӗ ӗ ҫ ӳ ӳ. Возвращает (текст, [(было, стало)])."""
    changes = []

    def repl(m):
        w = m.group(0)
        if not any('Ѐ' <= ch <= 'ӿ' for ch in w):
            return w
        nw = ''.join(CHUV_MAP.get(ch, ch) for ch in w)
        if nw != w:
            changes.append((w, nw))
        return nw

    return WORD.sub(repl, text), changes


def copy_style(src, dst):
    if src.has_style:
        dst.font = copy(src.font)
        dst.fill = copy(src.fill)
        dst.border = copy(src.border)
        dst.alignment = copy(src.alignment)
        dst.number_format = src.number_format
        dst.protection = copy(src.protection)


def lang_cols(ws):
    m = {}
    for c in range(2, ws.max_column + 1):
        h = ws.cell(1, c).value
        if h:
            m[str(h).split('\n')[-1].strip()] = c
    return m


def title_case_form(code, name):
    """ui.title пишется прописными (как русское «НА ЧЕБОКСАРЕ»); у письменностей без регистра — как в ИМЕНА"""
    if code == 'tr-TR':
        return name.replace('i', 'İ').upper()
    return name.upper()


def main():
    shutil.copyfile(SRC, DST)
    wb = openpyxl.load_workbook(DST, data_only=False)
    log = []

    # ---------------------------------------------------- п.2 + п.3: ЯЗЫКИ
    ws = wb['ЯЗЫКИ']
    head = [ws.cell(1, c).value for c in range(1, ws.max_column + 1)]
    assert 'Страны (ISO 3166-1)' not in head
    rcol = ws.max_column + 1
    copy_style(ws.cell(1, rcol - 1), ws.cell(1, rcol))
    ws.cell(1, rcol).value = 'Страны (ISO 3166-1)'
    ws.column_dimensions[get_column_letter(rcol)].width = 34
    tcol = head.index('Тест-строка (тофу)') + 1
    stcol = head.index('Статус текста') + 1
    seen = []
    for r in range(2, ws.max_row + 1):
        copy_style(ws.cell(r, rcol - 1), ws.cell(r, rcol))
        ws.cell(r, rcol).alignment = Alignment(wrap_text=True, vertical='top')
        code, kind = ws.cell(r, 1).value, ws.cell(r, 2).value
        if kind != 'письменный':
            continue
        seen.append(code)
        ws.cell(r, rcol).value = REGIONS[code]
        if code in TOFU_FIX:
            a, b = TOFU_FIX[code]
            v = ws.cell(r, tcol).value
            assert a in v, (code, v)
            ws.cell(r, tcol).value = v.replace(a, b)
        if code == 'ru-RU':
            assert ws.cell(r, stcol).value == 'ИСХОДНИК', ws.cell(r, stcol).value
    assert sorted(seen) == sorted(ALL22), seen
    log.append('Решение владельца 22.10.2026 (п.2): статус текста ru-RU = ИСХОДНИК — УТВЕРЖДЕНО владельцем (в v2.7 было '
               '«подтвердить»). Метки «черновик» у русского нет; в листе ВЫЧИТКА у ru-RU — отметка об утверждении.')
    log.append('Решение владельца 22.10.2026 (п.3): лист ЯЗЫКИ — новая колонка «Страны (ISO 3166-1)»: коды стран, где вариант '
               'естественно предложить. Приложение берёт страну только из настроек телефона (expo-localization, regionCode) — '
               'без геолокации, без сети и без разрешений. На экране выбора языка блок «Предлагаем» = язык телефона + варианты '
               'страны телефона (только переведённые; «готовится» не предлагаем). Зеркало в коде — поле regions в '
               'src/i18n/languages.ts; npm run check сверяет таблицу и код. Привязка к аккаунту — следующий шаг (аккаунтов нет).')
    log.append('ЯЗЫКИ, тест-строки хинди и маратхи: «चेबोक्सरी» -> «चेबोक्सारी» (как в ИМЕНА и текстах, см. ниже).')

    # ---------------------------------------------------- п.2: ВЫЧИТКА — только отметка по ru-RU
    ws = wb['ВЫЧИТКА']
    for r in range(2, ws.max_row + 1):
        if ws.cell(r, 1).value == 'ru-RU':
            ws.cell(r, 6).value = 'ИСХОДНИК — утверждено владельцем 22.10.2026'
            break
    else:
        raise SystemExit('ВЫЧИТКА: нет строки ru-RU')

    # ---------------------------------------------------- п.4: L03 и любые латинские «чувашские» буквы в русском тексте
    chuv_log = []
    for sheet in ['Интерфейс', 'Тексты', 'Легенды']:
        ws = wb[sheet]
        c = lang_cols(ws)['ru-RU']
        for r in range(2, ws.max_row + 1):
            v = ws.cell(r, c).value
            if not isinstance(v, str):
                continue
            nv, ch = fix_chuvash(v)
            if ch:
                ws.cell(r, c).value = nv
                chuv_log.append(f'{sheet} / {ws.cell(r, 1).value}: ' + ', '.join(f'{a} -> {b}' for a, b in ch))
    assert any('L03_TORAMUSH' in x for x in chuv_log), chuv_log
    log.append('Решение владельца 22.10.2026 (п.4): в русском оригинале чувашская фраза набрана чувашскими буквами, а не '
               'латинскими с диакритикой: ' + '; '.join(chuv_log) + '. Тем же скриптом исправлен CSV Unity '
               '(NaCheboksare_Legends.csv, русская колонка) — сверка контракта 39/0 сохраняется.')

    # ---------------------------------------------------- п.5: ИМЕНА — 22 варианта, черновик
    ws = wb['ИМЕНА']
    cols = {str(ws.cell(1, c).value): c for c in range(2, ws.max_column + 1) if ws.cell(1, c).value}
    last = max(cols.values())
    width = ws.column_dimensions[get_column_letter(last)].width
    note_row = None
    for r in range(2, ws.max_row + 1):
        v = ws.cell(r, 1).value
        if isinstance(v, str) and v.startswith('ВСЕ переводы'):
            note_row = r
    added = []
    for code in ALL22:
        if code in cols:
            continue
        col = ws.max_column + 1
        for r in range(1, ws.max_row + 1):
            if r != note_row:
                copy_style(ws.cell(r, last), ws.cell(r, col))
        ws.cell(1, col).value = code
        ws.column_dimensions[get_column_letter(col)].width = width
        cols[code] = col
        added.append(code)
        if code == 'fa-IR':
            for r in range(2, ws.max_row + 1):
                if r != note_row:
                    ws.cell(r, col).alignment = Alignment(horizontal='right', vertical='top', wrap_text=True, readingOrder=2)
    rows = {ws.cell(r, 1).value: r for r in range(2, ws.max_row + 1) if ws.cell(r, 1).value}
    filled, left_empty = [], []
    for key, vals in NAMES_DRAFT.items():
        r = rows[key]
        for code, val in vals.items():
            cur = ws.cell(r, cols[code]).value
            assert cur in (None, ''), (key, code, cur)  # трогаем только пустые
            if val:
                ws.cell(r, cols[code]).value = val
                filled.append(f'{key.split(" (")[0]} {code}: {val}')
            else:
                left_empty.append((key, code))
    for (key, code), val in NAMES_FIX.items():
        r = rows[key]
        old = ws.cell(r, cols[code]).value
        ws.cell(r, cols[code]).value = val
        log.append(f'ИМЕНА / {key} / {code}: «{old}» -> «{val}» — так написано во всех строках хинди (ударное «са» = долгое ā); ЧЕРНОВИК.')
    # все 4 обязательные строки — ни одной пустой клетки, кроме оставленных сознательно
    for key in NAMES_DRAFT:
        r = rows[key]
        empty = [c for c in ALL22 if not ws.cell(r, cols[c]).value]
        assert sorted(empty) == sorted(c for k, c in left_empty if k == key), (key, empty)
    if note_row:
        ws.cell(note_row, 1).value = ('ВСЕ переводы, кроме ru-RU и cv, — ЧЕРНОВИК до вычитки носителем (правило ТЗ р.5). '
                                      'Пустая ячейка = перевести. Новые имена добавлять строками. v2.8: колонки всех 22 вариантов; '
                                      'черновик ИИ 22.10.2026; пусто — где нет уверенности (языки России — спросить носителя).')
    log.append(f'Решение владельца 22.10.2026 (п.5): лист ИМЕНА — добавлены колонки {", ".join(added)} (теперь все 22 варианта). '
               f'Строки «Чебоксары», «На Чебоксаре», «Волга», «Сетнер» дозаполнены ЧЕРНОВИКОМ ИИ ({len(filled)} ячеек): '
               + '; '.join(filled) + '. Оставлены ПУСТЫМИ (нет уверенности — спросить носителя): ' + ', '.join(f'{k.split(" (")[0]} {c}' for k, c in left_empty) + '.')

    names = {}
    for key in NAMES_DRAFT:
        names[key] = {c: ws.cell(rows[key], cols[c]).value for c in ALL22}

    # ---------------------------------------------------- п.5: строки готовых языков -> ИМЕНА
    ws = wb['Интерфейс']
    ic = lang_cols(ws)
    irow = {ws.cell(r, 1).value: r for r in range(2, ws.max_row + 1) if ws.cell(r, 1).value}
    title_log = []
    for code in READY:
        nm = names['На Чебоксаре (название)'][code]
        assert nm, code
        want = title_case_form(code, nm)
        cell = ws.cell(irow['ui.title'], ic[code])
        if cell.value != want:
            title_log.append(f'{code}: «{cell.value}» -> «{want}»')
            cell.value = want
    share_log = []
    for code, (a, b) in SHARE_FIX.items():
        cell = ws.cell(irow['ui.share_text'], ic[code])
        assert cell.value.count(a) == 1, (code, cell.value)
        cell.value = cell.value.replace(a, b)
        share_log.append(code)
    setner_log = {}
    for sheet in ['Интерфейс', 'Тексты', 'Легенды']:
        w = wb[sheet]
        lc = lang_cols(w)
        for code, pairs in SETNER_FIX.items():
            c = lc[code]
            for r in range(2, w.max_row + 1):
                v = w.cell(r, c).value
                if not isinstance(v, str):
                    continue
                nv = v
                for a, b in pairs:
                    nv = nv.replace(a, b)
                if nv != v:
                    w.cell(r, c).value = nv
                    setner_log.setdefault(code, []).append(str(w.cell(r, 1).value))
    assert setner_log.get('zh-Hans') and setner_log.get('hi-IN'), setner_log
    log.append('Решение владельца 22.10.2026 (п.5): название игры в строках готовых языков — по ИМЕНА, без транслита «NA CHEBOKSARE»: '
               'ui.title ' + '; '.join(title_log) + f'; ui.share_text ({", ".join(share_log)}) — «Na Cheboksare» заменено названием из ИМЕНА.')
    log.append('Имя Сетнера по ИМЕНА: zh-Hans «塞特内尔» / «塞特涅尔» -> «谢特涅尔» (' + ', '.join(setner_log['zh-Hans'])
               + '); выбрано по русско-китайской практической транскрипции (Се -> 谢, как Сергей -> 谢尔盖; не -> 涅; р -> 尔). '
               'Система Палладия — обратная (китайский -> русский), к этому имени не применяется. hi-IN «सेत्नेर» -> «सेतनेर» ('
               + ', '.join(setner_log['hi-IN']) + '). Проверка: npm run qa:names (tools/names_check.py).')

    # ---------------------------------------------------- п.6: ui.content_version
    assert 'ui.content_version' not in irow
    at = irow['ui.version'] + 1
    ws.insert_rows(at, 1)
    for c in range(1, ws.max_column + 1):
        copy_style(ws.cell(at - 1, c), ws.cell(at, c))
    ws.cell(at, 1).value = 'ui.content_version'
    for code, v in CONTENT_VERSION.items():
        ws.cell(at, ic[code]).value = v
    irow = {ws.cell(r, 1).value: r for r in range(2, ws.max_row + 1) if ws.cell(r, 1).value}
    assert 'ui.lang_suggest_title' not in irow
    at = irow['ui.lang_suggested'] + 1
    ws.insert_rows(at, 1)
    for c in range(1, ws.max_column + 1):
        copy_style(ws.cell(at - 1, c), ws.cell(at, c))
    ws.cell(at, 1).value = 'ui.lang_suggest_title'
    for code, v in LANG_SUGGEST_TITLE.items():
        ws.cell(at, ic[code]).value = v
    log.append('Решение владельца 22.10.2026 (п.3): новый ключ ui.lang_suggest_title — заголовок блока «Предлагаем» на экране выбора '
               'языка (язык телефона + варианты страны телефона); 9 готовых языков, переводы — ЧЕРНОВИК ИИ.')
    log.append('Решение владельца 22.10.2026 (п.7): новый ключ ui.content_version — «Версия содержания {version} · {date}» на 9 готовых '
               'языках (слова — из готового ключа ui.version каждого языка). Номер и дата берутся генератором из строки версии этого '
               'листа; дату приложение пишет средствами языка (22 октября 2026 г. / 22 October 2026 / 2026年10月22日…). '
               'На вкладке «О проекте» строка версии теперь на языке гостя.')
    log.append('Решение владельца 22.10.2026 (п.1, только код): ссылка на Сетнера — t.me/…?start=<код>_<письменный>[_<голосовой>] '
               '(Telegram передаёт боту только start; латиница, цифры, _ и -, не длиннее 64; при превышении сначала отбрасывается '
               'голос, потом язык — код прохождения не теряется). Параметры &lang= &voice= убраны. Боту: разбирать start по «_».')
    log.append('Приложение 1.1.1: шрифты письменностей — подмножества (только буквы из строк таблицы + цифры, латиница, знаки; у арабского '
               'и деванагари — весь основной блок письма), собираются генератором (tools/font_subset.py) в assets/fonts/subset/. '
               'Китайский традиционный и кантонский — без шрифта, пока у них нет текстов (подмножество появится само).')

    # ---------------------------------------------------- журнал
    w2 = wb['Как устроено']
    assert 'версия 2.7' in str(w2.cell(2, 2).value)
    w2.cell(2, 2).value = 'Краеведческий квест · проект «Спутник гостя Чебоксар» · версия 2.8 · 22 октября 2026'
    r = w2.max_row + 2
    w2.cell(r, 2).value = ('ЖУРНАЛ ИЗМЕНЕНИЙ v2.7 → v2.8 (22.10.2026, решения владельца от 22.10.2026 12:31; приложение 1.1.1; '
                           'исполнитель — Claude Opus по ТЗ)')
    r += 1
    for line in log:
        w2.cell(r, 3).value = line
        r += 1
    w2.cell(r, 3).value = ('Статусы: всё новое в ИМЕНА и переводах — ЧЕРНОВИК (ИИ), до вычитки носителем. Решения 1–4 и 7 — владелец; '
                           'ru-RU — ИСХОДНИК (утверждено). Лист ВЫЧИТКА не менялся, кроме отметки у ru-RU.')
    wb.save(DST)
    print('Сохранено:', DST)
    for line in log:
        print(' -', line[:240])

    # ---------------------------------------------------- CSV Unity: та же замена в русской колонке
    if CSV_LEGENDS.exists():
        raw = CSV_LEGENDS.read_bytes()
        bom = raw.startswith(b'\xef\xbb\xbf')
        txt = raw.decode('utf-8-sig')
        lines = txt.split('\n')
        changed = 0
        for i, line in enumerate(lines):
            if line.startswith('L03_TORAMUSH,'):
                # русская колонка — третья; поле в кавычках: заменяем только внутри неё
                m = re.match(r'^(L03_TORAMUSH,[^,]*,)("(?:[^"]|"")*")(.*)$', line, re.S)
                assert m, 'L03 в CSV: формат строки не тот'
                ru, ch = fix_chuvash(m.group(2))
                if ch:
                    lines[i] = m.group(1) + ru + m.group(3)
                    changed += 1
                    print('CSV Unity L03:', ch)
        if changed:
            out = '\n'.join(lines)
            CSV_LEGENDS.write_bytes((b'\xef\xbb\xbf' if bom else b'') + out.encode('utf-8'))
        print('CSV Unity:', CSV_LEGENDS.name, 'исправлено строк:', changed)
    else:
        print('CSV Unity не найден (пропущено):', CSV_LEGENDS)


if __name__ == '__main__':
    main()
