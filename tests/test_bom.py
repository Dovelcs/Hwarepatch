import tempfile
import unittest
from pathlib import Path
from openpyxl import Workbook
from pcbmap.parser import parse_placement
from pcbmap.bom import merge_bom, expand_refs
from pcbmap.render import generate_html


class BomTests(unittest.TestCase):
    def test_range(self):
        self.assertEqual(expand_refs('C1-C3, R2'), ['C1','C2','C3','R2'])
        with self.assertRaises(ValueError): expand_refs('C3-C1')

    def test_xlsx_merge(self):
        rows = parse_placement('examples/placement.csv')
        with tempfile.TemporaryDirectory() as d:
            p = Path(d)/'bom.xlsx'
            w=Workbook();w.active.append(['位号','参数','数量']);w.active.append(['C1,C2','100nF',2]);w.save(p)
            warnings=merge_bom(rows,p)
            self.assertEqual(rows[0].value,'100nF')
            self.assertEqual(len(warnings),2)

    def test_safe_embedded_json(self):
        rows=parse_placement('examples/placement.csv')
        rows[0].device='</script><script>alert(1)</script>'
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'map.html';generate_html(rows,p)
            self.assertNotIn(rows[0].device,p.read_text())
