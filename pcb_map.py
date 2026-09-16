import argparse
import sys
from pathlib import Path
from pcbmap.parser import parse_placement
from pcbmap.render import generate_html
from pcbmap.bom import merge_bom


def main():
    parser = argparse.ArgumentParser(description='生成离线 PCB 手工贴片位号图')
    parser.add_argument('placement', help='CSV/TXT/XLSX 坐标文件')
    parser.add_argument('bom', nargs='?', help='可选 CSV/XLSX BOM')
    parser.add_argument('-o', '--output', default='placement.html')
    args = parser.parse_args()
    try:
        components = parse_placement(args.placement)
        if args.bom:
            for warning in merge_bom(components, args.bom):
                print('提示：' + warning, file=sys.stderr)
        generate_html(components, args.output, Path(args.placement).stem)
    except (ValueError, OSError, ImportError) as exc:
        print(f'错误：{exc}', file=sys.stderr)
        return 1
    print(f'{args.output}: {len(components)} 个元件')
    return 0


if __name__ == '__main__':
    sys.exit(main())
