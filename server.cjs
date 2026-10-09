const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = __dirname, types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
http.createServer((req, res) => {
  let name; try { name = decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname); } catch { res.writeHead(400); return res.end('Bad request'); }
  const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('Not found'); }
  res.setHeader('Content-Type',types[path.extname(file)] || 'text/plain; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff'); fs.createReadStream(file).pipe(res);
}).listen(4173,'127.0.0.1',() => console.log('Pin Multiplier: http://127.0.0.1:4173'));
