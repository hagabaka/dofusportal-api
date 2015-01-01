var memjs = require('memjs');

var client = memjs.Client.create();

if (!client.stats()) {
  var data = null;
  function giveData(key, callback) {
    return callback(data);
  };
  client = {
    get: giveData,
    set: giveData
  };
  exports.get = client.get;
  exports.set = client.set;
}

exports.get = function(key, callback) {
  return client.get(key, callback);
};

exports.set = function(key, data, callback) {
  return client.set(key, data, callback);
};

