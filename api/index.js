var express = require('express');
var controller = require('./api.controller');

var router = express.Router();

router.post('/process', controller.process);
//router.get('/check/:email', controller.checkEmail);

module.exports = router;
