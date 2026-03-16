const http = require('http');
const fs   = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(port, () => {
  console.log(`Xhaka Control Room → http://localhost:${port}`);
});
