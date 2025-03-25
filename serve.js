const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const STATIC_DIR = path.join(__dirname, 'static');
const CONTENT_DIR = path.join(__dirname, 'content');

const server = http.createServer((req, res) => {
  // Default to index.html
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Handle different routes
  if (filePath === '/articles') {
    filePath = '/articles/index.html';
  } else if (filePath.endsWith('/')) {
    filePath = filePath + 'index.html';
  }
  
  // Determine content type based on file extension
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }
  
  // Try to serve file from static directory
  const fullPath = path.join(STATIC_DIR, filePath);
  
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      // If file not found, display an error message
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`<h1>404 Not Found</h1><p>The requested file ${filePath} could not be found.</p>`);
    } else {
      // Serve the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Note: This is a simple development server without Hugo's full functionality`);
  console.log(`To view the full site, install Hugo: https://gohugo.io/installation/`);
});