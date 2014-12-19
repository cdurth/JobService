'use strict';

module.exports = function(app) {

  // Insert routes below
  app.use('/api/email', require('./api/email'));
  app.use('/api/test', require('./api/test'));

  // All other routes should redirect to the index.html
  app.route('/*')
  .get(function(req, res) {
    res.send('index');
  });
};
