#!/usr/bin/env node
var netModule = require('net');  //for streaming socket
var dgram = require('dgram');   //for broadcast
var ip = require('ip');  //ip utility
var fs = require('fs');

var destination = __dirname;
var thisIP = ip.address();
var hostIP = 'localhost';//process.argv[2];
var PORT = 7657;
var antennaLife = 10000;

//-----------
//*************Receive broadcast from server   (udp datagram socket)
//----------------
var antennaSocket = dgram.createSocket('udp4');

//begin listening
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
    console.log('host address found: ', envelope );
    console.log('Receiving Broadcast from: ', hostIP);
    antennaSocket.close();
    clearTimeout(timeout);
    setTimeout(beginTransfer, 2000);
  });


  //stop listening after 10 seconds 
  var timeout = setTimeout(function(){
    killAntenna();
    process.exit(1);
  }, antennaLife);


  killAntenna = function (){
    console.log( 'No Broadcast detected.' );
    clearTimeout(timeout);
    process.exit(1);
  };


});


//-----------
//*************Connect to server, Initiate transfer
//----------------

function beginTransfer() {
  console.log('Client beginning transfer from: ', hostIP );

  var socketConnection = new netModule.Socket();

  socketConnection.connect(PORT, hostIP, function connected(){
    //----------Config and handshake-------------------------------
    //Kill Socket after 5 second inactivity
    socketConnection.setTimeout(5000, function(){
      console.log('Socket Timeout');
      socketConnection.destroy();
      process.exit(1);
    });

    socketConnection.write('Client at: '+thisIP+' confirms connection.');
    
    //--------------Authentication---------------------------


    //-----------Receive data and write to file in current directory-------------
    var writeStream = fs.createWriteStream(destination);
    socketConnection.on('data', function(chunk){
      // console.log( data.toString() );
      writeStream.write(chunk);
    });

  });
};