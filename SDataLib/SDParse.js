var _ = require('lodash');
var parser = require('xml2json');
var xmldoc = require('xmldoc');
var request = require('request');

module.exports.Get = function(getObj,callback){

  var url = getObj.url +'/'+ getObj.company +'/'+ getObj.query;
  request.get({
    url: url,
    auth:getObj.auth,
    rejectUnauthorized: false },
    function(err, r, b) {
    if (err || r.statusCode !== 200) {
       console.log(r.body);
       console.log(r.statusCode + "\n" + err);
       return;
    }
  var test =  module.exports.parse(r.body);
  callback(err,test);
  });
},
module.exports.parse = function(xml){
  // get all records
  var document = new xmldoc.XmlDocument(xml);
  var resNode = document.childrenNamed('entry');

  // iterate through records, parse and build return object
  for (var i=0; i < resNode.length;i++){

    var payload = resNode[i].childNamed('sdata:payload');
    console.log(payload.length);
    var recursion = function (xmlNode){
      var tmpArray = [];
      if(xmlNode.children.length < 1){
        return xmlNode;
      }
      var ret = [];
      xmlNode.eachChild(function(child,index,array){
        ret.push(recursion(child));
      });
      return ret;
    };
    return recursion(payload);
  }
}
