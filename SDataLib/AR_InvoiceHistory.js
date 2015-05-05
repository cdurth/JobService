var _ = require('lodash');
var SDataLib = require('../SDataLib');
var ARInvHistoryTracking = require('../SDataLib/AR_InvoiceHistoryTracking');
var Q = require('q');

module.exports = {
	haveOrdersShippedQ: function (baseUrl, username, password, company, arrOrders, logObj) {
		var query = "AR_InvoiceHistoryHeader?where=UDF_SF_ORDER_NO eq '" + arrOrders.join("' or UDF_SF_ORDER_NO eq '") + "'";
		return SDataLib
			.GetParsedQ(baseUrl, username, password, company, query, logObj)
			.then(function(shippedOrders){
				var invoiceNumbers = shippedOrders.map(function(e){
					return e.InvoiceNo;
				});
				return ARInvHistoryTracking
					.getTrackingInfoQ(baseUrl, username, password, company, invoiceNumbers, logObj)
					.then(function(shippingInfo){
						// match any tracking info to orders
						shippedOrders.forEach(function(order){
							shippingInfo.forEach(function(shipping){
								if(order.InvoiceNo === shipping.InvoiceNo){
									order['tracking'] = shipping;
								}
							});
						});
					return shippedOrders;
					});
			});
	}
};