#!/usr/bin/env node
'use strict';

var fs = require('fs');
var ip = require('ip');
var parseArgs = require('minimist');
var prompt = require('prompt');

var constants = require('./../constants');
var utils = require('../util/convenienceUtilities.js');
var pairingService = require('./../lib/pairingService');
var fileTransferService = require('./../lib/fileTransferService');
var broadcaster = new pairingService.Broadcaster();
var fileServer = new fileTransferService.FileSender();


var thisIP = ip.address();
var destinationIP;
var fileInputPath, fileResolvedPath, fileName;
var argv;

//-----------------
//Parse arguments
//---------------
argv = parseArgs(process.argv, {

});

//Respond to HALP!
if (argv.h || argv.help || argv._.length() > 1 || utils.containsString(argv._, 'help')) {
    displayHelp();
    process.exit(0);
}

//Resolve file, verify exists
fileInputPath = argv._[0] || argv.f || argv.file;
try {
    fileResolvedPath = fs.realpathSync(fileInputPath);
}
catch (e) {
    console.log('Could not resolve file path.  Does it Exist?\n\t`$ sendfile help` for help');
    process.exit(1);
}
fileName = fileResolvedPath.match(utils.fileNameRegex)[0];





//-------------------
//*************Broadcast intent and location   (UDP datagram socket)
//---------------

broadcaster.initiateBroadcast(thisIP, broadcastMessage, broadcastResponseHandler);

function broadcastResponseHandler(exitStatus, passedDestinationIP){
  if (exitStatus !== 0){
    process.exit(exitStatus);
  }else{
    destinationIP = passedDestinationIP;
    transferFile();
  }
}



//----------
//************File Server**********************  (TCP Socket)
//-----------------------
function transferFile(){
  fileServer.transferFile(fileToSend, thisIP, destinationIP, transferFinishedHandler);
}

function transferFinishedHandler(exitStatus){
  process.exit(exitStatus);
}
