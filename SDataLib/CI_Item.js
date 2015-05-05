var _ = require('lodash');
var SDataLib = require('../SDataLib');
var Q = require('q');
var cError = require('../error');

module.exports = {
  getItemsQ:function(baseUrl, username, password, company, query, logObj) {
    if (!_.isUndefined(query) && !_.isNull(query)) {
      query = 'CI_Item?where=' + query;
    } else {
      query = 'CI_Item';
    }
    return SDataLib.GetParsedQ(baseUrl, username, password, company, query, logObj);
  },
  validateItemsQ:function(baseUrl, username, password, company, itemArr, logObj) {
    var query = "ItemCode eq '" + itemArr.join("' or ItemCode eq '").toString() + "'";

    return module.exports
      .getItemsQ(baseUrl, username, password, company, query, logObj)
      .then(function(results) {
        var existingItems = results.map(function (e) { return e.ItemCode; });
        // construct return value
        var badItems = [];
        var ret = true;
        itemArr.forEach(function (item) {
          if(!_.includes(existingItems, item)){
            badItems.push(item);
          }
        });

        if(!_.isEmpty(badItems)){
          throw badItems;
        }

        return ret;
      });
  }
};
