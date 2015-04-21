var xmlDoc  = require('xmldoc');
var request = require('request');
var xml2json = require('xml2json');
var Q = require('q');
var util = require('../util');
var cError = require('../error');

module.exports.queryQ = function(url, username, password, sql, logObj) { // refactored
  var defer = Q.defer();

  var body =
    '<?xml version=\'1.0\' encoding=\'UTF-8\'?>' +
    '<s12:Envelope xmlns:s12="http://www.w3.org/2003/05/soap-envelope">' +
    '  <s12:Body>' +
    '    <ns1:DoItUsernamePwd xmlns:ns1="http://www.aspdotnetstorefront.com/">' +
    '      <ns1:AuthenticationEMail>' + username + '</ns1:AuthenticationEMail>' +
    '      <ns1:AuthenticationPassword>' + password + '</ns1:AuthenticationPassword>' +
    '      <ns1:XmlInputRequestString>' +
             util.encodeXML(
               '<AspDotNetStorefrontImport Version="7.1" SetImportFlag="true" AutoLazyAdd="true" AutoCleanup="true" Verbose="false" TransactionsEnabled="true">' +
               '  <Query Name="Orders" RowName="order">' +
               '    <SQL><![CDATA['+ sql +']]></SQL>' +
               '  </Query>' +
               '</AspDotNetStorefrontImport>'
             ) +
    '      </ns1:XmlInputRequestString>' +
    '    </ns1:DoItUsernamePwd>' +
    '  </s12:Body>' +
    '</s12:Envelope>';

  var headers = {
    'Content-Type': 'application/soap+xml',
    'SOAPAction': 'http://www.aspdotnetstorefront.com/DoItUsernamePwd',
    'Content-Length': body.length
  };

  request.post({url: url, headers: headers, body: body}, function (err, res) {
    if (err){
      return defer.reject(err);
    } 
    defer.resolve(res);
  });

  return defer.promise;
};

module.exports.queryWithResultQ = function (url, username, password, sql, logObj) {
  return exports.queryQ(url, username, password, sql, logObj)
    .then(function (res) {
      doc = new xmlDoc.XmlDocument(res.body);
      if (doc.descendantWithPath('soap:Body.soap:Fault') !== null) {
        console.log(doc.descendantWithPath('soap:Body.soap:Fault'));
        throw cError.SFQuery(res, doc.valueWithPath('soap:Body.soap:Fault.soap:Reason.soap:Text'),null,logObj);
      }
      try {
        var responseXml = doc.valueWithPath('soap:Body.DoItUsernamePwdResponse.DoItUsernamePwdResult');
        return responseXml;
      } catch (e) {
        throw e; // TODO: special parsing error type
      }
    });
};
