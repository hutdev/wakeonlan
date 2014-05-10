"use strict";

var clipp = require('clipp'),
    client = require('dgram').createSocket('udp4'),
    logger = require('./logging'),
    address = require('clipp').get(['a','address']), 
    packet = 'FFFFFFFFFFFF';

function sendcallback(err){
  client.close();
  if (err){
    logger.error('Could not send WOL  packet', err);
    process.exit(3);
  }
  logger.info('WOL packet successfully sent');
}

function broadcastPacket(err){
  var msgbuf = new Buffer(packet, 'hex');
  if (err){
    logger.error('Could not initialize client socket', err);
    process.exit(2);
  }
  client.setBroadcast(true);
  client.send(msgbuf, 0, msgbuf.length, 9, '255.255.255.255', sendcallback); 
}

if (!address || !address.match(/^([A-Za-z\d]{2}[-:]){5}[A-Za-z\d]{2}$/)){
 logger.error('Please specify MAC address as parameter');
 process.exit(1);
}
address = address.replace(/[-:]/g,'');

for (var idx = 0; idx < 16; idx++)
  packet = packet + address;

client.bind(0, '0.0.0.0', broadcastPacket);
