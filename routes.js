module.exports = function(app) {
  // Insert routes below
  app.use('/api/test', require('./api/test'));
  app.use('/api/orders', require('./api/orders'));

  app.route('/')
  .get(function(req, res) {
    res.send('index');
  });
};
