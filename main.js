const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');

const screenshot = require('screenshot-desktop');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const html = fs.readFileSync('index.html', { encoding: 'utf8' });
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  } else if (req.url === '/screen') {
    screenshot()
      .then((buf) => {
        res.setHeader('Content-Type', 'image/jpeg');
        res.end(buf);
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  }
});

const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a client connected');

  setInterval(async () => {
    const buf = await screenshot();
    const b64 = Buffer.from(buf).toString('base64');
    const formatted = `data:image/jpeg;base64,${b64}`;
    socket.emit('getScreen', formatted);
  }, 200);
});

server.listen(3000);
