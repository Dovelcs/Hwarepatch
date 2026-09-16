// Development QA only. placement.html itself never needs a server.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
http.createServer(async(req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://local').pathname);if(name==='/')name='/index.html';const target=path.resolve('dist','.'+name);if(!target.startsWith(path.resolve('dist')+path.sep))throw Error();const body=await readFile(target);res.setHeader('Content-Type',name.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream');res.end(body)}catch{res.writeHead(404);res.end('Not found')}}).listen(4173,'0.0.0.0');
