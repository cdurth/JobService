var xml2json = require('xml2json');
var SFLib = require('../../SFLib');
var Q = require('q');
var config = require('../../config');
var ARCustomer = require('../../SDataLib/AR_Customer');
var OrdersCtl = require('../orders/orders.controller');
var request = require('request');
var util = require('../../util');

exports.decrypt = function(req,res) {
	var resObj = {};
	resObj['pass:'] = util.decryptPass("YNvYLjG599Do14KKGkOsBg==", "09ah826wzKdRw5s46gM9pjZsCkdRbs0zVYgFXc+Mvc0su2Hd+uiP147SjriVcnkyiLmKBgk7fwWTT47CjJafiR0shGhrtP1lCjRp8cxQys38EMlJcPDjY0veTMmAKLaNAVImn8UoczOb12qnAgFNzOQrJrq1Q7el4a9x+NbttSM=");
	res.send(resObj);
};

exports.encrypt = function(req,res) {
	var resObj = {};
	var salt = util.makeSalt();
	resObj['planText'] = req.param('pass');
	resObj['salt'] = salt;
	resObj['encrypted'] = util.encryptPass(req.param('pass'),salt);
	res.send(resObj);
};

exports.sdata = function(req, res) {
	ARCustomer
		.doCustomersExistQ(req.body.sdata.url, req.body.sdata.auth.username, req.body.sdata.auth.password, req.body.sdata.company,
			[
				'corey.durthaler@martinandassoc.com',
				'shawn.goodwin@martinandassoc.com',
				'dt.raelcun@gmail.com'
			]
		)
		.then(function (results) {
			res.send(results);
		})
		.done();
};

exports.testProcess = function (req, res) {
	var body = {
    sdata: {
        url: "http://66.161.168.57/Sdata/MasApp/MasContract",
        company: "ABC",
        username: "SdataUser",
        password: "password"
    },
    storefront: {
        url: "http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx",
        username: "admin@aspdotnetstorefront.com",
        password: "Admin$11"
    }
  };
  var url = 'http://localhost:' + config.port + '/api/orders/process';
  var headers = { 'Content-Type': 'application/json' };

  request.post({url: url, headers: headers, body: JSON.stringify(body)}, function (err, innerRes) {
  	if (err) return res.send(err.stack);
  	res.send(innerRes.body);
  });
};

exports.testCreateCustomers = function (req, res) {
	ARCustomer
		.createCustomersQ(req.body.sdata.url, req.body.sdata.auth.username, req.body.sdata.auth.password, req.body.sdata.company,
			[
				{
					emailAddress: 'corey.durthaler@martinandassoc.com',
				},
				{
					emailAddress: 'shawn.goodwin@martinandassoc.com',
					firstName: 'ShawnRocksOhio'
				},
				{
					emailAddress: 'dt.raelcun@gmail.com',
					firstName: 'Dan',
					lastName: 'Taylor'
				}
			])
		.then(function (results) {
			res.send(results);
		})
		.done();
};

exports.testCustomersExist = function(req, res) {
	ARCustomer
		.doCustomersExistQ(req.body.sdata.url, req.body.sdata.auth.username, req.body.sdata.auth.password, req.body.sdata.company,
			[
				'corey.durthaler@martinandassoc.com',
				'shawn.goodwin@martinandassoc.com',
				'dt.raelcun@gmail.com'
			]
		)
		.then(function (results) {
			res.send(results);
		})
		.done();
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
