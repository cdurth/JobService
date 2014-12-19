'use strict';

var path = require('path');
var appDir = path.dirname(require.main.filename);
var request=require('request');
var sDataParse=require(appDir + '/SDataLib/SDataParse');

exports.index = function(req, res) {
  res.send('email test');
};

exports.query = function(req, res) {
  var sdPasreStream=sDataParse();
  sdPasreStream.on('data',function(sDataObj){
    console.log(sDataObj);
  });
  sdPasreStream.on('end',function(){
    console.log('sDataParseEnd')
  });
  var r=request({url:"http://66.161.168.57/Sdata/MasApp/MasContract/ABC/"+ req.params.table +"?where="+ req.params.field +" "+ req.params.operator+" '"+ req.params.value +"'"
  ,auth:{user:'SdataUser',pass:'password'}
  ,rejectUnauthorized: false});
  r.on('response', function (resp) {
    //resp.headers
    //resp.statusCode
    console.log('Response Code:'+resp.statusCode);
    if(resp.statusCode==200){
      r.pipe(sdPasreStream);
    }
  });
};

exports.checkEmail = function(req, res){
  var sdPasreStream=sDataParse();
  sdPasreStream.on('data',function(sDataObj){
    console.log(sDataObj);
  });
  sdPasreStream.on('end',function(){
    console.log('sDataParseEnd')
  });
  var r=request({url:"http://66.161.168.57/Sdata/MasApp/MasContract/ABC/AR_Customer?where=EmailAddress eq '"+ req.params.email +"'"
  ,auth:{user:'SdataUser',pass:'password'}
  ,rejectUnauthorized: false});
  r.on('response', function (resp) {
    //resp.headers
    //resp.statusCode
    console.log('Response Code:'+resp.statusCode);
    if(resp.statusCode==200){
      r.pipe(sdPasreStream);
    }
  });
};
