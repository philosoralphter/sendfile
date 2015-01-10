#!/usr/bin/env node
'use strict';

var ip = require('ip');

var constants = require('./constants');
var pairingService = require('./pairingService');
var fileTransferService = require('./fileTransferService');

var broadcaster = new pairingService.Broadcaster();
var fileServer = new fileTransferService.FileSender();
var thisIP = ip.address();
var destinationIP;


//Parse arguments
var fileToSend = process.argv[2];
var fileNameRegex = /[^/]+$/;
var fileName = fileToSend.match(fileNameRegex)[0];
var authentication = process.argv[3];

var broadcastMessage = new Buffer(fileName.toString());


//-------------------
//*************Broadcast intent and location   (UDP datagram socket)
//---------------

broadcaster.initiateBroadcast(function (passedDestinationIP){
  destinationIP = passedDestinationIP;
}, thisIP, broadcastMessage);





//----------
//************File Server**********************  (TCP Socket)
//-----------------------
console.log('-------------', destinationIP);
fileServer.transferFile(function(){}, fileToSend, thisIP, destinationIP);






