import csv
import io
import math
import re
from pathlib import Path
from .models import Component


def normalize(name):
    return re.sub(r'[\s_\-()./]+', '', str(name or '')).lower()


def read_table(path):
    if Path(path).suffix.lower() == '.xlsx':
        from openpyxl import load_workbook
        workbook = load_workbook(path, read_only=True, data_only=True)
        try:
            for sheet in workbook:
                values = iter(sheet.values)
                for index, header in enumerate(values, 1):
                    if any(normalize(v) in ('designator', 'reference', 'refdes', '位号', '元件位号') for v in header):
                        return [(i, {str(k).strip(): str(v if v is not None else '').strip() for k, v in zip(header, row) if k is not None})
                                for i, row in enumerate(values, index + 1) if any(v is not None for v in row)]
            raise ValueError('XLSX 找不到位号表头')
        finally:
            workbook.close()
    raw = Path(path).read_bytes()
    encodings = ('utf-16',) if raw.startswith((b'\xff\xfe', b'\xfe\xff')) else ('utf-8-sig', 'gb18030')
    for encoding in encodings:
        try:
            text = raw.decode(encoding)
            if '\x00' in text:
                continue
            break
        except UnicodeError:
            continue
    else:
        raise ValueError('无法识别文本编码，请另存为 UTF-8 CSV')
    lines = text.splitlines()
    # Find header after optional exporter metadata.
    for start, line in enumerate(lines):
        if any(word in line.lower() for word in ('designator', 'reference', '位号', 'refdes')):
            break
    else:
        raise ValueError('找不到位号表头')
    sample = '\n'.join(lines[start:])
    try:
        dialect = csv.Sniffer().sniff(sample[:10000], delimiters=',\t;')
        delimiter = dialect.delimiter
    except csv.Error:
        delimiter = max(',\t;', key=lines[start].count)
    reader = csv.DictReader(io.StringIO(sample), delimiter=delimiter)
    return [(i, {str(k).strip(): str(v or '').strip() for k, v in row.items() if k is not None})
            for i, row in enumerate(reader, start + 2) if any(row.values())]


def field(row, aliases, required=False):
    lookup = {normalize(k): v for k, v in row.items()}
    for alias in aliases:
        value = lookup.get(normalize(alias), '')
        if value != '':
            return value
    if required:
        raise ValueError('缺少字段：' + aliases[0])
    return ''


def coordinate(value):
    match = re.fullmatch(r'\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s*(mm|mil|in|inch)?\s*', value, re.I)
    if not match:
        raise ValueError(f'无效坐标：{value!r}')
    number = float(match[1]) * {'mm': 1, 'mil': .0254, 'in': 25.4, 'inch': 25.4, '': 1}[(match[2] or '').lower()]
    if not math.isfinite(number):
        raise ValueError('坐标必须为有限数值')
    return number


REFS = ('Designator', 'Reference', 'RefDes', '位号', '元件位号')
FOOTPRINT = ('Footprint', 'Package', '封装')
DEVICE = ('Device', 'Manufacturer Part Number', 'MPN', '型号', '器件型号')


def parse_placement(path):
    result, seen = [], set()
    for line, row in read_table(path):
        try:
            ref = field(row, REFS, True).upper()
            if ref in seen:
                raise ValueError(f'重复位号：{ref}')
            layer = field(row, ('Layer', 'Side', '层'), True).lower()
            layers = {'t': 'Top', 'top': 'Top', 'toplayer': 'Top', 'top layer': 'Top', 'f.cu': 'Top', '顶层': 'Top',
                      'b': 'Bottom', 'bottom': 'Bottom', 'bottomlayer': 'Bottom', 'bottom layer': 'Bottom', 'b.cu': 'Bottom', '底层': 'Bottom'}
            if layer not in layers:
                raise ValueError(f'未知层：{layer}')
            result.append(Component(ref, field(row, DEVICE), field(row, FOOTPRINT),
                                    coordinate(field(row, ('Mid X', 'Center X', 'PosX', 'X'), True)),
                                    coordinate(field(row, ('Mid Y', 'Center Y', 'PosY', 'Y'), True)), layers[layer]))
            result[-1].value = field(row, ('Comment', 'Value', '参数'))
            result[-1].bom = row
            angle = field(row, ('Rotation', 'Rot', '角度'))
            result[-1].rotation = float(angle or 0)
            if not math.isfinite(result[-1].rotation):
                raise ValueError('旋转角度必须为有限数值')
            seen.add(ref)
        except ValueError as exc:
            raise ValueError(f'{Path(path).name} 第 {line} 行：{exc}') from exc
    if not result:
        raise ValueError('坐标文件没有元件')
    return result
