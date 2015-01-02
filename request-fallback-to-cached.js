var request = require('sync-request');
module.exports = function(url) {
  try {
    return request('GET', url).getBody().toString();
  } catch(error) {
    console.log('Error when requesting original');
    console.dir(error);
    var cachedUrl = 'https://webcache.googleusercontent.com/search?q=cache:' + url;
    return request('GET', cachedUrl, {'User-Agent': 'Mozilla/4.0'}).getBody().toString();
  }
}
