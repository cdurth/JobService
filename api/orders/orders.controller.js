var path = require('path');
var appDir = path.dirname(require.main.filename);
var request = require('request');
var fs = require('fs');

var sDataParse = require(appDir + '/SDataLib/SDataParse');
var SFLib = require(appDir + '/SFLib/SFLib');

exports.index = function(req, res) {
	var order_headers = 'SELECT OrderNumber,CustomerID,LastName,FirstName,Email,Phone,OrderTotal FROM dbo.Orders WHERE THUB_POSTED_DATE IS NULL'
	var url = 'http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx';
	var stop = 0;
	SFLib.query(order_headers,url, function(json){
		if (stop >= 1){ return }
		orders = JSON.parse(json);
		newOrders = orders["AspDotNetStorefrontImportResult"]["Query"]["order"];
		for(var order in newOrders){
			//console.log(newOrders[order].ordernumber);
			var order_details = "SELECT * FROM [ADNSFDemo].[dbo].[Orders_ShoppingCart] WHERE OrderNumber = '"+ newOrders[order].ordernumber +"'";
			SFLib.query(order_details,url, function(json2){
				details = JSON.parse(json2);
				newDetails = details["AspDotNetStorefrontImportResult"]["Query"]["order"];
				for(var detail in newDetails){
					console.log(newDetails[detail].ShippingDetail);
				}

				// fs.writeFile("xml.txt", json2, function(err) {
				//     if(err) {
				//         console.log(err);
				//     } else {
				//         console.log("The file was saved!");
				//     }
				// });


			});
		}
	});
};
