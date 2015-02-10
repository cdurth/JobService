var error = require('./error');
var util = require('../util');

module.exports.InvalidItem = function(order,arrItem, logObj) {
  console.log('invalid item');
  var item = arrItem.join(", ");
  var logger = util.createLogger(logObj);
  return logger.log('error','Invalid Item',error(1, null, 'Item', "Item(s) " + item + " missing or invalid from "+ order, null, null));
};

module.exports.SFUpdateOrders = function(arrOrders, message, updateQuery, logObj){
  console.log('sfupdate error');
  var orders = arrOrders.join(", ");

  return error(2, null, 'StoreFront', message + '. Attempted Orders: '+ orders, updateQuery, null, null);
};

module.exports.InternalError = function(req, res, result, message, innerError, logObj) {
  if (innerError === null) {
    innerError = null;
  }
  return console.log(res, 500, error(4, result, 'InternalError', message, innerError));
};
