#!/usr/bin/env node
var dgram = require('dgram');
var netModule = require('net');
var ip = require('ip');

var thisIP = ip.address();
var PORT = 7657;
var broadcastTTL = 2;

//Parse arguments
var fileToSend = process.argv[2];
var authentication = process.argv[3];


//-------------------
//*************Broadcast intent and location   (udp datagram socket)
//---------------
var broadcaster = dgram.createSocket('udp4');
var broadcastMessage = new Buffer('Server: broadcasting.');
var broadcastInterval = 1000;
var broadcastLife = 10000;
var broadcastTTL = 5;

//Initiate Broadcast
broadcaster.bind(PORT, function Broadcast(){
  //configure broadcast
  broadcaster.setTTL(broadcastTTL);
  broadcaster.setBroadcast(1);
  console.log('initiating broadcast ');
  
  var sendBroadcast = function (){
    broadcaster.send( broadcastMessage, 0, broadcastMessage.length, PORT, '',function(err, bytes){
      if (err) {console.log(err);};
      console.log('broadcasting ');
    });
  };
  var broadcastInterval = setInterval (sendBroadcast , broadcastInterval );
  
  //Listen for Response and kill broadcast if heard, begin file transfer
  broadcaster.on('message', function (msg, envelope){
    if (envelope.address !== thisIP){
      console.log('Broadcast answered by: '+ envelope.address);
      killBroadcast();
    }
  });


  var timeout = setTimeout(function(){
    console.log('Broadcast Unaswered' );
    killBroadcast();
    process.exit(1);
  }, broadcastLife);
  
  //kill broadcast
  killBroadcast = function (){
    clearInterval(broadcastInterval);
    clearTimeout(timeout);
    broadcaster.close();
  };
});





//----------
//************File Server**********************
//-----------------------
var server = netModule.createServer();

//************Socket Connection handler
server.on('connection', function(socketConnection){
  //----------Config and handshake-------------------------------
  //Kill Socket after 5 second inactivity
  socketConnection.setTimeout(5000, function(){
    console.log('Socket Timeout');
    socketConnection.destroy();
    process.exit(1);
  });
  
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


//----------------Start Server
server.listen(PORT, thisIP, function(){
  console.log('Iitiating server. Listening on PORT: '+PORT+' at address: '+ thisIP)
});

