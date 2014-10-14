#!/usr/bin/env node
var dgram = require('dgram');
var netModule = require('net');
var ip = require('ip');
var fs = require('fs');

var thisIP = ip.address();
var PORT = 7657;

//Parse arguments
var fileToSend = process.argv[2];
var authentication = process.argv[3];


//-------------------
//*************Broadcast intent and location   (udp datagram socket)
//---------------
var broadcaster = dgram.createSocket('udp4');
var broadcastMessage = new Buffer(fileToSend.toString());
var broadcastInterval = 1000;
var broadcastLife = 10000;
var broadcastTTL = 40;

//Initiate Broadcast
broadcaster.bind(PORT, function Broadcast(){

  //configure broadcast
  console.log('Initiating broadcast');
  broadcaster.setTTL(broadcastTTL);
  broadcaster.setBroadcast(1);
  
  var sendBroadcast = function (){
    broadcaster.send( broadcastMessage, 0, broadcastMessage.length, PORT, '255.255.255.255',function(err, bytes){
      if (err) {console.log(err);};

    });
  };
  var broadcastInterval = setInterval (sendBroadcast , broadcastInterval );
  
  //Listen for Response and kill broadcast if heard, begin file transfer
  broadcaster.on('message', function (msg, envelope){
    if (envelope.address !== thisIP && envelope.address !== '127.0.0.1'){
      console.log('Broadcast answered by: '+ envelope.address);
      killBroadcast();
    }
  });


  var timeout = setTimeout(function(){
    console.log('Broadcast Unanswered' );
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
  
  //----------Config-------------------------------
  //Kill Socket after 5 second inactivity
  socketConnection.setTimeout(5000, function(){
    console.log('Socket Timeout');
    socketConnection.destroy();
    process.exit(1);
  });
  
  //Logs
  console.log('Server connected to client');
  socketConnection.write('You have connected to '+thisIP);
  socketConnection.on('end', function() {
    console.log('Server disconnected from client.');
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
    readFile.on('finish', function(){
      Console.log('File Sent');
      socketConnection.end();
      socketConnection.destroy();
    });    
  });

});


//----------------Start Server
server.listen(PORT, thisIP, function(){
  console.log('Initiating server. Listening on PORT: '+PORT+' at address: '+ thisIP)
});

