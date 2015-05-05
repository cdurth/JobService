var _ = require('lodash');
var SDataLib = require('../SDataLib');
var CIItem = require('../SDataLib/CI_Item');
var Q = require('q');
var cError = require('../error');
var countries = require('./countries');


module.exports = {
  createSalesOrderQ:function(baseUrl, username, password, company, orders, logObj){
    var busObj = 'SO_SalesOrderHeaderSPECIAL?include=SO_SalesOrderHeaderSPECIALSECOND';
    var arrOrderPromises = [];

    orders.forEach(function (order) {
      var itemArr = order.lines.map(function (e) {
        return e.OrderedProductSKU;
      });

      //details
      var shipping,orderNo;
      var payload =
        '<SO_SalesOrderHeaderSPECIAL sdata:uri="'+ baseUrl +'/'+ company +'/'+ 'SO_SalesOrderHeaderSPECIA' +'" xmlns="">';
          var lineCount = 0;
          order.lines.forEach(function(line){
          lineCount++;

            payload +=
            '<SO_SalesOrderHeaderSPECIALSECOND>' +
              '<ItemCode>'+ line.OrderedProductSKU +'</ItemCode>' +
              '<ItemType>1</ItemType>' +
              '<QuantityOrdered>'+ line.Quantity +'</QuantityOrdered>' +
            '</SO_SalesOrderHeaderSPECIALSECOND>';

            //Process shipping information for first item ONLY
            if (lineCount === 1) {
              orderNo = line.OrderNumber;
              shipping = module.exports.validateShippingAddress(line.ShippingDetail,logObj);
            }
          });
          
          payload +=
          // header
          '<ARDivisionNo>'+ order.ARDivisionNo +'</ARDivisionNo>' +
          '<CustomerNo>'+ order.CustomerNo +'</CustomerNo>' +
          '<UDF_SF_ORDER_NO>'+ orderNo + '</UDF_SF_ORDER_NO>';
          payload += shipping;
          payload += '</SO_SalesOrderHeaderSPECIAL>';

      var createOrderPromise = CIItem.validateItemsQ(baseUrl, username, password, company,itemArr, logObj)
      .fail(function(err){
        if(err instanceof Error){
          // internal error
          console.log(err);
        } else {
          // item error
          throw cError.InvalidItem(order.ordernumber,err, logObj);
        }
      })
      .then(function(){
        return SDataLib.PostQ(baseUrl, username, password, company, busObj, payload, logObj);
      });
      arrOrderPromises.push(createOrderPromise);
    });

    return Q
      .allSettled(arrOrderPromises)
      .then(function (results) {
        var successfulOrders = [];
        for(var i=0; i < results.length; i++){
          if(results[i].state === 'fulfilled'){
            successfulOrders.push(orders[i].ordernumber);
          }
        }
        return successfulOrders;
      });
  },
  validateShippingAddress:function(shippingDetail,logObj){
    //TODO: More validation and sanitization 
    var countryCode = countries.getCountryCode(shippingDetail.Country);
    var retObj;

    retObj = '<ShipToName>'+ shippingDetail.FirstName + ' '+ shippingDetail.LastName +'</ShipToName>' + '<ShipToAddress1>'+ shippingDetail.Address1 + '</ShipToAddress1>';

    if(!_.isEmpty(shippingDetail.Address2)){
       retObj += '<ShipToAddress2>'+ shippingDetail.Address2 +'</ShipToAddress2>';
    }
    if(!_.isEmpty(shippingDetail.Address3)){
      retObj += '<ShipToAddress3>'+ shippingDetail.Suite +'</ShipToAddress3>';
    }
    
    retObj += '<ShipToCity>'+ shippingDetail.City +'</ShipToCity>' +
              '<ShipToState>'+ shippingDetail.State +'</ShipToState>' +
              '<ShipToZipCode>'+ shippingDetail.Zip +'</ShipToZipCode>' +
              '<ShipToCountryCode>'+ countryCode +'</ShipToCountryCode>';

    return retObj;
  }
};