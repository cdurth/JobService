var path = require('path');
var appDir = path.dirname(require.main.filename);
var request = require('request');
var fs = require('fs');

var sDataParse = require(appDir + '/SDataLib/SDataParse');
var sDataReq = require(appDir + '/SDataLib/SDataRequest');
var SFLib = require(appDir + '/SFLib/SFLib');

module.exports = {
	process:function(req,res){
		module.exports.index(req,res,function(orders){
			configObj = req.body.sdata;
			records = orders["Records"];
			sDataReq.validateCustomers(configObj,records,function(callback){
				// at this point, customers have been created & customerNo inserted
				res.send(callback);
			});
		});
	},
	index:function(req,res,callback){
		finalObj = {};
		finalObj["Timestamp"] = new Date();
		importCount = 0;
		var order_headers = 'SELECT OrderNumber,CustomerID,LastName,FirstName,Email,Phone,OrderTotal FROM dbo.Orders WHERE THUB_POSTED_DATE IS NULL'
		var url = 'http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx';
		var orderNumbers = [];
		// query to get all new orders
		SFLib.query(order_headers,url, function(ordersJSON){
			tmpOrders = JSON.parse(ordersJSON);
			orders = tmpOrders["AspDotNetStorefrontImportResult"]["Query"]["order"];

			if (orders.constructor !== Array) {
				orders = [orders];
			}

			for(var order in orders){
					orderNumbers.push(orders[order].ordernumber);
			}
			finalObj["RecordCount"] = orderNumbers.length;
			// query to get all order details
			var order_details = "SELECT * FROM dbo.Orders_ShoppingCart WHERE OrderNumber IN ('"+ orderNumbers.join("','") +"')";
			SFLib.query(order_details,url, function(detailsJSON){
				tmpDetails = JSON.parse(detailsJSON);
				details = tmpDetails["AspDotNetStorefrontImportResult"]["Query"]["order"];

				if (details.constructor !== Array) {
					details = [details];
				}
				order = 0;
				// build new orders object
				for(var order in orders){
						importCount++;
						orders[order]["ImportNo"] = importCount;
						orders[order]["lines"] = [];
						for(var detail in details){
							if (details[detail].OrderNumber === orders[order].ordernumber ) {
								if(details[detail].ShippingDetail !== undefined){
									rawAddress = details[detail].ShippingDetail;
									// parse shipping data
									SFLib.parseAddress(rawAddress, function(addressJSON){
										tmpAddress = JSON.parse(addressJSON);
										address = tmpAddress["Detail"]["Address"];
										details[detail].ShippingDetail = address;
										orders[order].lines.push(details[detail]);
									});
								} else {
									orders[order].lines.push(details[detail]);
								}

							}
						}
				}
				finalObj["Records"] = orders;
				callback(finalObj);
			});
		});
	}
}
