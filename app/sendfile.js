#!/usr/bin/env node
var dgram = require('dgram');
var netModule = require('net');
var ip = require('ip');
var fs = require('fs');

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
var broadcastMessage = new Buffer(fileName.toString());
var broadcastInterval = 1000;
var broadcastLife = 15000;
var broadcastTTL = 40;

//Initiate Broadcast
var broadcaster = dgram.createSocket('udp4');
broadcaster.bind(PORT, function Broadcast(){

  //configure broadcast
  console.log('Initiating broadcast');
  broadcaster.setTTL(broadcastTTL);
  broadcaster.setBroadcast(1);
  
  //Begin broadcast interval
  var broadcastInterval = setInterval (sendBroadcast , broadcastInterval );
  
  
  //Listen for Response and kill broadcast if heard, begin file transfer
  broadcaster.on('message', function (msg, envelope){
    if (envelope.address !== thisIP && envelope.address !== '127.0.0.1'){
      console.log('Broadcast answered by: '+ envelope.address);
      killBroadcast();
    }
  });

  //Set timeout to stop listening after var broadcastLife
  var timeout = setTimeout(function(){
    console.log('Broadcast Unanswered' );
    killBroadcast();
    process.exit(1);
  }, broadcastLife);
  
  function sendBroadcast(){
    broadcaster.send( broadcastMessage, 0, broadcastMessage.length, PORT, '255.255.255.255',function(err, bytes){
      if (err) {console.log(err);};

    });
  };

  //kill broadcast
  function killBroadcast (){
    clearInterval(broadcastInterval);
    clearTimeout(timeout);
    broadcaster.close();
  };
});





//----------
//************File Server**********************  (TCP Socket)
//-----------------------
var server = netModule.createServer(); 

//************Socket Connection handler
server.on('connection', function(socketConnection){
  
  //----------Config-------------------------------
  //Kill Socket after 5 second inactivity
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


