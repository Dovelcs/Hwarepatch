const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.env.PCB_TEST_HTML||'tests/fixture.html','utf8'),scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
const nodes=new Map();class Node{constructor(){this.children=[];this.value='';this.checked=false;this.style={};this.classList={toggle(){},contains(){return false}};this.clientWidth=1100;this.clientHeight=650;this.attrs={}}append(...n){this.children.push(...n)}replaceChildren(){this.children=[]}setAttribute(k,v){this.attrs[k]=v}removeAttribute(){}querySelectorAll(){return []}addEventListener(){}click(){}remove(){}}
const get=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id)};get('data').textContent=scripts[0];const cloneNodes=new Map();const clone={querySelector(selector){if(!cloneNodes.has(selector))cloneNodes.set(selector,new Node());return cloneNodes.get(selector)},get outerHTML(){return html.replace(/(<script type="application\/json" id="data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+cloneNodes.get('#data').textContent+b)}};let blob;
const ctx={console,TextEncoder,TextDecoder,Blob,document:{getElementById:get,createElement:()=>new Node(),createElementNS:()=>new Node(),addEventListener(){},body:new Node(),documentElement:{cloneNode:()=>clone}},localStorage:{getItem:()=>null,setItem(){}},ResizeObserver:class{observe(){}},URL:{createObjectURL:b=>{blob=b;return 'blob:test'},revokeObjectURL(){}},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(scripts.at(-1),ctx);vm.runInContext(`
const get=ref=>components.find(c=>c.designator===ref),shown=ref=>svg.children.find(g=>g.attrs['data-ref']===ref);
const c24=get('C24'),c1=get('C1');
for(const [fp,expected] of [
 ['DF40C90_DS_QSC368_MATING',[20.6,3.38]],
 ['DF40C-90DS-0.4V(51)',[20.6,3.38]],
 ['Test-Point-0.5mm',[.5,.5]],
 ['HDR-TH_6P-P2.54-V-M-R2-C3-S2.54_RED',[7.62,5.08]],
 ['HDR-TH_10P-P2.54-V-M-R2-C5-S5.08',[12.7,7.62]],
 ['HDR-TH_6P-P2.54-V-M-R1-C6-S2.54',[15.24,2.54]],
 ['HDR-TH_6P-P2.54-V-M-R3-C2-S2.54',[5.08,7.62]],
 ['HDR-TH_6P-P2.54-R2',[7.62,5.08]],
 ['HDR-TH_6P-P2.54-R2-C4',[3,2]],
 ['HDR-TH_6P-P2.54',[15.24,2.54]],
 ['HDR-TH_L8.5-W5.5_6P-P2.54-R2-C3',[8.5,5.5]]
]){const actual=size({footprint:fp});if(actual.some((v,i)=>Math.abs(v-expected[i])>1e-9))throw Error('connector dimensions '+fp+': '+actual)}

const target={x:0,y:0,size:[4,2],rotation:90};if(componentDistance(target,0,0)!==0||componentDistance(target,0,3)!==1||componentDistance(target,2,0)!==1)throw Error('rotated hit geometry');
svg.getScreenCTM=()=>({a:10,b:0,inverse:()=>null});svg.createSVGPoint=()=>({matrixTransform(){return {x:this.x,y:this.y}}});const savedComponents=components;components=[{...c1,x:0,y:0,size:[2,2],rotation:0},{...c1,designator:'nearby',x:4,y:0,size:[2,2],rotation:0}];const event=(x,y)=>({clientX:x,clientY:y,target:{}});if(pickComponent(event(1.8,0))!==components[0]||pickComponent(event(2.2,0))!==components[1]||pickComponent(event(2,4))!==null)throw Error('nearest screen-space click tolerance');components=savedComponents;
moved=true;shown('C1').onkeydown({key:'Enter',preventDefault(){}});if(current!==c1)throw Error('keyboard blocked by previous drag');moved=false;
if(resolvedMaterialValue(get('R9'))!=='1kΩ'||materialInfo.get('R9').explicit)throw Error('R9 Comment priority and inferred status');
selectMaterial(get('R9'));if(!fuzzySelected.has('R9'))throw Error('R9 must stay red');
if(resolvedMaterialValue(c24)!=='100nF'||materialInfo.get('C24').explicit)throw Error('C24 inference');
selectMaterial(c1);render();if(selected.size!==14||fuzzySelected.size!==1||!fuzzySelected.has('C24'))throw Error('forward match');
if(!shown('C24').attrs.class.includes('fuzzy')||!shown('C1').attrs.class.includes('focused'))throw Error('forward colors');
selectMaterial(c24);render();if(selected.size!==14||fuzzySelected.size!==1||!fuzzySelected.has('C24'))throw Error('reverse match');
if(shown('C1').attrs.class.includes('fuzzy')||!shown('C1').attrs.class.includes('selected'))throw Error('explicit peers must be blue');
if(!shown('C24').attrs.class.includes('fuzzy')||shown('C24').attrs.class.includes('focused'))throw Error('missing-value clicked color');
toggleSelectionMark();if(![...selected].every(ref=>done.has(ref)))throw Error('red candidates not marked');toggleSelectionMark();if([...selected].some(ref=>done.has(ref)))throw Error('red candidates not unmarked');
const v=JSON.stringify(view);$('search').value='C24';$('search').oninput();if(JSON.stringify(view)!==v||fuzzySelected.size!==1)throw Error('search changed zoom or uncertainty');
setLayer('Bottom');if(svg.children.some(g=>g.attrs.class?.includes('focused')))throw Error('yellow after reverse side');
const c=(ref,value,device='',footprint='C0805',extra={})=>({designator:ref,value,device,footprint,x:0,y:0,layer:'Top',rotation:0,bom:{},...extra});
resetBoard({id:'generic',name:'generic',components:[c('C101','100nF','A'),c('C102','0.1μF','A','0805'),c('C103','','CAPR500-350X720X850100nF100V'),c('C104','','A'),c('C105','100nF','B'),c('C106','100nF','A','C0603'),c('C107','','UNKNOWN'),c('R1','4K7','RES','R0603'),c('R2','4.7kΩ','RES','0603'),c('R3','','RES4.7kΩ50V','R0603'),c('L1','1uH','COIL','L0805'),c('L2','','COIL1uH','L0805'),c('C108','','CAP100nF','C0805',{bom:{SMD:'No'}})]});
if(materialMatch(get('C101'),get('C102'))!=='exact')throw Error('equivalent values same model');
if(materialMatch(get('C101'),get('C105'))!==null)throw Error('different model treated exact');
for(const ref of ['C103','C104'])if(materialMatch(get('C101'),get(ref))!=='fuzzy'||materialMatch(get(ref),get('C101'))!=='fuzzy')throw Error('bidirectional inference');
for(const ref of ['C106','C107','C108'])if(materialMatch(get('C101'),get(ref))!==null)throw Error('unsafe match '+ref);
if(materialMatch(get('R1'),get('R2'))!=='exact'||materialMatch(get('R3'),get('R1'))!=='fuzzy')throw Error('resistor matching');
if(materialMatch(get('L1'),get('L2'))!==null||materialInfo.has('L2'))throw Error('inductor fuzzy enabled');
resetBoard({id:'codes',name:'codes',components:[c('R70','FRC0603J472TS','FRC0603F1002TS','R0603',{bom:{Comment:'FRC0603J472TS'}}),c('R71','4.7kΩ','A','R0603'),c('R72','','ABC0805F1002TS','R0805'),c('R73','','ABC0603F1002TS','R0805')]});
if(resolvedMaterialValue(get('R70'))!=='4.7kΩ'||materialInfo.get('R70').explicit)throw Error('generic comment priority');
selectMaterial(get('R70'));if(!selected.has('R71')||fuzzySelected.has('R71')||!fuzzySelected.has('R70'))throw Error('inferred resistor colors');
if(resolvedMaterialValue(get('R72'))!=='10kΩ'||materialInfo.has('R73'))throw Error('model code package validation');
resetBoard({id:'ambiguous',name:'ambiguous',components:[c('C1','100nF'),c('C2','5100nF'),c('C3','','MODEL8505100nF100V'),c('C4','1nF','SAME'),c('C5','2nF','SAME'),c('C6','','SAME')]});
if(materialInfo.has('C3')||materialInfo.has('C6'))throw Error('ambiguous value guessed');
resetBoard({id:'testpoints',name:'testpoints',components:[c('TPX','','','Test-Point-0.5mm'),c('TP2','','','Test-Point-1mm',{layer:'Bottom'}),c('J1','','','DF40C90_DS_QSC368_MATING'),c('TP3','physical loop','LOOP','Keystone_5015')]});
if(groups.size!==2||$('progresscount').textContent!=='0 / 2')throw Error('testpoint assembly count');
selectMaterial(get('TPX'));render();if(selected.size||!$('complete').disabled)throw Error('testpoint selected for assembly');
mark(true,['TPX','TP2','J1']);if(done.has('TPX')||done.has('TP2')||!done.has('J1')||$('progresscount').textContent!=='1 / 2')throw Error('testpoint marked');
$('unfinished').checked=true;if(visible(get('TPX'),false))throw Error('testpoint in unfinished');$('unfinished').checked=false;
if(!shown('TPX')||get('J1').size[0]!==20.6)throw Error('reference geometry missing');
resetBoard({id:'only-testpoints',name:'only-testpoints',components:[c('TPX','','','Test-Point-0.5mm')]});if($('progresscount').textContent!=='0 / 0'||$('progressbar').style.width!=='0%')throw Error('all testpoints progress');
resetBoard({id:'empty',name:'',components:[]});if(svg.children.length||groups.size||!view.every(Number.isFinite)||$('progresscount').textContent!=='0 / 0'||$('empty').hidden)throw Error('empty initial board');
console.log('PASS: exact blue vs fuzzy red, reverse matching including clicked red, cross-layer mark/unmark all candidates, search view stable, SMT R/C only, ambiguous values isolated');
`,ctx);
