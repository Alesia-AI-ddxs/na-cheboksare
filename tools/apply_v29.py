# -*- coding: utf-8 -*-
"""v2.8 -> v2.9: приложение «На Чебоксаре» 1.2.0 — волна 0 (рекомендации владельца от 23.10.2026).

Что делает (старую v2.8 НЕ трогает — работает с копией):
 1) лист «Интерфейс»: новые ключи «Лаборатории замеров» lab.* (скрытый служебный экран для владельца и тестировщиков) —
    ru-RU (обязательно) + en-GB (ЧЕРНОВИК ИИ); остальные языки пусто (по лестнице фолбэка покажется английский / русский);
 2) лист «Интерфейс»: ключ ui.open_3d — кнопка «Открыть в 3D» («вариант Э»: отдельное 3D-приложение по ссылке) —
    ru-RU + en-GB + en-US (ЧЕРНОВИК ИИ); пока схема 3D-приложения в app.json пустая, кнопки в приложении нет;
 3) журнал v2.8 -> v2.9 на листе «Как устроено» (+ строка версии B2).
Тексты, тексты T…, предания L…, ЯЗЫКИ, ИМЕНА не меняются — сверка с Unity CSV (check_contract_run.py) остаётся 39/0.

Запуск (из папки app_build):  python3 -I apply_v29.py
"""
import shutil
from copy import copy
from pathlib import Path

import openpyxl

HERE = Path(__file__).resolve().parent
XLSX_DIR = HERE.parent / 'xlsx_work' if (HERE.parent / 'xlsx_work').exists() else HERE
SRC = XLSX_DIR / 'КОНТЕНТ_На_Чебоксаре_v2.8_2026-10-22.xlsx'
DST = XLSX_DIR / 'КОНТЕНТ_На_Чебоксаре_v2.9_2026-10-23.xlsx'

