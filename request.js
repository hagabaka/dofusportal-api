var request = require('sync-request');
module.exports = function(url) {
  return request('GET', url).getBody().toString();
}
