var express = require('express');
var controller = require('./test.controller');

var router = express.Router();

//router.get('/', controller.streamTest);
router.get('/sflib', controller.sflib);
router.post('/testCustomersExist', controller.testCustomersExist);
router.post('/testCreateCustomers', controller.testCreateCustomers);
router.post('/sdata', controller.sdata);

//router.post('/sdata', controller.sdata);
// router.delete('/:id', auth.hasRole('admin'), controller.destroy);
// router.get('/me', auth.isAuthenticated(), controller.me);
// router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
//router.get('/query/:table/:field/:operator/:value', controller.query);
// router.post('/', controller.create);

module.exports = router;
