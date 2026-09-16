"""Build the empty offline/hosted workbench without bundled board data."""
from pathlib import Path
from pcbmap.render import generate_html

if __name__ == '__main__':
    root = Path(__file__).resolve().parent
    generate_html([], root / 'placement.html', name='PCB 贴片工作台')
    (root / 'dist').mkdir(exist_ok=True)
    (root / 'dist/index.html').write_bytes((root / 'placement.html').read_bytes())
