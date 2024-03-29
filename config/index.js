var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'jobservice'
    },
    port: 3000,
    storefront: {
      url: 'http://demo.aspdotnetstorefront.martinandassoc.com/ipx.asmx',
      username: 'admin@aspdotnetstorefront.com',
      password: 'Admin$11'
    }
  },

  test: {
    root: rootPath,
    app: {
      name: 'jobservice'
    },
    port: 3000,
  },

  production: {
    root: rootPath,
    app: {
      name: 'jobservice'
    },
    port: 3000,
  }
};

module.exports = config[env];
