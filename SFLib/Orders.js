var path = require('path');
var SFLib = require('../SFLib');
var xml2json = require('xml2json');
var util = require('../util');
var _ = require('lodash');

module.exports = {
  getNewOrdersQ: function(url, username, password) {
    var headerQuery = 'SELECT OrderNumber,CustomerID,LastName,FirstName,Email,Phone,OrderTotal FROM dbo.Orders WHERE THUB_POSTED_DATE IS NULL';
    return SFLib
      .queryWithResultQ(url, username, password, headerQuery)
      .then(function (result) {
        parsedResult = JSON.parse(xml2json.toJson(result)); // parse xml to object

        // extract orders and order numbers
        orders = parsedResult.AspDotNetStorefrontImportResult.Query.order;
        if (orders.constructor !== Array) orders = [orders];
        orderNumbers = orders.map(function (e) { return e.ordernumber; });

        // create return value
        ret = {};
        ret.Timestamp = new Date();
        ret.RecordCount = orderNumbers.length;
        ret.Records = orders;

        // add lines to return value
        return module.exports
          .getOrderDetailsQ(url, username, password, orderNumbers)
          .then(function(orderDetails) {
            orderDetails.forEach(function (detail) {
              // parse out shipping details
              if (detail.ShippingDetail !== undefined) {
                // REMOVED PARSING FOR MYSTERIOUS CHARACTERS AT ENDS OF STRING
                addressJSON = JSON.parse(xml2json.toJson(util.decodeXML(detail.ShippingDetail)));
                detail.ShippingDetail = addressJSON.Detail.Address;
              }

              // find corresponding order header
              orderIndex = _.findIndex(orders, function(e) {
                return e.ordernumber === detail.OrderNumber;
              });

              // if corresponding header found, push current detail to header lines
              if (orderIndex >= 0) {
                if (orders[orderIndex].lines === undefined) orders[orderIndex].lines = [];
                orders[orderIndex].lines.push(detail);
              }
            });

            return ret;
          });
      });
  },

  getOrderDetailsQ: function(url, username, password, orderNumbers) {
    var detailsQuery = 'SELECT * FROM dbo.Orders_ShoppingCart WHERE OrderNumber IN (\''+ orderNumbers.join('\',\'') + '\')';
    return SFLib
      .queryWithResultQ(url, username, password, detailsQuery)
      .then(function (result) {
        parsedResult = JSON.parse(xml2json.toJson(result));

        details = parsedResult.AspDotNetStorefrontImportResult.Query.order;
        if (details.constructor !== Array) details = [details];

        return details;
      });
  }
};
