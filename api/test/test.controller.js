var path = require('path');
var appDir = path.dirname(require.main.filename);
var querystring = require('querystring');
var request = require('request');
var ordersCtl = require(appDir + '/api/orders/orders.controller')
var sDataParse = require(appDir + '/SDataLib/SDataParse');
var SDParse=require(appDir + '/SDataLib/SDParse');
var soap = require('soap');
var xmldoc = require('xmldoc');
var _ = require('lodash');
var soapWSDL = "http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx?wsdl";

exports.sdata = function(req,res) {
	ordersCtl.index(req,res,function(err,orders){
		configObj = req.body.sdata;
		records = orders["Records"];
		var query = "SO_SalesOrderHeaderSPECIAL?include=SO_SalesOrderHeaderSPECIALSECOND";
		//var	query = "SO_InvoiceHeaderSPECIAL?include=SO_InvoiceHeaderSPECIALSECOND";
		configObj["query"] = query;
		SDParse.Get(configObj,function(err,data){
			//console.log(data);
			//console.log(data.SO_InvoiceHeaderSPECIAL.SO_InvoiceHeaderSPECIALSECOND.LineKey);
			var tst = JSON.stringify(data);
			res.type('application/json');
			res.send(tst);
		});
	});
};
exports.streamTest = function(req, res) {
	var sdPasreStream = sDataParse();
	sdPasreStream.on('data', function(sDataObj) {
		console.log(sDataObj);
	});
	sdPasreStream.on('end', function() {
		console.log('sDataParseEnd');
	});
	var r = request({
		url: "http://66.161.168.57/Sdata/MasApp/MasContract/ABC/AR_Customer?where=EmailAddress eq 'corey@corey.com'",
		auth: {
			user: 'SdataUser',
			pass: 'password'
		},
		rejectUnauthorized: false
	});
	r.on('response', function(resp) {
		//resp.headers
		//resp.statusCode
		console.log('Response Code:' + resp.statusCode);
		if (resp.statusCode == 200) {
			r.pipe(sdPasreStream);
		}
	});
};

exports.soap = function(req, res) {
	function encodeXMLField(s) { // TODO: should be moved to a utility class
		return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); // TODO: find out if escaping double quote is necessary or not
	}

	var url = 'http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx';
	var body = '<?xml version=\'1.0\' encoding=\'UTF-8\'?><s12:Envelope xmlns:s12="http://www.w3.org/2003/05/soap-envelope"><s12:Body><ns1:DoItUsernamePwd xmlns:ns1="http://www.aspdotnetstorefront.com/"><ns1:AuthenticationEMail>admin@aspdotnetstorefront.com</ns1:AuthenticationEMail><ns1:AuthenticationPassword>Admin$14</ns1:AuthenticationPassword><ns1:XmlInputRequestString>' + encodeXMLField('<AspDotNetStorefrontImport Version="7.1" SetImportFlag="true" AutoLazyAdd="true" AutoCleanup="true" Verbose="false" TransactionsEnabled="true"><Query Name="Orders" RowName="order"><SQL><![CDATA[select OrderNumber from dbo.Orders]]></SQL></Query></AspDotNetStorefrontImport>') + '</ns1:XmlInputRequestString></ns1:DoItUsernamePwd></s12:Body></s12:Envelope>';
	var soapAction = 'http://www.aspdotnetstorefront.com/DoItUsernamePwd';

	var headers = {
		'Content-Type': 'application/soap+xml',
		'SOAPAction': soapAction,
		'Content-Encoding': 'UTF-8',
		'Content-Length': body.length
	};

	request.post({ url: url, headers: headers, body: body }, function(e, r, b) {
		if (e || r.statusCode !== 200) { res.send(r.statusCode + "\n" + e); return; }
		res.send(b);
	});
};

exports.query = function(req, res) {
	var sdPasreStream = sDataParse();
	sdPasreStream.on('data', function(sDataObj) {
		console.log(sDataObj);
	});
	sdPasreStream.on('end', function() {
		console.log('sDataParseEnd');
	});
	var r = request({
		url: "http://66.161.168.57/Sdata/MasApp/MasContract/ABC/" + req.params.table + "?where=" + req.params.field + " " + req.params.operator + " '" + req.params.value + "'",
		auth: {
			user: 'SdataUser',
			pass: 'password'
		},
		rejectUnauthorized: false
	});
	r.on('response', function(resp) {
		//resp.headers
		//resp.statusCode
		console.log('Response Code:' + resp.statusCode);
		if (resp.statusCode == 200) {
			r.pipe(sdPasreStream);
		}
	});
};
