#!/usr/bin/env node
console.log('the command is working');

var netModule = require('net');
var ip = require('ip');

var thisIP = 'localhost';//ip.address();
var port = 7657;

var fileToSend = process.argv[2];
var authentication = process.argv[3];
console.log('Server ip: ', ip.address() );
console.log('local ip: ', thisIP );

var server = netModule.createServer();

server.on('connection', function(socketConnection){
  //----------Config and handshake-------------------------------
  //Kill Socket after 5 second inactivity
  //socketConnection.timeout(5000, function(){socketConnection.destroy();});
  //LOGS
  console.log('Server connected to client');
  socketConnection.write('You have connected to '+thisIP);
  socketConnection.on('end', function() {
    console.log('Server disconnected from client.');
  });

  //--------------Authentication---------------------------



  //-------Receive client messages--------
  socketConnection.on('data', function(data){
    console.log(data.toString());
  });


  //socketConnection.pipe(socketConnection);
});


//Start Server
server.listen(port, thisIP, function(){
  console.log('Server initiated socket. Listening on port: '+port+' at address: '+ thisIP)
});
