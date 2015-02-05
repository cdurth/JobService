var _ = require('lodash');
var SDataLib = require('../SDataLib');
var Q = require('q');

module.exports = {
  getItemsQ:function(baseUrl, username, password, company, query) {
    if (!_.isUndefined(query) && !_.isNull(query)) {
      query = 'CI_Item?where=' + query;
    } else {
      query = 'CI_Item';
    }
    return SDataLib.GetParsedQ(baseUrl, username, password, company, query);
  },
  validateItemsQ:function(baseUrl, username, password, company, itemArr) {
    var query = "ItemCode eq '" + itemArr.join("' or ItemCode eq '").toString() + "'";

    return module.exports
      .getItemsQ(baseUrl, username, password, company, query)
      .then(function(results) {
        var existingItems = results.map(function (e) { return e.ItemCode; });
        // construct return value
        ret = true;
        itemArr.forEach(function (item) {
          if(!_.includes(existingItems, item)){
            console.log('not found');
            ret = false;
            //TODO: throw error and stop processing this order
          }
        });

        return ret;
      });
  }
};
