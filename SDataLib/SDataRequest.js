'use strict';

var _ = require('lodash');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var request=require('request');
var sDataParse=require(appDir + '/SDataLib/SDataParse');

module.exports = {
  createSalesOrder:function(configObj,order,callback){
    callback(order);
  },
  validateCustomers:function(configObj,records,callback) {
    var emails = [];
    // build email array for checking existing customers
    emails = records.map(function(arg){
      return arg.email
    }).filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    });

    // if createCustomer option, begin routine
    if (configObj.createCustomers) {
      var	query = "AR_Customer?where=EmailAddress eq '"+ emails.join("' or EmailAddress eq '") +"'";
      configObj["query"] = query;
      module.exports.createCustomer(configObj,emails,records,function(custs){
        module.exports.matchCustomers(configObj,emails,records,function(res){
          callback(res);
        });
      });
    }
  },
  matchCustomers:function(configObj,emails,records,callback){
    module.exports.SDataGet(configObj,function(results){
      var custMatched = function(order){
        for(var i = 0; i < results.length; i++){
          if(results[i].EMAILADDRESS === order.email){
            // adds customer number to object if found
             order["customerNo"] = results[i].CUSTOMERNO;
          }
        }

      };
      for (var i = 0; i < records.length; i++){
        custMatched(records[i]);
      }
      callback(records);
    });
  },
  createCustomer:function(configObj,emails,records,callback){
    module.exports.SDataGet(configObj,function(results){
      // filters out existing customers & inserts customerNo
      var custMatched = function(element){
        for(var i = 0; i < results.length; i++){
          if(results[i].EMAILADDRESS === element.email){
            return false;
          }
        }
        return true;
      };

      var custsToCreate = records.filter(custMatched);

      if (_.isEmpty(custsToCreate)){
        // createCust option enabled, but no new customers to create, return
        callback(null);
      }

      // recalculate emails to build index
      emails = custsToCreate.map(function(arg){
        return arg.email
      });
      // filter out duplicate records
      custsToCreate = custsToCreate.filter(function(item, pos) {
          if(emails.indexOf(item.email) == pos){
            return true;
          }
        return false;
      });

      var busObj = "COREY";
      configObj["busObj"] = busObj;
      var count = 0;
      var totalCallbacks = custsToCreate.length;
      var results = [];
      var myCallback = function(err,result){
        if(err){
          //do stuff with error
        }
      	count++;
      	results[count] = result;
      	if (count === totalCallbacks){
          callback(null,results);
      	}
      };

      for(var i = 0; i < custsToCreate.length; i++){
        if(_.isEmpty(custsToCreate[i].firstname)){
          custsToCreate[i].firstname = "";
        }
        if (_.isEmpty(custsToCreate[i].lastname)){
          custsToCreate[i].lastname = "";
        }
        var payload = '<ARDivisionNo>01</ARDivisionNo>';
            payload+= '<SalespersonDivisionNo>01</SalespersonDivisionNo>';
            payload+= '<SalespersonNo>0100</SalespersonNo>';
            payload+= '<CustomerName>'+ custsToCreate[i].firstname +' '+ custsToCreate[i].lastname +'</CustomerName>';
            payload+= '<EmailAddress>'+ custsToCreate[i].email +'</EmailAddress>';

        configObj["payload"] = payload;
        var test=configObj.url+'/'+configObj.company+'/'+configObj.query;
				module.exports.SDataPost(configObj,myCallback);
			}
    });
  },
  SDataPost:function(postObj,callback){
    var headers = {
      'Content-Type': 'application/atom+xml;type=entry',
    };
    var returnObj = {};
    var returnArray = [];
    var sdPasreStream=sDataParse();
    var url = postObj.url +'/'+ postObj.company +'/'+ postObj.busObj;

    sdPasreStream.on('data',function(sDataObj){
      returnArray.push(sDataObj);
    });

    sdPasreStream.on('end',function(){
      returnObj = returnArray;
      callback(null,returnObj);
    });

    var body = '<entry xmlns:sdata="http://schemas.sage.com/sdata/2008/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.w3.org/2005/Atom"><sdata:payload>';
        body+= '<'+ postObj.busObj +' sdata:uri="'+postObj.url+'/'+postObj.company+'/'+postObj.busObj+'" xmlns="">';
        body+= postObj.payload;
        body+= '</'+ postObj.busObj +'>';
        body+= '</sdata:payload></entry>';


    var r = request.post({
      url:url,
      headers:headers,
      body:body,
      auth:postObj.auth,
      rejectUnauthorized: false
    });

    r.on('response', function (resp) {
      if(resp.statusCode==200){
        r.pipe(sdPasreStream);
      } else {
        callback(new Error('Bad Stuff'),null);
      }
    });
  },
  SDataGet:function(getObj,callback){
    var returnObj = {};
    var returnArray = [];
    var sdPasreStream=sDataParse();
    var url = getObj.url +'/'+ getObj.company +'/'+ getObj.query;

    sdPasreStream.on('data',function(sDataObj){
      returnArray.push(sDataObj);
    });

    sdPasreStream.on('end',function(){
      returnObj = returnArray;
      //returns json objects
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
