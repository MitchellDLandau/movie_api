const http = require('http'),
fs = require ('fs'),
url = require ('url');

http.createServer((request, response) => {      //http module used to set up the server. 
    let addr = request.url;
    q = url.parse(addr, true);
    filePath = '';

fs.appendFile('CareerFoundryTerminal/movie_api/log.txt', 'URL: ' + addr + '\nTimestamp:' + new Date() + '\n\n', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Added to log.');
    }
});

if (q.pathname.includes('documentation')) {
    filePath = (__dirname + '/documentation.html');     //url module to grab and read a URL request sent by the user
} else {
    filePath = './CareerFoundryTerminal/movie_api/index.html';
};

fs.readFile(filePath, (err, data) => {          // fs module to send back the appropriate file.
    if (err) {
        throw err;
    }

    response.writeHead(200, { 'Content-Type': 'text/html' });

    response.write(data);
    response.end();
});
}).listen(8080);
console.log('My first Node test server is running on Port 8080.');
