var SFOrders = require('../../SFLib/Orders');
var ARCustomer = require('../../SDataLib/ARCustomer');

module.exports = {
  process: function (req, res) {
    SFOrders
      .getNewOrdersQ(req.body.storefront.url, req.body.storefront.username, req.body.storefront.password)
      .then(function (results) {
        newCustomers = results.Records.map(function (e) {
          return { emailAddress: e.email, firstName: e.firstname, lastName: e.lastname };
        });

        return ARCustomer.createCustomersQ(req.body.sdata.url, req.body.sdata.username, req.body.sdata.password, req.body.sdata.company, newCustomers);
      })
      .then(function (results) {
        res.send(results);
      })
      .done();
  }
};
