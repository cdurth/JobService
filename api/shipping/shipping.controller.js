var SFShipping = require('../../SFLib/Shipping');
var ARInvHistory = require('../../SDataLib/AR_InvoiceHistory');
var _ = require('lodash');
var util = require('../../util');

module.exports = {
  process: function (req, res) {
	var sdataObj  = _.find(req.body.job.users,{'userType':'sdata'});
    var sfObj     = _.find(req.body.job.users,{'userType':'storefront'});
    var logObj    = req.body.logDB;

    // decrypt passwords
    sdataObj.password = util.decryptPass(sdataObj.encryptedPass, sdataObj.salt);
    sfObj.password = util.decryptPass(sfObj.encryptedPass, sfObj.salt);

    // sdata options
    sdataObj.url = _.find(req.body.job.data,{'key':'sdata_endpoint'}).value;
    sdataObj.company = _.find(req.body.job.data,{'key':'sdata_company'}).value;

	// storefront options
    sfObj.url = _.find(req.body.job.data,{'key':'storefront_endpoint'}).value;

	SFShipping
		.getUnShippedOrdersQ(sfObj.url, sfObj.username, sfObj.password, logObj)
		.fail(function(err){
			console.log('failed @ getUnShippedOrdersQ');
		})
		.then(function (orders) {
			if(!_.isEmpty(orders)){
				return ARInvHistory
					.haveOrdersShippedQ(sdataObj.url, sdataObj.username, sdataObj.password, sdataObj.company, orders, logObj)
					.fail(function(err) {
						console.log('failed @ haveOrdersShippedQ');
					})
					.then(function(results){
						if(!_.isEmpty(results)){
							return SFShipping
								.updateShippingDetailsQ(sfObj.url, sfObj.username, sfObj.password, results, logObj)
								.fail(function(err) {
									console.log('failed @ updateShippingDetailsQ');
								})
								.then(function(results) {
									console.log('orders updated');
								});
						}
					});
			}
		})
      	.then(function(result) {
        	res.send('done');
      	});
  }
};