var error = require('./error');
var util = require('../util');

module.exports.InvalidItem = function(order,arrItem, logObj) {
  console.log('invalid item');
  var item = arrItem.join(", ");
  var logger = util.createLogger(logObj);
  var err = error(1, null, 'Item', "Item(s) " + item + " missing or invalid from "+ order, null, null);
  return logger.log('error','Invalid Item',err);
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
  console.log(res, 500, error(4, result, 'InternalError', message, innerError));
};

module.exports.SFQuery = function(res, message, innerError, logObj) {
  var logger = util.createLogger(logObj);
  var err = error(5, 'StoreFront', 'Query Error', message, null, null);
  logger.log('error','Storefront',err);
  return err;
};

module.exports.SDATAPost = function(message, innerError, logObj) {
  console.log('sdata post error');
  var logger = util.createLogger(logObj);
  var err = error(6,'SDATA','Post Error',message,null,null);
  return logger.log('error','SDATA Post Error',err);
};