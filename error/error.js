module.exports = function(errorCode, result, type, message, innerError) {
  var res;
  res = {};
  if (errorCode !== null) {
    res.errorCode = errorCode;
  }
  if (result !== null) {
    res.result = result;
  }
  if (type !== null) {
    res.type = type;
  }
  if ((message !== null) || (innerError !== null)) {
    res.reason = {};
  }
  if (message !== null) {
    res.reason.message = message;
  }
  if (innerError !== null) {
    res.reason.innerError = innerError.stack;
  }
  console.log(res);
  return res;
};
