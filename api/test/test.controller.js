var xml2json = require('xml2json');
var SFLib = require('../../SFLib');
var Q = require('q');
var config = require('../../config');
var ARCustomer = require('../../SDataLib/ARCustomer');

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
