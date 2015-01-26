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
    module.exports.parse(r.body,function(err,data){
      callback(err,data);
    });
  });
},
module.exports.parse = function(xml,callback){
  // get all records
  var document = new xmldoc.XmlDocument(xml);
  var resNode = document.childrenNamed('entry');
  var retArray = [];

  // iterate through records, parse and build return object
  for (var i=0; i < 2;i++){
    var payload = resNode[i].childNamed('sdata:payload').firstChild;
    var recursion = function (xmlNode){
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
           if(xmlNode.name.search(':') > 0){
            xmlNode.name = xmlNode.name.replace(/:/g, '');
           }
           lastNode = xmlNode.name;
           nodeCount = 1;
           ret[xmlNode.name] = recursion(child);
         }
       }
     });
     return ret;
    };
    //TODO: need to start building return array here i think
    //return retArray;
    retArray.push(recursion(payload));
  }
callback(null,retArray);
}
