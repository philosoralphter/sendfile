#!/usr/bin/env node
var dgram = require('dgram');
var netModule = require('net');
var ip = require('ip');
var fs = require('fs');

var broadcaster = new require('./pairingService').Broadcaster();
var constants = require('./constants');

var thisIP = ip.address();
var PORT = 7657;

//Parse arguments
var fileToSend = process.argv[2];
var fileNameRegex = /[^/]+$/;
var fileName = fileToSend.match(fileNameRegex)[0];
var authentication = process.argv[3];


//-------------------
//*************Broadcast intent and location   (UDP datagram socket)
//---------------

broadcaster.broadcast();






//----------
//************File Server**********************  (TCP Socket)
//-----------------------
var server = netModule.createServer(); 

//************Socket Connection handler
server.on('connection', function(socketConnection){
  
  //----------Config-------------------------------
  //Kill Socket after 5 seconds inactivity
  socketConnection.setTimeout(10000, function(){
    console.log('Socket Timeout');
    socketConnection.destroy();
    process.exit(1);
  });
  
  //Logs
  console.log('Server connected to client');
  socketConnection.write('You have connected to '+thisIP);
  socketConnection.on('close', function() {
    console.log('Server disconnected from client.');
    process.exit(0);
  });

  //--------------Authentication-------------------


  //-------Send File and Receive client messages--------
  socketConnection.on('data', function(data){
    console.log(data.toString());
    //Send File
    var readFile = fs.createReadStream(fileToSend);
    readFile.on('data', function(chunk){
      socketConnection.write(chunk);
    });
    readFile.on('end', function(){
      console.log('File Sent');
      socketConnection.end();
      socketConnection.destroy();
      process.exit(0);
    });    
  });

});

  //----------------Start Server
  server.listen(PORT, thisIP, function(){
    console.log('Initiating server. Listening on PORT: '+PORT+' at address: '+ thisIP)
  }); 


