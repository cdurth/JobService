var request = require('request');

var url = 'http://localhost:3000/api/orders/process';
var headers = {'content-type':'application/json'};
var body = {
  "accountUser": {
    "_id": "54bff10570dbc4e4c29f81db",
    "username": "user1"
  },
  "logDB": {
    "db": "pe5tyQiv",
    "host": "proximus.modulusmongo.net",
    "port": 27017,
    "user": {
      "username": "LoggingUser",
      "encryptedPass": "fguGQJTRr9IWtUkkxA6D3Q==",
      "salt": "HVw3+mU+5i1fQciayX4iz0eQTE3QorIcS434MIeg6x6B3V0oPLJsOEBWKENhdx+M+eVBj8wKQBy9NPqf1KNRS6yjbzfEdIjrlod0R5lhCjkJ+JhLOJzZxjWoiV+5o/xercWxdXXgoQ9biapz3wbue2X/f8u0qM6+Na0d/qNZB2c="
    }
  },
  "job": {
    "_id": "54bff10570dbc4e4c29f81df",
    "name": "SDATA order import",
    "type": 1,
    "data": [
      {
        "key": "sdata_endpoint",
        "value": "http://66.161.168.57/Sdata/MasApp/MasContract"
      },
      {
        "key": "sdata_company",
        "value": "ABC"
      },
      {
        "key": "sdata_createcustomers",
        "value": true
      },
      {
        "key":"sdata_taxcode",
        "value": "CA"
      },
      {
        "key": "storefront_endpoint",
        "value": "http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx"
      }
    ],
    "users": [
      {
        "_id": "54bff10570dbc4e4c29f81dd",
        "username": "SdataUser",
        "encryptedPass": "YNvYLjG599Do14KKGkOsBg==",
        "salt": "09ah826wzKdRw5s46gM9pjZsCkdRbs0zVYgFXc+Mvc0su2Hd+uiP147SjriVcnkyiLmKBgk7fwWTT47CjJafiR0shGhrtP1lCjRp8cxQys38EMlJcPDjY0veTMmAKLaNAVImn8UoczOb12qnAgFNzOQrJrq1Q7el4a9x+NbttSM=",
        "userType": "sdata"
      },
      {
        "_id": "54bff10570dbc4e4c29f81de",
        "username": "corey.durthaler@martinandassoc.com",
        "encryptedPass": "lvFxbs9BYbxtlk0rLelh9A==",
        "salt": "i33C8gMV9+K47QIy6tyZyRRYJlhPvTCZNFqmeQLuM35SAra8v3XGJw7Q3mDi4mu0QSxcone4VUJYBzk3lY06VYp+mmDQs1Yv5b2ua/+k9qPm01hojDaKMb160OugTNbJ+vZbn8Ef76MgTe4RheNwrw0s1+4lpA/1HJRjb5zxFgs=",
        "userType": "storefront"
      }
    ]
  }
};

var bodyStr = JSON.stringify(body);

setInterval(function() {
  request.post({url: url, headers: headers, body: bodyStr}, function (err, res) {
    if (err){
      console.log(err);
    } else {
      console.log("POST sent");
    } 
  });
}, 45000);