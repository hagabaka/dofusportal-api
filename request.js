var request = require('then-request');
module.exports = function(url) {
  return request('GET', url).getBody();
}
