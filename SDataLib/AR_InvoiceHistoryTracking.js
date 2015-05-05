var _ = require('lodash');
var SDataLib = require('../SDataLib');
var Q = require('q');

module.exports = {
	getTrackingInfoQ: function (baseUrl, username, password, company, arrOrders, logObj) {
		var query = "AR_InvoiceHistoryTracking?where=InvoiceNo eq '" + arrOrders.join("' or InvoiceNo eq '") + "'";
		return SDataLib
			.GetParsedQ(baseUrl, username, password, company, query, logObj);
	}
};