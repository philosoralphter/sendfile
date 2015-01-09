#!/usr/bin/env node
var netModule = require('net');  //for streaming socket
var dgram = require('dgram');   //for broadcast
var ip = require('ip');  //ip utility
var fs = require('fs');

var thisIP = ip.address();
var hostIP;
var PORT = 7657;
var antennaLife = 15000;

var fileName;




//-----------
//*************Connect to server, Initiate transfer  (TCP Socket)
//----------------

function beginTransfer() {

  var socketConnection = new netModule.Socket();

  socketConnection.connect(PORT, hostIP, function connected(){
    //----------Config and handshake-------------------------------
    //Kill Socket after 5 seconds inactivity
    socketConnection.setTimeout(10000, function(){
      console.log('Socket Timeout');
      socketConnection.destroy();
      process.exit(1);
    });

    socketConnection.write('Client at: '+thisIP+' confirms connection.');
    
    //--------------Authentication---------------------------


    //-----------Receive data and write to file in current directory-------------
    var writeStream = fs.createWriteStream(process.cwd() +'/'+ fileName);
    socketConnection.on('data', function(chunk){
      writeStream.write(chunk);
    });

    socketConnection.on('end', function(){
      console.log('File Received');
      console.log('Closing Connection');
      writeStream.end();
      socketConnection.destroy();
    });

  });
};