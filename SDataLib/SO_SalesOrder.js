'use strict'; //master

var _       = require('lodash'),
    path    = require('path'),
    appDir  = path.dirname(require.main.filename),
    SDParse = require(appDir + '/SDataLib/SDParse');

module.exports = {
  createSalesOrder:function(configObj,order,callback){
    callback(null,order);
  }
}
