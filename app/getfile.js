#!/usr/bin/env node
'use strict';
var netModule = require('net');  //for streaming socket
var ip = require('ip');  //ip utility
var fs = require('fs');

var constants = require('./constants');
var pairingService = require('./pairingService');

var broadcastListener = new pairingService.BroadcastListener();
var thisIP = ip.address();
var hostIP;
var fileName;

//-----------
//*************Listen for broadcast  (udp datagram )
//----------------

broadcastListener.listenForBroadcast(handshakeMadeHandler, thisIP);

function handshakeMadeHandler(receivedHostIP, receivedFileName){
  hostIP = receivedHostIP;
  fileName = receivedFileName;
  setTimeout(beginTransfer, 2000);
}



//-----------
//*************Connect to server, Initiate transfer  (TCP Socket)
//----------------

function beginTransfer() {

  var socketConnection = new netModule.Socket();

  socketConnection.connect(constants.PORT, hostIP, function connected(){
    //----------Config and handshake-------------------------------
    //Kill Socket after 5 seconds inactivity
    socketConnection.setTimeout(10000, function(){
      console.log('Socket Timeout');
      socketConnection.destroy();
      process.exit(1);
    });

    socketConnection.write('Client at: '+ thisIP + ' confirms connection.');
    

    //-----------Receive data and write to file in current directory-------------
    var writeStream = fs.createWriteStream(process.cwd() + '/' + fileName);
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