# ключ: (ru-RU, en-GB). Переменные в {…} подставляет приложение (числа — средствами языка).
LAB = {
    'lab.title': ('Лаборатория замеров', 'Measurement lab'),
    'lab.intro': ('Служебный экран для владельца и тестировщиков. Замеры идут только на этом устройстве: без интернета, '
                  'без разрешений, ничего не сохраняется и никуда не отправляется. Перед замером закройте другие приложения.',
                  'Service screen for the owner and testers. Measurements run only on this device: no internet, no permissions, '
                  'nothing is stored or sent anywhere. Close other apps before measuring.'),
    'lab.section_device': ('Устройство', 'Device'),
    'lab.maker': ('Производитель', 'Manufacturer'),
    'lab.model': ('Модель', 'Model'),
    'lab.os': ('Система', 'Operating system'),
    'lab.ram': ('Оперативная память', 'RAM'),
    'lab.year_class': ('Класс устройства (год)', 'Device year class'),
    'lab.cpu': ('Процессор', 'Processor'),
    'lab.disk_free': ('Свободное место', 'Free storage'),
    'lab.screen': ('Экран (точки × плотность)', 'Screen (points × density)'),
    'lab.phone_lang': ('Язык и страна устройства', 'Device language and region'),
    'lab.no_data': ('нет данных', 'no data'),
    'lab.unit_mb': ('{value} МБ', '{value} MB'),
    'lab.unit_ms': ('{value} мс', '{value} ms'),
    'lab.unit_fps': ('{value} к/с', '{value} fps'),
    'lab.unit_pct': ('{value} %', '{value}%'),
    'lab.section_start': ('Холодный старт', 'Cold start'),
    'lab.start_hint': ('Время от запуска программы до первого экрана — в этом запуске. Для честного замера закройте приложение '
                       'полностью, откройте снова и сразу зайдите сюда.',
                       'Time from program start to the first screen in this launch. For a fair result, close the app completely, '
                       'reopen it and come here straight away.'),
    'lab.start_js': ('До первого экрана', 'To first screen'),
    'lab.run_all': ('Запустить все замеры (около {seconds} с)', 'Run all tests (about {seconds} s)'),
    'lab.run_2d': ('Только 2D', '2D only'),
    'lab.run_3d': ('Только 3D', '3D only'),
    'lab.running': ('Идёт замер — не трогайте экран', 'Measuring — please don’t touch the screen'),
    'lab.not_run': ('Ещё не запускали', 'Not run yet'),
    'lab.section_2d': ('2D-нагрузка', '2D load'),
    'lab.hint_2d': ('Виньетка текущей точки и движущиеся элементы: {count}; длительность — {seconds} с.',
                    'Current point vignette and moving elements: {count}; duration {seconds} s.'),
    'lab.section_3d': ('3D-нагрузка — бюджет 3D-модели', '3D load — 3D model budget'),
    'lab.hint_3d': ('Сфера с рельефом: {tris} треугольников, текстура {tex}×{tex}, свет и вращение. Три ступени по {seconds} с: '
                    '1, 4 и 8 объектов.',
                    'Sphere with relief: {tris} triangles, {tex}×{tex} texture, lighting and rotation. Three stages of {seconds} s: '
                    '1, 4 and 8 objects.'),
    'lab.stage': ('Ступень {n}: объектов — {objects}, треугольников — {tris}', 'Stage {n}: objects — {objects}, triangles — {tris}'),
    'lab.fps_avg': ('Средний кадр/с', 'Average fps'),
    'lab.fps_min': ('Минимальный кадр/с (худшая секунда)', 'Minimum fps (worst second)'),
    'lab.heavy': ('Тяжёлые кадры (дольше {ms} мс)', 'Heavy frames (over {ms} ms)'),
    'lab.first_frame': ('Первая отрисовка', 'First frame'),
    'lab.gl_errors': ('Ошибки GL', 'GL errors'),
    'lab.gpu': ('Видеочип', 'Graphics chip'),
    'lab.canvas': ('Размер холста, пикселей', 'Canvas size, pixels'),
    'lab.setup': ('Подготовка сцены (сетка и текстура)', 'Scene setup (mesh and texture)'),
    'lab.gl_unavailable': ('3D на этом устройстве не запустилось', '3D did not start on this device'),
    'lab.section_verdict': ('Итог: потянет ли 3D', 'Result: can it handle 3D'),
    'lab.verdict_green': ('Зелёный — 3D-сцена по бюджету идёт плавно: делать 3D можно.',
                          'Green — the budget 3D scene runs smoothly: 3D is a go.'),
    'lab.verdict_yellow': ('Жёлтый — одна модель идёт плавно, несколько — с рывками: 3D делать облегчённым.',
                           'Yellow — one model runs smoothly, several stutter: keep 3D light.'),
    'lab.verdict_red': ('Красный — 3D по этому бюджету тормозит: оставить 2D или уменьшить модель.',
                        'Red — 3D at this budget stutters: stay with 2D or reduce the model.'),
    'lab.verdict_none': ('Нет данных — запустите 3D-замер.', 'No data — run the 3D test.'),
    'lab.rule': ('Правило: зелёный — ступень 1 не меньше {g1} к/с и ступень 2 не меньше {g2} к/с; жёлтый — ступень 1 не меньше '
                 '{y1} к/с; иначе красный. Берётся средний кадр/с.',
                 'Rule: green — stage 1 at least {g1} fps and stage 2 at least {g2} fps; yellow — stage 1 at least {y1} fps; '
                 'otherwise red. Average fps is used.'),
    'lab.section_report': ('Отчёт', 'Report'),
    'lab.report_hint': ('Только модель устройства и цифры, без личных данных. Отчёт нигде не хранится — скопируйте его или отправьте.',
                        'Device model and numbers only, no personal data. The report is not stored anywhere — copy or share it.'),
    'lab.copy': ('Скопировать отчёт', 'Copy report'),
    'lab.copied': ('Скопировано', 'Copied'),
    'lab.share': ('Поделиться', 'Share'),
}
OPEN_3D = {'ru-RU': 'Открыть в 3D', 'en-GB': 'Open in 3D', 'en-US': 'Open in 3D'}


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


