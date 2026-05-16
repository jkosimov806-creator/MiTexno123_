const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 8080;
const mime = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};
http.createServer((req, res) => {
  let file = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(file, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname,'index.html'),(_,d)=>{
        res.writeHead(200,{'Content-Type':'text/html'});
        res.end(d);
      });
      return;
    }
    res.writeHead(200,{'Content-Type': mime[path.extname(file)]||'text/plain'});
    res.end(data);
  });
}).listen(PORT, ()=>console.log('Mi Texno running on port '+PORT));
