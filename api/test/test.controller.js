var path = require('path');
var appDir = path.dirname(require.main.filename);
var querystring = require('querystring');
var request = require('request');
var ordersCtl = require(appDir + '/api/orders/orders.controller');
var SDParse=require(appDir + '/SDataLib/SDParse');
var xmldoc = require('xmldoc');
var _ = require('lodash');
var soapWSDL = "http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx?wsdl";

var xml2json = require('xml2json');
var SFLib = require('../../SFLib');
var Q = require('q');
var config = require('../../config');

exports.sdata = function(req,res) {
	ordersCtl.index(req,res,function(err,orders){
		configObj = req.body.sdata;
		records = orders.Records;
		var query = "SO_SalesOrderHeaderSPECIAL?include=SO_SalesOrderHeaderSPECIALSECOND";
		//var	query = "SO_InvoiceHeaderSPECIAL?include=SO_InvoiceHeaderSPECIALSECOND";
		configObj.query = query;
		SDParse.Get(configObj,function(err,data){
			//console.log(data);
			//console.log(data.SO_InvoiceHeaderSPECIAL.SO_InvoiceHeaderSPECIALSECOND.LineKey);
			var tst = JSON.stringify(data);
			res.type('application/json');
			res.send(tst);
		});
	});
};

exports.getOrders = function(req, res) {

};

exports.sflib = function(req, res) { // refactored
	SFLib
		.queryWithResultQ(config.storefront.url, config.storefront.username, config.storefront.password, 'select OrderNumber from dbo.Orders')
		.then(function (result) {
			res.type('application/json').send(xml2json.toJson(result));
		})
		.fail(function (err) {
			res.status(500).send(err.stack); // TODO: uniform error responses
		})
		.done();
};
