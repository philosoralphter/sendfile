#!/usr/bin/env node
var netModule = require('net');
var ip = require('ip');

var destination = __dirname;
var thisIP = ip.address();
var hostIP = 'localhost';//process.argv[2];
var PORT = 7657;


var socketConnection = new netModule.Socket();

socketConnection.connect(PORT, hostIP, function(){
  //----------Config and handshake-------------------------------
  //Kill Socket after 5 second inactivity
  //socketConnection.timeout(5000, function(){socketConnection.destroy();});
  socketConnection.write('Client at: '+thisIP+' confirms connection.');
  console.log(socketConnection.localAddress);
  
  //--------------Authentication---------------------------


  //-----------Receive data and write to file in current directory-------------
  socketConnection.on('data', function(data){
    console.log(data.toString());
  });

});

