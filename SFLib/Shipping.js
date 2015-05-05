var SFLib = require('../SFLib');
var xml2json = require('xml2json');
var xmlDoc  = require('xmldoc');
var util = require('../util');
var _ = require('lodash');
var cError = require('../error');
var Q = require('q');

module.exports = {
  getUnShippedOrdersQ: function(url, username, password, logObj) {
    var sqlQuery = 'SELECT OrderNumber FROM dbo.Orders WHERE THUB_POSTED_DATE IS NOT null AND ShippedOn IS NULL';
    var unShippedQuery ='  <Query Name="Orders" RowName="order">' +
                        '    <SQL><![CDATA['+ sqlQuery +']]></SQL>' +
                        '  </Query>';

    return SFLib
      .queryWithResultQ(url, username, password, unShippedQuery, logObj)
      .then(function (result) {
        var parsedResult = JSON.parse(xml2json.toJson(result));
        var orders = parsedResult.AspDotNetStorefrontImportResult.Query.order.map(function(e){
          return e.ordernumber;
        });
        return orders;
      });
  },
  updateShippingDetailsQ: function(url,username, password, orders, logObj) {
    var queryStr,notes,shippedCarrier,trackingNumber,weight;
    console.log(orders);
    orders.forEach(function(order) {
      if(!order.tracking.Comment){
        notes = '';
      } else {
        notes = order.tracking.Comment;
      }
      if(!order.tracking.TrackingID) {
        trackingNumber = '';
      } else {
        trackingNumber = order.tracking.TrackingID;
      }
      if(!order.Weight) {
        weight = '';
      } else {
        weight = order.Weight;
      }
      
      var line = '<OrderManagement Action="MarkAsShipped" OrderNumber="'+ order.UDF_SF_ORDER_NO +'" Notes="'+ notes +'" ShippedCarrier="'+ order.ShipVia +'" TrackingNumber="'+ trackingNumber +'" Weight="'+ weight +'" />';
      queryStr += line;
    }); 
    console.log(queryStr);
    return SFLib
      .queryWithResultQ(url, username, password, queryStr, logObj)
      .then(function (result) {
        return result;
      });

  }
};