var path = require('path');
var appDir = path.dirname(require.main.filename);
var querystring = require('querystring');
var request = require('request');

var sDataParse = require(appDir + '/SDataLib/SDataParse');
var soap = require('soap');
var soapWSDL = "http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx?wsdl";
var parser = require('xml2json');
var xmldoc = require('xmldoc');

exports.index = function(req, res) {
	function encodeXMLField(s) { // TODO: should be moved to a utility class
		return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); // TODO: find out if escaping double quote is necessary or not
	}
	var sqlStatement = 'SELECT OrderNumber,CustomerID,LastName,FirstName,Email,Phone,OrderTotal FROM dbo.Orders WHERE THUB_POSTED_DATE IS NULL'
	var url = 'http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx';
	var body = '<?xml version=\'1.0\' encoding=\'UTF-8\'?><s12:Envelope xmlns:s12="http://www.w3.org/2003/05/soap-envelope"><s12:Body><ns1:DoItUsernamePwd xmlns:ns1="http://www.aspdotnetstorefront.com/"><ns1:AuthenticationEMail>admin@aspdotnetstorefront.com</ns1:AuthenticationEMail><ns1:AuthenticationPassword>Admin$14</ns1:AuthenticationPassword><ns1:XmlInputRequestString>' + encodeXMLField('<AspDotNetStorefrontImport Version="7.1" SetImportFlag="true" AutoLazyAdd="true" AutoCleanup="true" Verbose="false" TransactionsEnabled="true"><Query Name="Orders" RowName="order"><SQL><![CDATA['+ sqlStatement +']]></SQL></Query></AspDotNetStorefrontImport>') + '</ns1:XmlInputRequestString></ns1:DoItUsernamePwd></s12:Body></s12:Envelope>';
	var soapAction = 'http://www.aspdotnetstorefront.com/DoItUsernamePwd';

	var headers = {
		'Content-Type': 'application/soap+xml',
		'SOAPAction': soapAction,
		'Content-Encoding': 'UTF-8',
		'Content-Length': body.length
	};

	request.post({ url: url, headers: headers, body: body }, function(e, r, b) {
		if (e || r.statusCode !== 200) { res.send(r.statusCode + "\n" + e); return; }
		// parseString(b, function (err, result) {
		//     res.send(result);
		// });

		var document = new xmldoc.XmlDocument(b);
		var bodyNode = document.childNamed('soap:Body');
		var resNode = bodyNode.firstChild;
		var resRawXml = resNode.valueWithPath("DoItUsernamePwdResult");

		var json = parser.toJson(resRawXml); //returns JSON string
		res.send(json);
	});
};
