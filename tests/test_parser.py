import tempfile
import unittest
from pathlib import Path
from pcbmap.parser import parse_placement, coordinate


class ParserTests(unittest.TestCase):
    def parse(self, text, encoding='utf-8'):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / 'test.txt'
            p.write_text(text, encoding=encoding)
            return parse_placement(p)

    def test_coordinates(self):
        self.assertEqual(coordinate('-55.88mm'), -55.88)
        self.assertAlmostEqual(coordinate('100mil'), 2.54)
        for bad in ('NaN', 'inf', '', '12cm', '1e999'):
            with self.assertRaises(ValueError): coordinate(bad)

    def test_csv_and_mid_priority(self):
        c = self.parse('Designator,Mid X,Mid Y,Ref X,Layer\nC1,89.154mm,-55.88mm,1,T')[0]
        self.assertEqual((c.x, c.y, c.layer), (89.154, -55.88, 'Top'))

    def test_tab_chinese_encoding(self):
        c = self.parse('位号\tMid X\tMid Y\tLayer\nR1\t-2\t3\tB', 'gb18030')[0]
        self.assertEqual(c.layer, 'Bottom')

    def test_utf16(self):
        self.assertEqual(self.parse('Designator;Mid X;Mid Y;Layer\nU1;0;0;Top', 'utf-16')[0].x, 0)

    def test_reject_invalid(self):
        for rows in ('R1,0,0,T\nR1,1,1,T', 'R1,,0,T', 'R1,0,0,Inner1'):
            with self.assertRaises(ValueError):
                self.parse('Designator,Mid X,Mid Y,Layer\n' + rows)


if __name__ == '__main__': unittest.main()
