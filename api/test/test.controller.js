'use strict';

var path = require('path');
var appDir = path.dirname(require.main.filename);
var querystring = require('querystring');
var request = require('request');

var sDataParse = require(appDir + '/SDataLib/SDataParse');
var soap = require('soap');
var soapWSDL = "http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx?wsdl";

exports.streamTest = function(req, res) {
  var sdPasreStream = sDataParse();
  sdPasreStream.on('data', function(sDataObj) {
    console.log(sDataObj);
  });
  sdPasreStream.on('end', function() {
    console.log('sDataParseEnd');
  });
  var r = request({
    url: "http://66.161.168.57/Sdata/MasApp/MasContract/ABC/AR_Customer?where=EmailAddress eq 'corey@corey.com'",
    auth: {
      user: 'SdataUser',
      pass: 'password'
    },
    rejectUnauthorized: false
  });
  r.on('response', function(resp) {
    //resp.headers
    //resp.statusCode
    console.log('Response Code:' + resp.statusCode);
    if (resp.statusCode == 200) {
      r.pipe(sdPasreStream);
    }
  });
};

exports.soap = function(req, res) {
  var url = 'http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx';

  var headers = {
    'Content-Type': 'application/soap+xml',
    'SOAPAction': 'http://www.aspdotnetstorefront.com/DoItUsernamePwd',
    'Content-Encoding': 'UTF-8',
    'Content-Length': '708'
  };

  var body = '<s12:Envelope xmlns:s12="http://www.w3.org/2003/05/soap-envelope"><s12:Body><ns1:DoItUsernamePwd xmlns:ns1="http://www.aspdotnetstorefront.com/"><ns1:AuthenticationEMail>admin@aspdotnetstorefront.com</ns1:AuthenticationEMail><ns1:AuthenticationPassword>Admin$14</ns1:AuthenticationPassword><ns1:XmlInputRequestString>&lt;AspDotNetStorefrontImport Version="7.1" SetImportFlag="true" AutoLazyAdd="true" AutoCleanup="true" Verbose="false" TransactionsEnabled="true"&gt;&lt;Query Name="Orders" RowName="order"&gt;&lt;SQL&gt;&lt;![CDATA[select OrderNumber from dbo.Orders]]&gt;&lt;/SQL&gt;&lt;/Query&gt;&lt;/AspDotNetStorefrontImport&gt;</ns1:XmlInputRequestString></ns1:DoItUsernamePwd></s12:Body></s12:Envelope>';

  request.post({
    url: url,
    headers: headers,
    body: body
  }, function(e, r, b) {
    if (e) { res.send(r.statusCode + "\n" + e); return; }
    res.send(b);
    //console.log(b);
    //if (b) res.send("SUCCESS");
  });
};

exports.query = function(req, res) {
  var sdPasreStream = sDataParse();
  sdPasreStream.on('data', function(sDataObj) {
    console.log(sDataObj);
  });
  sdPasreStream.on('end', function() {
    console.log('sDataParseEnd')
  });
  var r = request({
    url: "http://66.161.168.57/Sdata/MasApp/MasContract/ABC/" + req.params.table + "?where=" + req.params.field + " " + req.params.operator + " '" + req.params.value + "'",
    auth: {
      user: 'SdataUser',
      pass: 'password'
    },
    rejectUnauthorized: false
  });
  r.on('response', function(resp) {
    //resp.headers
    //resp.statusCode
    console.log('Response Code:' + resp.statusCode);
    if (resp.statusCode == 200) {
        r.pipe(sdPasreStream);
    }
  });
};