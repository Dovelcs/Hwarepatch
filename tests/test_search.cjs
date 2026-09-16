const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.env.PCB_TEST_HTML||'tests/fixture.html','utf8'),scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
const nodes=new Map();class Node{constructor(){this.children=[];this.value='';this.checked=false;this.style={};this.classList={toggle(){},contains(){return false}};this.clientWidth=1100;this.clientHeight=650;this.attrs={}}append(...n){this.children.push(...n)}replaceChildren(){this.children=[]}setAttribute(k,v){this.attrs[k]=v}removeAttribute(){}querySelectorAll(){return []}addEventListener(){}click(){}remove(){}}
const get=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id)};get('data').textContent=scripts[0];const cloneNodes=new Map();const clone={querySelector(selector){if(!cloneNodes.has(selector))cloneNodes.set(selector,new Node());return cloneNodes.get(selector)},get outerHTML(){return html.replace(/(<script type="application\/json" id="data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+cloneNodes.get('#data').textContent+b)}};let blob;
const ctx={console,TextEncoder,TextDecoder,Blob,document:{getElementById:get,createElement:()=>new Node(),createElementNS:()=>new Node(),addEventListener(){},body:new Node(),documentElement:{cloneNode:()=>clone}},localStorage:{getItem:()=>null,setItem(){}},ResizeObserver:class{observe(){}},URL:{createObjectURL:b=>{blob=b;return 'blob:test'},revokeObjectURL(){}},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(scripts.at(-1),ctx);vm.runInContext(`
zoom(.75);const originalView=JSON.stringify(view);$('search').value='C12';$('search').oninput();
if(JSON.stringify(view)!==originalView)throw Error('search changed view');$('search').onkeydown({key:'Enter'});if(JSON.stringify(view)!==originalView)throw Error('Enter changed view');
const shown=()=>svg.children.filter(g=>g.attrs['data-ref']);
if(layer!=='Bottom'||shown().length!==42)throw Error('search removed board context');
const target=shown().find(g=>g.attrs['data-ref']==='C12');if(!target.attrs.class.includes('focused'))throw Error('target not yellow');
if(!shown().some(g=>g.attrs.class.includes('dim')))throw Error('other components missing');
if($('materials').children.length!==1)throw Error('material results not filtered');
$('search').value='NO_SUCH_PART';$('search').oninput();if(shown().length!==42||$('materials').children.length!==0)throw Error('unmatched search hid context or leaked result');
$('search').value='100nF';$('search').oninput();$('search').onkeydown({key:'Enter'});if(JSON.stringify(view)!==originalView)throw Error('material search changed view');$('search').value='';$('search').oninput();if(JSON.stringify(view)!==originalView)throw Error('clear search changed view');$('type').value='R';$('type').onchange();if(shown().some(g=>!g.attrs['data-ref'].startsWith('R')))throw Error('explicit type filter broken');
console.log('PASS: C12 search retains 42 bottom components, focused highlight, filtered list, empty search results and explicit type filter');
`,ctx);
