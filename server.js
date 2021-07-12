var WebSocketServer = require("ws").Server
var http = require("http")
//var express = require("express")
//var app = express()
var port = process.env.PORT || 5000

//app.use(express.static(__dirname + "/"))

//var server = http.createServer(app)
var server = http.createServer()

server.on('request', (req, res) => {
    res.on('error', (err) => {
      console.error(err);
    });

    if (req.url == '/now') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ now: new Date() }));
        res.end();
    } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('example page\n');
        res.end('Hello World\n');
    }
});

server.listen(port)

console.log("http server listening on %d", port)

var wss = new WebSocketServer({server: server})

var net = require('net');

wss.on("connection", function(ws) {
  var max = 10000;
  var rnd = Math.floor(Math.random() * max);

  var client = new net.Socket();
  client.on('error', function() {
	  console.log('Ошибка сокета ' + rnd);
  });
  client.on('data', function(data) {
    if (ws.readyState == ws.OPEN){
      ws.send(data);
    }
  });
  client.on('close', function() {
    ws.close();
    client.destroy(); // kill client after server's response
  });

  ws.on('message', function incoming(message) {
    if (typeof(message) == "object"){
      if (client.readyState == "open"){
        client.write(message);
      }
    }
    if (typeof(message) == "string"){
      const arr = message.split(':');
      if (Number(arr[1]) != NaN){
        client.connect(Number(arr[1]), arr[0], function() {
          ws.send("("+rnd+") "+arr[0]+":"+arr[1]);
        });
      }
    }
  });

  ws.on("close", function() {
    //console.log("close");
    //ws.destroy();
  })

})
