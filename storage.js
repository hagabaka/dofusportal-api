var memjs = require('memjs');

var client = memjs.Client.create();

if (!client.stats()) {
  var data = {};
  client = {
    get: function(key, callback) {
      return callback(data[key]);
    },
    set: function(key, value, callback) {
      data[key] = value;
      callback(value);
      return value;
    }
  };
}

exports.get = function(key, callback) {
  return client.get(key, callback);
};

exports.set = function(key, data, callback) {
  return client.set(key, data, callback);
};

