module.exports.Broadcaster = Broadcaster;
module.exports.BroadcastListener = BroadcastListener;

var constants = require('./constants');

var broadcastMessage = new Buffer(fileName.toString());



//-------------------
//*************Broadcaster
//---------------

function Broadcaster(){
  
  //Initiate Broadcast
  this.initiateBroadcast = function (broadcastResponseHandler, broadcastMessage){
    var broadcaster = dgram.createSocket('udp4');
    broadcaster.bind(PORT, function initiateBroadcast(){

      //configure broadcast
      console.log('Initiating broadcast');
      broadcaster.setTTL(cosntants.BROADCAST_TTL);
      broadcaster.setBroadcast(1);
      
      //Begin broadcasting interval
      var broadcastingInterval = setInterval ( sendBroadcast, constants.BROADCAST_INTERVAL );
      
      
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
      }, constants.BROADCAST_LIFE);
      
      function sendBroadcast(){
        broadcaster.send( broadcastMessage, 0, broadcastMessage.length, PORT, '255.255.255.255', function(err, bytes){
          if (err) {console.log('Error broadcasting: ', err);};
        } );
      };

      //kill broadcast
      function killBroadcast (){
        clearInterval(broadcastingInterval);
        clearTimeout(timeout);
        broadcaster.close();
        //callback
        broadcastResponseHandler();
      };
    });
  }
}


//-----------
//*************Broadcast Listener
//----------------
function BroadcastListener(){
  //begin listening
  this.antennaSocket = dgram.createSocket('udp4');
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
}




