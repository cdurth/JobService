'use strict';

var path = require('path');
var appDir = path.dirname(require.main.filename);
var request=require('request');
var sDataParse=require(appDir + '/SDataLib/SDataParse');

module.exports.validateEmail = function(emails,callback) {

}
module.exports.createCustomer = function(custDetails,callback){

  var url = "http://66.161.168.57/Sdata/MasApp/MasContract/ABC/AR_Customer";

  // TODO: Mapping
  var body = '<entry xmlns:atom="http://www.w3.org/2005/Atom" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:cf="http://www.microsoft.com/schemas/rss/core/2005" xmlns="http://www.w3.org/2005/Atom" xmlns:sdata="http://schemas.sage.com/sdata/2008/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/" xmlns:sync="http://schemas.sage.com/sdata/sync/2008/1" xmlns:sme="http://schemas.sage.com/sdata/sme/2007" xmlns:http="http://schemas.sage.com/sdata/http/2008/1"><sdata:payload><AR_Customer sdata:uri="/sdata/MasApp/MasContract/ABC/AR_Customer" xmlns="">';
      body+= '<ARDivisionNo>01</ARDivisionNo>';
      body+= '<SalespersonDivisionNo>01</SalespersonDivisionNo>';
      body+= '<SalespersonNo>0100</SalespersonNo>';
      body+= '</AR_Customer></sdata:payload></entry>';

  var auth = {
    'user':'SdataUser',
    'pass':'password'
  };
}

module.exports.SDataPost = function(reqObj,callback){
  var headers = {
    'Content-Type': 'application/atom+xml;type=entry',
  };
  var returnObj = {};
  var returnArray = [];
  var sdPasreStream=sDataParse();

  sdPasreStream.on('data',function(sDataObj){
    returnArray.push(sDataObj);
  });

  sdPasreStream.on('end',function(){
    returnObj = returnArray;
    callback(returnObj);
  });

  var r = request.post({
    url:reqObj.url,
    headers:headers,
    body:reqObj.body,
    auth:reqObj.auth,
    rejectUnauthorized: false
  });

  r.on('response', function (resp) {
    if(resp.statusCode==200){
      r.pipe(sdPasreStream);
    }
  });
}

module.exports.SDataGet = function(getObj,query,callback){
  var returnObj = {};
  var returnArray = [];
  var sdPasreStream=sDataParse();
  var url = getObj.url +'/'+ getObj.company +'/'+ query;

  sdPasreStream.on('data',function(sDataObj){
    returnArray.push(sDataObj);
  });

  sdPasreStream.on('end',function(){
    returnObj = returnArray;
    callback(returnObj);
  });

  var r = request({
      url:url,
      auth:getObj.auth,
      rejectUnauthorized: false
  });

  r.on('response', function (resp) {
    if(resp.statusCode==200){
      r.pipe(sdPasreStream);
    }
  });
}
