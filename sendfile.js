#!/usr/bin/env node
console.log('the command is working');
console.log('args: ', process.argv );
console.log(__dirname);

var socket = require('net');
var ip = require('ip');

var server = socket.createServer(function(connection){
  console.log('server connected to client');

  connection.on('end', function() {
    console.log('server disconnected');
  });
  connection.write('hello!');
  connection.pipe(connection);
});

server.listen(7000, function(){
  console.log('server socket initiated')
});
