var request = require('request');
var Q = require('q');
var xmldoc = require('xmldoc');

module.exports.GetQ = function(baseUrl, username, password, company, query) {
  var url = baseUrl +'/'+ company +'/'+ query;
  var defer = Q.defer();

  request.get({
    url: url,
    auth: {
      username: username,
      password: password
    },
    rejectUnauthorized: false },
    function (err, res) {
      if (err) defer.reject(err);
      defer.resolve(res);
    }
  );

  return defer.promise;
};

module.exports.GetParsedQ = function(baseUrl, username, password, company, query) {
  return module.exports.GetQ(baseUrl, username, password, company, query)
    .then(function (result) {
      return module.exports.Parse(result.body);
    });
};

module.exports.PostQ = function(baseUrl, username, password, company, busObj, payload) {
  var defer = Q.defer();
  var headers = { 'Content-Type': 'application/atom+xml;type=entry' };
  var url = baseUrl +'/'+ company +'/'+ busObj;
  var body = '<entry xmlns:sdata="http://schemas.sage.com/sdata/2008/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.w3.org/2005/Atom"><sdata:payload>';
      body+= payload;
      body+= '</sdata:payload></entry>';

  request.post({
    url: url,
    headers: headers,
    body: body,
    auth: {
      username: username,
      password: password
    },
    rejectUnauthorized: false },
    function(err, r) {
      if (err) defer.reject(err);
      defer.resolve(r.body);
    }
  );

  return defer.promise;
};

module.exports.PostParsedQ = function(baseUrl, username, password, company, busObj, payload) {
  return module.exports.PostQ(baseUrl, username, password, company, busObj, payload)
    .then(function (result) {
      return module.exports.Parse(result.body);
    });
};

module.exports.Parse = function(xml) { // TODO: refactor
  var doc = new xmldoc.XmlDocument(xml);
  var resNode = doc.childrenNamed('entry');
  var retArray = [];

  var recursion = function (xmlNode) {
    var ret = {};
    var lastNode;
    var nodeCount = 1;
    xmlNode.eachChild(function(child,index,array){
      if(child.children.length < 1) {
        ret[child.name] = child.val;
      } else {
        if (lastNode === xmlNode.name){
          nodeCount++;
          ret[xmlNode.name+nodeCount] = recursion(child);
        } else {
          //TODO: more sanitization may be necessary
          //  if(xmlNode.name.search(':') > 0){
          //   xmlNode.name = xmlNode.name.replace(/:/g, '');
          //  }
          lastNode = xmlNode.name;
          nodeCount = 1;
          ret[xmlNode.name] = recursion(child);
        }
      }
    });
    return ret;
  };

  // iterate through records, parse and build return object
  for (var i=0; i < resNode.length ;i++){
    var payload = resNode[i].childNamed('sdata:payload').firstChild;

    //TODO: need to start building return array here i think
    //return retArray;
    retArray.push(recursion(payload));
  }

  return retArray;
};
