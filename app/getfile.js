#!/usr/bin/env node
var netModule = require('net');  //for streaming socket
var dgram = require('dgram');   //for broadcast
var ip = require('ip');  //ip utility
var fs = require('fs');

var thisIP = ip.address();
var hostIP = 'localhost';//process.argv[2];
var PORT = 7657;
var antennaLife = 15000;

var fileName;

//-----------
//*************Receive broadcast from server   (udp datagram socket)
//----------------

//begin listening
var antennaSocket = dgram.createSocket('udp4');
antennaSocket.bind(PORT, function listening (){

  console.log('Listening for host Broadcast...');

  //Configure antenna
  antennaSocket.on('error', function (err){
    console.log('Failed to bind to broadcast socket');
    antennaSocket.close();
    throw err;
  });

  antennaSocket.on('message', function (msg, envelope){
    hostIP = envelope.address;
    fileName = msg.toString();

    //send Response
    var response = new Buffer('Client Receiving');
    antennaSocket.send(response, 0, response.length, PORT, hostIP);

    console.log('Receiving Broadcast from: ', hostIP);
    antennaSocket.close();
    clearTimeout(timeout);

    console.log('Connecting to '+hostIP+' to get file:', fileName);
    setTimeout(beginTransfer, 2000);
  });

  //stop listening after 10 seconds 
  var timeout = setTimeout(function(){
    console.log( 'No Broadcast detected.' );
    killAntenna();
    process.exit(1);
  }, antennaLife);

  killAntenna = function (){
    clearTimeout(timeout);
    process.exit(1);
  };
});


//-----------
//*************Connect to server, Initiate transfer
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
    var writeStream = fs.createWriteStream(fileName);
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