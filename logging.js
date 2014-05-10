"use strict";

var winston = require('winston'),
    logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ 
          filename: 'wakeonlan-error.log', 
          json: false, 
          level: 'error' ,
          handleExceptions: true
        })
      ]
    });

exports.info = logger.info;
exports.error = logger.error;