def main():
    shutil.copyfile(SRC, DST)
    wb = openpyxl.load_workbook(DST, data_only=False)
    log = []

    ws = wb['Интерфейс']
    ic = lang_cols(ws)
    irow = {ws.cell(r, 1).value: r for r in range(2, ws.max_row + 1) if ws.cell(r, 1).value}
    assert not any(k in irow for k in LAB) and 'ui.open_3d' not in irow, 'ключи уже есть'

    # ui.open_3d — сразу после ui.content_version (рядом с прочими ui.*)
    at = irow['ui.content_version'] + 1
    ws.insert_rows(at, 1)
    for c in range(1, ws.max_column + 1):
        copy_style(ws.cell(at - 1, c), ws.cell(at, c))
    ws.cell(at, 1).value = 'ui.open_3d'
    for code, v in OPEN_3D.items():
        ws.cell(at, ic[code]).value = v

    # lab.* — блоком после последнего ключа (finds.you_found), перед примечанием внизу листа
    irow = {ws.cell(r, 1).value: r for r in range(2, ws.max_row + 1) if ws.cell(r, 1).value}
    at = irow['finds.you_found'] + 1
    ws.insert_rows(at, len(LAB))
    for i, (key, (ru, en)) in enumerate(LAB.items()):
        r = at + i
        for c in range(1, ws.max_column + 1):
            copy_style(ws.cell(at - 1, c), ws.cell(r, c))
        ws.cell(r, 1).value = key
        ws.cell(r, ic['ru-RU']).value = ru
        ws.cell(r, ic['en-GB']).value = en
    # проверка: ICU-скобки сбалансированы, ru-RU заполнен везде
    for key, (ru, en) in LAB.items():
        for s in (ru, en):
            assert s.count('{') == s.count('}'), (key, s)

    log.append(f'Волна 0 (рекомендации владельца 23.10.2026; приложение 1.2.0): +{len(LAB)} ключей lab.* — скрытый служебный экран '
               '«Лаборатория замеров» (src/app/lab.tsx): устройство, холодный старт, 2D-нагрузка, 3D-нагрузка по бюджету 3D-актива '
               '(≈20 тыс. треугольников, текстура 2048×2048; ступени 1 / 4 / 8 объектов), итог зелёный / жёлтый / красный '
               '(правило: ступень 1 ≥ 30 к/с и ступень 2 ≥ 24 к/с — зелёный; ступень 1 ≥ 24 к/с — жёлтый; пороги в коде: '
               'src/lab/thresholds.ts), отчёт «ключ: значение» (скопировать / поделиться). ru-RU — исходник; en-GB — ЧЕРНОВИК ИИ; '
               'остальные языки пусто (фолбэк). Экран для владельца и тестировщиков: вход — 7 касаний подряд по строке «Версия '
               'содержания» во вкладке «О проекте» или ссылка nacheboksare://lab. Без интернета, без разрешений, ничего не хранит.')
    log.append('Новый ключ ui.open_3d — «Открыть в 3D» («вариант Э»: 3D-сцены — отдельное приложение по ссылке '
               '<схема>://scene/<точка>?lang=<язык>&code=<код>). ru-RU + en-GB + en-US (ЧЕРНОВИК ИИ), остальные — фолбэк. '
               'Кнопка появится только когда в app.json задана схема 3D-приложения (extra.unity3dScheme); сейчас пусто — кнопки нет.')

    w2 = wb['Как устроено']
    assert 'версия 2.8' in str(w2.cell(2, 2).value)
    w2.cell(2, 2).value = 'Краеведческий квест · проект «Спутник гостя Чебоксар» · версия 2.9 · 23 октября 2026'
    r = w2.max_row + 2
    w2.cell(r, 2).value = ('ЖУРНАЛ ИЗМЕНЕНИЙ v2.8 → v2.9 (23.10.2026, волна 0 по рекомендациям владельца от 23.10.2026; '
                           'приложение 1.2.0; исполнитель — Claude Opus по ТЗ)')
    r += 1
    for line in log:
        w2.cell(r, 3).value = line
        r += 1
    w2.cell(r, 3).value = ('Тексты T…, предания L…, листы ЯЗЫКИ / ИМЕНА / ВЫЧИТКА не менялись — сверка с Unity CSV 39/0 сохраняется. '
                           'Откат: таблица v2.8 + приложение 1.1.1 (README_СТУДИИ.md, раздел «Откат на 1.1.1»).')
    wb.save(DST)
    print('Сохранено:', DST)
    print(f'lab.*: {len(LAB)} ключей; ui.open_3d: {len(OPEN_3D)} языка')
    for line in log:
        print(' -', line[:200])


if __name__ == '__main__':
    main()
