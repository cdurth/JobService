var _ = require('lodash');
var SDataLib = require('../SDataLib');
var Q = require('q');

module.exports = {
  getCustomersQ: function (baseUrl, username, password, company, query) {
    if (!_.isUndefined(query) && !_.isNull(query))
      query = 'AR_Customer?where=' + query;
    else
      query = 'AR_Customer';

    return SDataLib.GetParsedQ(baseUrl, username, password, company, query);
  },

  doCustomersExistQ: function (baseUrl, username, password, company, arrEmails) {
    var query = "EmailAddress eq '" + arrEmails.join("' or EmailAddress eq '") + "'";
    return module.exports
      .getCustomersQ(baseUrl, username, password, company, query)
      .then(function(results) {
        existingCustomerEmails = results.map(function (e) { return e.EmailAddress; });

        // construct return value
        ret = {};
        arrEmails.forEach(function (email) {
          ret[email] = _.includes(existingCustomerEmails, email);
        });
        return ret;
      });
  },

  createCustomersQ: function (baseUrl, username, password, company, arrCustomers) {
    var arrEmails = arrCustomers.map(function (e) { return e.emailAddress; });
    return module.exports
      .doCustomersExistQ(baseUrl, username, password, company, arrEmails)
      .then(function (customerResults) {
        // filter out all customers that already exist
        var createCustomers = arrCustomers.filter(function (e) {
          return !customerResults[e.emailAddress];
        });

        var createCustPromises = [];
        createCustomers.forEach(function (cust) {
          // give default values to firstName and lastName
          if (_.isUndefined(cust.firstName) || _.isNull(cust.firstName)) cust.firstName = '';
          if (_.isUndefined(cust.lastName) || _.isNull(cust.lastName)) cust.lastName = '';
          var busObj = 'AR_Customer';

          var payload =
            '<'+ busObj +' sdata:uri="'+url+'" xmlns="">' +
            '<ARDivisionNo>01</ARDivisionNo>' +
            '<SalespersonDivisionNo>01</SalespersonDivisionNo>' +
            '<SalespersonNo>0100</SalespersonNo>' +
            '<CustomerName>' + cust.firstName + ' ' + cust.lastName + '</CustomerName>' +
            '<EmailAddress>' + cust.emailAddress + '</EmailAddress>' +
            '</'+ busObj +'>';

          createCustPromises.push(SDataLib.PostQ(baseUrl, username, password, company, busObj, payload));
        });

        // execute all promises, even if one fails
        return Q
          .allSettled(createCustPromises)
          .then(function (results) {
            // error handling block, map result to createCustomers
            // TODO: create uniform return value for all customers, including the ones that were
            // filtered out, so user knows which customers were not created
            return results;
          })
          .then(function(custRecords){
            var query = "EmailAddress eq '" + arrEmails.join("' or EmailAddress eq '") + "'";
            return module.exports.getCustomersQ(baseUrl, username, password, company, query);
          });
      });
  }
};
