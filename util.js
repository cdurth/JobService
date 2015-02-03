var crypto = require('crypto');

module.exports = {
  encodeXML: function(s) {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); // TODO: find out if escaping double quote is necessary or not
  },

  decodeXML: function(s) {
    return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  },

  decryptPass: function(encryptedPass, salt){
      var decipher, decryptedPass, key, keyIterations, keyLength;
      keyIterations = 10000;
      keyLength = 128;
      key = crypto.pbkdf2Sync(salt.toString('base64'), salt, keyIterations, keyLength);
      decipher = crypto.createDecipher('aes-256-cbc', key);
      decryptedPass = decipher.update(encryptedPass, 'base64', 'utf8');
      decryptedPass += decipher.final('utf8');
      return decryptedPass;
  },

  encryptPass: function(plainTextPass, salt) {
    var cipher, encryptedPass, key, keyIterations, keyLength;
    keyIterations = 10000;
    keyLength = 128;
    key = crypto.pbkdf2Sync(salt.toString('base64'), salt, keyIterations, keyLength);
    cipher = crypto.createCipher('aes-256-cbc', key);
    encryptedPass = cipher.update(plainTextPass, 'utf8', 'base64');
    encryptedPass += cipher.final('base64');
    return encryptedPass;
  },

  makeSalt: function(){
    return crypto.randomBytes(128).toString('base64');
  }
};
