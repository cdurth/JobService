'use strict';

var path = require('path');
var appDir = path.dirname(require.main.filename);
var request=require('request');
var sDataParse=require(appDir + '/SDataLib/SDataParse');
var sDataReq = require(appDir + '/SDataLib/SDataRequest');
exports.index = function(req, res) {
  res.send('email test');
};

exports.checkEmail = function(req, res){
  sDataReq.createCustomer(req.params.email,function(callback){
    res.send(callback);
  });
};
