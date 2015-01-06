'use strict';

var path = require('path');
var appDir = path.dirname(require.main.filename);
var request=require('request');
var sDataParse=require(appDir + '/SDataLib/SDataParse');

module.exports = {
  validateCustomers:function(configObj,records,callback) {
    if (configObj.createCustomers) {
      var	query = "AR_Customer?where=EmailAddress eq '"+ emails.join("' or EmailAddress eq '") +"'";
      configObj["query"] = query;
      module.exports.createCustomer(configObj,records,callback){

      }
    }
  },
  createCustomer:function(configObj,records,callback){

    sDataReq.SDataGet(configObj,query,function(results){

      var custMatched = function(element){
        for(result in results){
          if(results[result].EMAILADDRESS === element.email){
            return false;
          }
        }
        return true;
      };

      // list of customers that need created
      var custsToCreate = records.filter(custMatched);
      res.send(custsToCreate);
      // count = 0
      // totalCallbacks = orders.RecordCount;
      // results = [];
      // myCallback = function(result){
      // 	console.log('callback');
      // 	count++;
      // 	results[count] = result;
      // 	if (count === totalCallbacks){
      // 		console.log(results);
      // 	}
      // }


    });
  },
  SDataPost:function(reqObj,callback){
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
  },
  SDataGet:function(getObj,query,callback){
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
} // end exports
