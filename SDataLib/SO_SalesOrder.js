var _ = require('lodash');
var SDataLib = require('../SDataLib');
var CIItem = require('../SDataLib/CI_Item');
var Q = require('q');
var cError = require('../error');


module.exports = {
  createSalesOrderQ:function(baseUrl, username, password, company, orders){
    var busObj = 'SO_SalesOrderHeaderSPECIAL?include=SO_SalesOrderHeaderSPECIALSECOND';
    var arrOrderPromises = [];

    orders.forEach(function (order) {
      var itemArr = order.lines.map(function (e) {
        return e.OrderedProductSKU;
      });
      //TODO: map more fields + shipping
      var payload =
        '<SO_SalesOrderHeaderSPECIAL sdata:uri="'+ baseUrl +'/'+ company +'/'+ 'SO_SalesOrderHeaderSPECIA' +'" xmlns="">';
          order.lines.forEach(function(line){
            payload +=
            '<SO_SalesOrderHeaderSPECIALSECOND>' +
              '<ItemCode>'+ line.OrderedProductSKU +'</ItemCode>' +
              '<ItemType>1</ItemType>' +
              '<QuantityOrdered>'+ line.Quantity +'</QuantityOrdered>' +
            '</SO_SalesOrderHeaderSPECIALSECOND>';
          });
          payload +=
          '<ARDivisionNo>'+ order.ARDivisionNo +'</ARDivisionNo>' +
          '<CustomerNo>'+ order.CustomerNo +'</CustomerNo>' +
        '</SO_SalesOrderHeaderSPECIAL>';

      var createOrderPromise = CIItem.validateItemsQ(baseUrl, username, password, company,itemArr)
      .fail(function(err){
        if(err instanceof Error){
          // internal error
          console.log(err);
        } else {
          // item error
          throw cError.InvalidItem(order.ordernumber,err);
        }
      })
      .then(function(){
        return SDataLib.PostQ(baseUrl, username, password, company, busObj, payload);
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
        console.log(successfulOrders);

        return successfulOrders;
      });
  }
};
