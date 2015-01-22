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
  var resultsArray = [];
  var resultsObj = {};

  // get all records
  var document = new xmldoc.XmlDocument(xml);
  var resNode = document.childrenNamed('entry');

  // iterate through records, parse and build return object
  for (var i=0; i < 1;i++){
    var buildObj = {};
    var payload = resNode[i].childNamed('sdata:payload');
    var handle = payload.firstChild;
    var special = handle.childrenNamed(handle.firstChild.name);
    console.log(special.length);
    counter = 0;
    var deleteNodes = [];
    handle.eachChild(function(child, index, array){
      counter++;
      buildObj[child.name] = child.val;

      if (counter === handle.children.length){
        //console.log(buildObj);;
        //console.log(json);
        resultsArray.push(buildObj);
      }
    });
  }

  return resultsObj = resultsArray;
}
