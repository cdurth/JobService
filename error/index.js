var error = require('./error');

module.exports.InvalidItem = function(order,arrItem) {
  console.log('invalid item');
  var item = arrItem.join(", ");

  return error(1, null, 'Item', "Item(s) " + item + " missing or invalid from "+ order, null);
};

module.exports.InternalError = function(req, res, result, message, innerError) {
  if (innerError === null) {
    innerError = null;
  }
  return console.log(res, 500, error(4, result, 'InternalError', message, innerError));
};
