"use strict";

var sqlite = require('sqlite3'),
    logger = require('./logging'),
    db;

function openDatabase(callback){
  if(!db){
    db = new sqlite.Database('machines.db',function(oerr){
      if (oerr){
        logger.error("Could not open database ", oerr);
        callback(oerr);
      }
      db.exec(
        'CREATE TABLE IF NOT EXISTS address (mac CHARACTER(17), machine VARCHAR(50) PRIMARY KEY)',
        callback);
    });
  }
  else
    callback();
}

exports.close = function(callback){
//Closing the db currently leads to runtime errors.
/**  if (db)
    db.close(callback);*/
};

exports.address = function(name,a,b){
  var callback = typeof(a) === 'function' ? a : b;
  openDatabase(function(err){
    if (typeof(a) === 'function'){
      logger.info('Selecting mac for ' + name);
      db.get('SELECT mac FROM address WHERE machine = ?',[name],
        function(error,row){
          callback(error,row ? row.mac : row);
        });
    }
    else {
      logger.info('Saving mac ' + a + ' for ' + name);
      db.run('REPLACE INTO address(mac,machine) VALUES (?,?)',
        a,name,
        callback);
    }
  });
};

exports.list = function(callback){
  openDatabase(function(err){
    if (err)
      callback(err);
    else
      db.all('SELECT * FROM address',callback);
  });
};
