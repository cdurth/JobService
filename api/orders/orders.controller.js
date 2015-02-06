var SFOrders = require('../../SFLib/Orders');
var ARCustomer = require('../../SDataLib/AR_Customer');
var _ = require('lodash');
var util = require('../../util');
var SOSalesOrder = require('../../SDataLib/SO_SalesOrder');

module.exports = {
  process: function (req, res) {
    var sdataObj = _.find(req.body.job.users,{'userType':'sdata'});
    var sfObj = _.find(req.body.job.users,{'userType':'storefront'});

    // decrypt passwords
    sdataObj.password = util.decryptPass(sdataObj.encryptedPass, sdataObj.salt);
    sfObj.password = util.decryptPass(sfObj.encryptedPass, sfObj.salt);

    // sdata options
    sdataObj.url = _.find(req.body.job.data,{'key':'sdata_endpoint'}).value;
    sdataObj.company = _.find(req.body.job.data,{'key':'sdata_company'}).value;
    sdataObj.createCustomers = _.find(req.body.job.data,{'key':'sdata_createcustomers'}).value;

    // storefront options
    sfObj.url = _.find(req.body.job.data,{'key':'storefront_endpoint'}).value;

    // var resObj=[sdataObj,sfObj];
    // res.send(resObj);
    SFOrders
      .getNewOrdersQ(sfObj.url, sfObj.username, sfObj.password)
      .then(function (results) {
        newCustomers = results.Records.map(function (e) {
          return { emailAddress: e.email, firstName: e.firstname, lastName: e.lastname };
        });

        return ARCustomer
          .createCustomersQ(sdataObj.url, sdataObj.username, sdataObj.password, sdataObj.company, newCustomers)
          .then(function (customers){
            // match customer by email and insert customer no
            results.Records.forEach(function(order){
              order.ARDivisionNo = _.find(customers,{'EmailAddress': order.email}).ARDivisionNo;
              order.CustomerNo   = _.find(customers,{'EmailAddress': order.email}).CustomerNo;

              if (_.isUndefined(order.customerno)){
                // something went wrong and there is no customer
                // do error handling and remove the order so it is not processed
              }
            });
            return results;
          });
      })
      .then(function (results) {
        var arrOrders = results.Records;
        SOSalesOrder.createSalesOrderQ(sdataObj.url, sdataObj.username, sdataObj.password, sdataObj.company, arrOrders)
        .then(function(results){
          // TODO: update SF order here from results array
          res.send(results);
        });

      })
      .done();
  }
};
