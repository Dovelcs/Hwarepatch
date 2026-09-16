import re
from .parser import read_table, field, REFS, DEVICE, FOOTPRINT


def expand_refs(text):
    refs = []
    for token in re.split(r'[,;，；\s]+', text.strip()):
        if not token:
            continue
        match = re.fullmatch(r'([A-Za-z]+)(\d+)\s*[-~–]\s*([A-Za-z]*)(\d+)', token)
        if match:
            prefix, first, other, last = match.groups()
            if other and prefix.upper() != other.upper():
                raise ValueError(f'无效位号范围：{token}')
            first, last = int(first), int(last)
            if last < first or last - first > 10000:
                raise ValueError(f'无效位号范围：{token}')
            refs.extend(f'{prefix.upper()}{i}' for i in range(first, last + 1))
        else:
            refs.append(token.upper())
    return refs


def merge_bom(components, path):
    mapping, warnings = {}, []
    for line, row in read_table(path):
        for ref in expand_refs(field(row, REFS, True)):
            if ref in mapping:
                raise ValueError(f'BOM 第 {line} 行重复位号：{ref}')
            mapping[ref] = row
    known = {c.designator for c in components}
    for ref in mapping.keys() - known:
        warnings.append(f'BOM 位号 {ref} 不在坐标文件中')
    for c in components:
        row = mapping.get(c.designator)
        if row is None:
            warnings.append(f'{c.designator} 未匹配 BOM')
            continue
        c.value = field(row, ('Comment', 'Value', '参数', '数值')) or c.value
        c.device = field(row, DEVICE) or c.device
        c.footprint = field(row, FOOTPRINT) or c.footprint
        c.bom = row
    return warnings
