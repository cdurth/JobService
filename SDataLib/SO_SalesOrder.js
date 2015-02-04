var _ = require('lodash');
var SDataLib = require('../SDataLib');
var Q = require('q');


module.exports = {
  createSalesOrderQ:function(baseUrl, username, password, company, orders){
    var busObj = 'SO_SalesOrderHeaderSPECIAL?include=SO_SalesOrderHeaderSPECIALSECOND'
    var createOrderPromises = [];
    orders.forEach(function (order) {
      var payload =
        '<SO_SalesOrderHeaderSPECIAL sdata:uri="'+ baseUrl +'/'+ company +'/'+ 'SO_SalesOrderHeaderSPECIA'L +'" xmlns="">';
          order.lines.forEach(function(line){
            // TODO: item validation
            payload +=
            'SO_SalesOrderHeaderSPECIALSECOND>' +
              '<ItemCode>'+ line.OrderedProductSKU +'</ItemCode>' +
              '<ItemType>1</ItemType>' +
              '<QuantityOrdered>'+ line.Quantity +'</QuantityOrdered>' +
            '</SO_SalesOrderHeaderSPECIALSECOND>';
          });
          payload +=
          '<ARDivisionNo>'+ order.ARDivisionNo +'</ARDivisionNo>' +
          '<CustomerNo>'+ order.CustomerNo +'</CustomerNo>' +
        '</SO_SalesOrderHeaderSPECIAL>' +

      createOrderPromises.push(SDataLib.PostQ(baseUrl, username, password, company, busObj, payload));
    });

    return Q
      .allSettled(createOrderPromises)
      .then(function (results) {
        // error handling block, map result to createCustomers
        // TODO: create uniform return value for all customers, including the ones that were
        // filtered out, so user knows which customers were not created
        return results;
      })
  }
}
