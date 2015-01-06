'use strict';

var express = require('express');
var controller = require('./orders.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/process', controller.process);
//router.get('/check/:email', controller.checkEmail);

module.exports = router;
