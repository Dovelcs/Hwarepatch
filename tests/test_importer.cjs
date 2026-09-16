const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={console,TextEncoder,TextDecoder,embeddedData:{name:'base',id:'base',components:[]}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('templates/importer.js','utf8'),ctx);
(async()=>{await vm.runInContext(String.raw`(async()=>{
const file=(name,text)=>({name,size:100,arrayBuffer:async()=>new TextEncoder().encode(text).buffer});
let pdfRejected=false;try{await readImportFile({name:'board.pdf',size:10,arrayBuffer:()=>{throw Error('should not read PDF')}},true)}catch(e){pdfRejected=e.message.includes('不能导入 PDF')}if(!pdfRejected)throw Error('PDF must explain coordinate export before reading');
const table=await readImportFile(file('board.txt','位号\tX\tY\t层\t型号\nR1\t-2mm\t1mil\tB\t"part,one"\nR2\t3\t4\tT\tres'),true);
const rows=parsePlacementTable(table);if(rows[0].x!==-2||rows[0].y!==.0254||rows[0].layer!=='Bottom')throw Error('coordinates');
mergeImportBom(rows,[{line:2,row:{Designator:'R1 - R2',Value:'10k',Footprint:'0603'}}]);if(!rows.every(c=>c.value==='10k'))throw Error('BOM range');
const id=await importBoardId(rows,'board');if(id!==await importBoardId([...rows].reverse(),'board'))throw Error('unstable ID');if(id===await importBoardId(rows,'another'))throw Error('board identity');
for(const bad of [[table[0],table[0]],[{line:2,row:{Designator:'R1',X:'NaN',Y:'1',Layer:'T'}}],[{line:2,row:{Designator:'R1',X:'1',Y:'1',Layer:'invalid'}}]]){let rejected=false;try{parsePlacementTable(bad)}catch{rejected=true}if(!rejected)throw Error('invalid input accepted')}
let rejected=false;try{mergeImportBom(rows,[{line:2,row:{Designator:'U99',Value:'test'}}])}catch{rejected=true}if(!rejected)throw Error('mismatched BOM');
console.log('PASS: TXT/Chinese headers/quoted fields/units, BOM ranges, stable per-board IDs, invalid and duplicate rejection');
})()`,ctx)})().catch(e=>{console.error(e);process.exitCode=1});
