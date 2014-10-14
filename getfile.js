#!/usr/bin/env node
var netModule = require('net');  //for streaming socket
var dgram = require('dgram');   //for broadcast
var ip = require('ip');  //ip utility

var destination = __dirname;
var thisIP = ip.address();
var hostIP = 'localhost';//process.argv[2];
var PORT = 7657;
var antennaLife = 10000;

//*************Receive broadcast from server   (udp datagram socket)
var antennaSocket = dgram.createSocket('udp4');

//begin listening
antennaSocket.bind(PORT, function listening (){
  console.log('Listening for host Broadcast...');

  //Configure antenna
  antennaSocket.on('error', function(err){
    console.log('Failed to bind to broadcast socket');
    antennaSocket.close();
    throw err;
  });

  antennaSocket.on('message', function (msg, envelope){
    hostIP = envelope.address();
    console.log('Receiving Broadcast from: ', hostIP);
    beginTransfer();
  });

  //stop listening after 10 seconds
  var killBroadcast = function (){
    clearInterval(broadcastInterval);
    console.log('Broadcast Unaswered:' );
    process.exit(1);
  };

  setTimeout(killBroadcast, antennaLife);

});



function beginTransfer() {

  var socketConnection = new netModule.Socket();

  socketConnection.connect(PORT, hostIP, function connected(){
    //----------Config and handshake-------------------------------
    //Kill Socket after 5 second inactivity
    //socketConnection.timeout(5000, function(){socketConnection.destroy();});
    socketConnection.write('Client at: '+thisIP+' confirms connection.');
    console.log(socketConnection.localAddress);
    
    //--------------Authentication---------------------------


    //-----------Receive data and write to file in current directory-------------
    socketConnection.on('data', function(data){
      console.log( data.toString() );
    });

  });
};