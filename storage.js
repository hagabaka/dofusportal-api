var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

exports.get = function(key, callback) {
  console.log('Getting from storage ', key);
  client.get(key, function(error, data) {
    console.log('Got from storage ', key, data);
    callback(JSON.parse(data));
  });
};

exports.set = function(key, data, callback) {
  console.log('Storing ', key, data);
  client.set(key, JSON.stringify(data), callback || function() {});
};

