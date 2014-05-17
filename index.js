"use strict";

var clipp = require('clipp'),
    cli = clipp.parse(['save','s']),
    client = require('dgram').createSocket('udp4'),
    logger = require('./logging'),
    address = clipp.get(['a','address'],cli), 
    machine = clipp.get(['m','machine'],cli), 
    save = clipp.get(['s','save'],cli),
    packet = 'FFFFFFFFFFFF',
    db = require('./db');

function exit(signal){
  db.close();
  process.exit(signal);
}

function prepareClient(){
    address = address.replace(/[-:]/g,'');
    for (var idx = 0; idx < 16; idx++)
      packet = packet + address;

    client.bind(0, '0.0.0.0', broadcastPacket);
}

function sendcallback(err){
  client.close();
  if (err){
    logger.error('Could not send WOL  packet', err);
    exit(3);
  }
  logger.info('WOL packet successfully sent');
  exit(0);
}

function broadcastPacket(err){
  var msgbuf = new Buffer(packet, 'hex');
  if (err){
    logger.error('Could not initialize client socket', err);
    exit(2);
  }
  client.setBroadcast(true);
  client.send(msgbuf, 0, msgbuf.length, 9, '255.255.255.255', sendcallback); 
}

function checkAddress(exit){
  if (!address || !address.match(/^([A-Za-z\d]{2}[-:]){5}[A-Za-z\d]{2}$/)){
    if(exit){
       logger.error('Please specify MAC address as parameter');
       exit(1);
    }
    return false;
  }
  return true;
}

function checkMachine(){
  if (!machine){
   logger.error('Please specify machine as parameter');
   exit(1);
  }
}

if (save){
  checkAddress(true);
  checkMachine();
  db.address(machine,address,function(err){
    if(err){
      logger.error('Could not save address',err);
      exit(4);
    }
    else{
      logger.info('Saving successful');
      exit(0);
    }
  });
}
else{
  if(checkAddress()){
    prepareClient();
  }
  else {
    checkMachine();
    db.address(machine,function(err,mac){
      if (!err)
        if (mac){
          address = mac;
          prepareClient();
        }
        else{
          logger.error('MAC not found for ' + machine);
          exit(6);
        }
      else{
        logger.error('Could not load mac for ' + machine,ex);
        exit(5);
      }
    });
  }
}

