var SFLib = require('../SFLib');
var xml2json = require('xml2json');
var xmlDoc  = require('xmldoc');
var util = require('../util');
var _ = require('lodash');
var cError = require('../error');

module.exports = {
  getNewOrdersQ: function(url, username, password, logObj) {
    var sqlQuery = 'SELECT OrderNumber,CustomerID,LastName,FirstName,Email,Phone,OrderTotal FROM dbo.Orders WHERE THUB_POSTED_DATE IS NULL';
    var headerQuery = '  <Query Name="Orders" RowName="order">' +
                       '    <SQL><![CDATA['+ sqlQuery +']]></SQL>' +
                       '  </Query>';
    return SFLib
      .queryWithResultQ(url, username, password, headerQuery, logObj)
      .then(function (result) {
        var parsedResult = JSON.parse(xml2json.toJson(result)); // parse xml to object

        // extract orders and order numbers
        var orders = parsedResult.AspDotNetStorefrontImportResult.Query.order;
        if (orders.constructor !== Array) orders = [orders];
        var orderNumbers = orders.map(function (e) { return e.ordernumber; });

        // create return value
        var ret = {};
        ret.Timestamp = new Date();
        ret.RecordCount = orderNumbers.length;
        ret.Records = orders;

        // add lines to return value
        return module.exports
          .getOrderDetailsQ(url, username, password, orderNumbers, logObj)
          .then(function(orderDetails) {
            orderDetails.forEach(function (detail) {
              // parse out shipping details
              if (detail.ShippingDetail !== undefined) {
                // REMOVED PARSING FOR MYSTERIOUS CHARACTERS AT ENDS OF STRING
                var addressJSON = JSON.parse(xml2json.toJson(util.decodeXML(detail.ShippingDetail)));
                detail.ShippingDetail = addressJSON.Detail.Address;
              }

              // find corresponding order header
              var orderIndex = _.findIndex(orders, function(e) {
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

  getOrderDetailsQ: function(url, username, password, orderNumbers, logObj) {
    var sqlQuery = 'SELECT * FROM dbo.Orders_ShoppingCart WHERE OrderNumber IN (\''+ orderNumbers.join('\',\'') + '\')';
    var detailsQuery = '  <Query Name="Orders" RowName="order">' +
                       '    <SQL><![CDATA['+ sqlQuery +']]></SQL>' +
                       '  </Query>';
    return SFLib
      .queryWithResultQ(url, username, password, detailsQuery, logObj)
      .then(function (result) {
        var parsedResult = JSON.parse(xml2json.toJson(result));

        var details = parsedResult.AspDotNetStorefrontImportResult.Query.order;
        if (details.constructor !== Array) details = [details];

        return details;
      });
  },

  updateOrdersCreatedQ: function(url,username, password, orderNumbers, logObj) {
    console.log('update');
    var date = new Date()
      .toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, '') ;
    var sqlQuery = 'UPDATE dbo.Orders SET THUB_POSTED_DATE = \''+ date +'\'  WHERE OrderNumber IN (\''+ orderNumbers.join('\',\'') + '\')';
    var updateQuery = '  <Query Name="Orders" RowName="order">' +
                      '    <SQL><![CDATA['+ sqlQuery +']]></SQL>' +
                      '  </Query>';

    return SFLib
      .queryWithResultQ(url, username, password, updateQuery, logObj)
      .then(function (result) {
        var resObj = new xmlDoc.XmlDocument(result);
        if (resObj.childNamed("Query").childNamed("Error").attr.Message !== null) {
          throw cError.SFUpdateOrders(orderNumbers,resObj.childNamed("Query").childNamed("Error").attr.Message,updateQuery, logObj);
        }
        return result;
      });

  }
};
