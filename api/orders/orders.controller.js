var path = require('path'),
		appDir = path.dirname(require.main.filename),
		request = require('request'),
		fs = require('fs');

// api libs
var SFLib 	= require(appDir + '/SFLib/SFLib'),
		SDParse = require(appDir +'/SdataLib/SDParse');

// storefront libs
var SF_Orders = require(appDir + 'SFLib/Orders');

// sage libs
var AR_Customer 	= require(appDir + '/SDataLib/AR_Customer'),
		SO_SalesOrder = require(appDir + '/SDataLib/SO_SalesOrder');

module.exports = {
	process:function(req,res){
		SF_Orders.getNewOrders(function(err,orders){
			configObj = req.body.sdata;
			records = orders["Records"];
			AR_Customer.validateCustomers(configObj,records,function(err,orders){
				// at this point, customers have been created & customerNo inserted
				var count = 0;
				var totalCallbacks = orders.length;
				var results = [];
				var myCallback = function(err,result){
					count++;
					results[count] = result;
					if (count === totalCallbacks){
						res.send(results);
					}
				};

				for(var i = 0; i < orders.length; i++){
					SO_SalesOrder.createSalesOrder(configObj,orders[i],myCallback);
				}
			});
		});
	},
}
