var path = require('path');
var appDir = path.dirname(require.main.filename);
var request = require('request');
var fs = require('fs');

var sDataParse = require(appDir + '/SDataLib/SDataParse');
var SFLib = require(appDir + '/SFLib/SFLib');

exports.index = function(req, res) {
	var order_headers = 'SELECT OrderNumber,CustomerID,LastName,FirstName,Email,Phone,OrderTotal FROM dbo.Orders WHERE THUB_POSTED_DATE IS NULL'
	var url = 'http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx';
	var count = 0;
	// query to get all new orders
	SFLib.query(order_headers,url, function(json){
		orders = JSON.parse(json);
		newOrders = orders["AspDotNetStorefrontImportResult"]["Query"]["order"];
		for(var order in newOrders){
			//console.log(newOrders[order].ordernumber);
			var order_details = "SELECT * FROM [ADNSFDemo].[dbo].[Orders_ShoppingCart] WHERE OrderNumber = '"+ newOrders[order].ordernumber +"'";
			// query to get details of new orders
			SFLib.query(order_details,url, function(json2){
				details = JSON.parse(json2);
				newDetails = details["AspDotNetStorefrontImportResult"]["Query"]["order"];
				for(var detail in newDetails){
					if(newDetails[detail].ShippingDetail !== undefined){
						rawAddress = newDetails[detail].ShippingDetail;
						// call to parse address xml into json object
						SFLib.parseAddress(rawAddress, function(json3){
							//console.log(newOrders[order]);
							newOrders[detail]['shipping'] = json3;

							//console.log(json3);
						});
					}

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
