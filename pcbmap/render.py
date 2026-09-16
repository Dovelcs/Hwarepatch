import hashlib
import json
from dataclasses import asdict
from pathlib import Path


def generate_html(components, output, name='PCB', template='viewer.html'):
    rows = [asdict(c) for c in components]
    fingerprint = hashlib.sha256(json.dumps(sorted(rows, key=lambda c: c['designator']), sort_keys=True).encode()).hexdigest()[:20]
    payload = json.dumps({'name': name, 'id': fingerprint, 'components': rows}, ensure_ascii=False).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    source = (Path(__file__).parent.parent / 'templates' / template).read_text(encoding='utf-8')
    root = Path(__file__).parent.parent
    source = source.replace('__MATERIALS_JS__', (root / 'templates/materials.js').read_text(encoding='utf-8'))
    source = source.replace('__IMPORTER_JS__', (root / 'templates/importer.js').read_text(encoding='utf-8'))
    source = source.replace('__ZIP_JS__', (root / 'vendor/jszip.min.js').read_text(encoding='utf-8'))
    Path(output).write_text(source.replace('__PCB_DATA__', payload), encoding='utf-8')

