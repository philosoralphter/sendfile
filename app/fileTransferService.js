module.exports.FileSender = FileSender;
module.exports.FileReceiver = FileReceiver;

var netModule = require('net');
var fs = require('fs');

var constants = require('./constants');


function FileReceiver(){

}


//----------
//************File Sender**********************  (TCP Socket)
//-----------------------
function FileSender(){

  this.transferFile = function(callback, fileToSend, thisIP, destinationIP){    
    
    var server = netModule.createServer();
    var socket;

    //-------------Configure Socket Server
    server.on('connection', function(socketConnection){
      socket = socketConnection;
      //check client ip against expected destinationIP
      //vetClientIP();

      //configure socket (sends file on 'data')
      configureSocket();
    });

    //----------------Start Server
    server.listen(constants.PORT, thisIP, function(){
      console.log('Initiating server. Listening on PORT: '+ constants.PORT +' at address: '+ thisIP)
    }); 


    //-----------------Helper functions
    function configureSocket(){
      //Kill Socket after 10 seconds inactivity
      socket.setTimeout(constants.SOCKET_TTL, function(){
        console.log('Socket Timeout');
        socketConnection.destroy();
        process.exit(1);
      });

      //Log disconnections
      socket.on('close', function() {
        console.log('Server disconnected from client.');
        process.exit(0);
      });

      //Receive client messages on 'data' events
      socket.on('data', function(chunk){
        console.log(chunk.toString());
      });
      //begin sending file after first data event
      socket.once('data', sendFile);    
    }

    function vetClientIP(){
      if (socket.remoteAddress !== destinationIP){
        console.log('Wrong client connected to socket.  Expected connection from: ' 
                    + destinationIP + ' but connection made by: ' 
                    + socket.remoteAddress);
        process.exit(2);
      }else{
        console.log('You have connected to client at: ' + socket.remoteAddress);
      //socket.write('You have connected to '+thisIP);
      }
    }

    function sendFile(){  
      var readFile = fs.createReadStream(fileToSend);
      
      readFile.on('data', function(chunk){
        socket.write(chunk);
      });
      
      readFile.on('end', function(){
        console.log('File Sent');
        socket.end();
        socket.destroy();
        process.exit(0);
      });
    }
  }
}