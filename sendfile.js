#!/usr/bin/env node
console.log('the command is working');

var netModule = require('net');
var ip = require('ip');

var thisIP = 'localhost';//ip.address();
var port = 7657;
var fileToSend = process.argv[2];
var authentication = process.argv[3];
console.log(': ', ip.address() );

console.log('ip: ', thisIP );

var server = netModule.createServer(function(socketConnection){
  //Kill Socket after 5 second inactivity
  //socketConnection.timeout(5000, function(){socketConnection.destroy();});
  //LOGS
  console.log('server connected to client');
  socketConnection.write('You have connected to '+thisIP);

  socketConnection.on('data', function(data){
    console.log(data.toString());
  });

  socketConnection.on('end', function() {
    console.log('Client disconnected from server.');
  });


  

  socketConnection.pipe(socketConnection);
});

server.listen(port, thisIP, function(){
  console.log('Server initiated socket. Listening on port: '+port+' at address: '+ thisIP)
});
