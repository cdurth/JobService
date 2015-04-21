var express = require('express');
var controller = require('./router.controller');

var router = express.Router();

router.post('/process', controller.process);

module.exports = router;
