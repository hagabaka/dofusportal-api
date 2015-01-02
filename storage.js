var memjs = require('memjs');

var client = memjs.Client.create();

if (!client.stats()) {
  var data = {};
  client = {
    get: function(key, callback) {
      return callback(data[key] || 'null');
    },
    set: function(key, value, callback) {
      data[key] = value;
      callback(value);
      return value;
    }
  };
}

exports.get = function(key, callback) {
  client.get(key, function(data) {
    callback(JSON.parse(data));
  });
};

exports.set = function(key, data, callback) {
  client.set(key, JSON.stringify(data), callback || function() {});
};

