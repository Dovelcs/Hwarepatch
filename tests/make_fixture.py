"""Generate synthetic regression data, with no real hardware layout."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pcbmap.models import Component
from pcbmap.render import generate_html
rows=[]
def add(ref, side, value='', device='DEMO', footprint='C0805', bom=None):
    i=len(rows)
    rows.append(Component(ref,device,footprint,(i%12)*8,(i//12)*8,side,value,bom or {}))
for ref in ['C1','C9','C21']: add(ref,'Top','100nF')
add('C24','Top',device='CAPR500-350X720X850100nF100V')
add('R9','Top',device='FRC0805F1002TS',footprint='R0805',bom={'Comment':'FRC0805J102 TS'})
for i in range(76): add('R'+str(100+i),'Top','10kΩ',footprint='R0805')
for i in range(10): add('C'+str(10+i),'Bottom','100nF')
for i in range(32): add('R'+str(300+i),'Bottom','10kΩ',footprint='R0805')
generate_html(rows,Path(__file__).with_name('fixture.html'),name='Synthetic regression board')
