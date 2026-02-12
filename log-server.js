const http = require('http');
const fs = require('fs');

const LOG_FILE = '/tmp/ai-browser.log';
const PORT = 9999;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const timestamp = new Date().toISOString();
      const line = `[${timestamp}] ${body}\n`;
      fs.appendFileSync(LOG_FILE, line);
      process.stdout.write(line);
      res.writeHead(200);
      res.end('ok');
    });
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Log server on http://0.0.0.0:${PORT}/log`);
  console.log(`Tail logs: tail -f ${LOG_FILE}`);
});
