#!/usr/bin/env node
var dgram = require('dgram');
var netModule = require('net');
var ip = require('ip');

var thisIP = 'localhost';//ip.address();
var PORT = 7657;
var broadcastTTL = 2;

//Parse arguments
var fileToSend = process.argv[2];
var authentication = process.argv[3];

//debug
console.log('Server ip: ', ip.address() );
console.log('local ip: ', thisIP );


//*************Broadcast intent and location   (udp datagram socket)
var broadcaster = dgram.createSocket('udp4');
var broadcastMessage = new Buffer('CLIENT: receiving.');
var broadcastInterval = 500;
var broadcastLife = 10000;
var broadcastTTL = 3;

broadcaster.bind(PORT, function Broadcast(){
  //Initiate Broadcast
  var broadcastInterval = setInterval ( function (){
    broadcaster.send(broadcastMessage, 0, broadcastMessage.length, PORT, function(){});}, 
    broadcastInterval );
  //configure broadcast
  broadcaster.setTTL(broadcastTTL);
  broadcaster.setBroadcast(1);
  
  //Listen for Response and kill broadcast if heard, begin file transfer
  broadcaster.on('message', function(){
    stopBroadcast();
    beginTransfer();
  });

  //kill broadcast
  var killBroadcast = function (){
    clearInterval(broadcastInterval);
    console.log('Broadcast Unaswered:' );
    process.exit(1);
  };

  setTimeout(killBroadcast, broadcastLife);

});





function beginTransfer(){

  //************File Server
  //-----------------------
  var server = netModule.createServer();

  //************Socket handler
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

    //--------------Authentication-------------------


    //-------Receive client messages--------
    socketConnection.on('data', function(data){
      console.log(data.toString());
    });

  });


  //*******************Start Server
  server.listen(PORT, thisIP, function(){
    console.log('Server initiated socket. Listening on PORT: '+PORT+' at address: '+ thisIP)
  });

}




