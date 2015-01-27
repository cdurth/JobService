'use strict'; //master

var _       = require('lodash'),
    path    = require('path'),
    appDir  = path.dirname(require.main.filename),
    SDParse = require(appDir + '/SDataLib/SDParse');

module.exports = {
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
      module.exports.createCustomer(configObj,emails,records,function(err,custs){
        module.exports.matchCustomers(configObj,emails,records,function(err,res){
          callback(null,res);
        });
      });
    }
  },
  matchCustomers:function(configObj,emails,records,callback){
    SDParse.Get(configObj,function(err,results){
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
      callback(null,records);
    });
  },
  createCustomer:function(configObj,emails,records,callback){
    SDParse.Get(configObj,function(err,results){
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
        callback(null,null);
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

      var busObj = "AR_Customer";
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
        SDParse.Post(configObj,myCallback);
      }
    });
  }
}
