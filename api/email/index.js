'use strict';

var express = require('express');
var controller = require('./email.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/check/:email', controller.checkEmail);
router.get('/query/:table/:field/:operator/:value', controller.query);


module.exports = router;
