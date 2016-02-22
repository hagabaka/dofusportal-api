var $ = require('cheerio');
var dimensions = require('./names').dimensions;
var titleCase = require('./utils').titleCase;
var scanForCoordinates = require('./parser');

function appendData(parsedPage, portals) {
  parsedPage.posts().reverse().forEach(function(post) {
    var body = post.body;
    body.find('.ipsBlockquote').remove();
    body.find('p, br').each(function() {
      var $this = $(this);
      $this.text($this.text() + '\n');
    });
    scanForCoordinates(body.text(), function(dimension, coordinates, details) {
      portals[titleCase(dimension)].push({
        coordinates: coordinates,
        area: details.area,
        uses: details.uses,
        postingDate: post.postingDate,
        author: post.author
      });
    });
  });
}

exports.portalData = function(url, page) {
  portals = {};
  dimensions.forEach(function(dimension) {
    portals[dimension] = [];
  });

  try {
    var previousPage = page(url).lastPage();
    var parsedPage;
    var pageCount = 0;
    do {
      pageCount++;
      parsedPage = page(previousPage);
      appendData(parsedPage, portals);
      previousPage = parsedPage.previousPage();
    } while(pageCount <= 3 && previousPage && dimensions.some(function(dimension) {
      return portals[dimension].length < 3;
    }));
    return {source: url, portals: portals, edit: parsedPage.replyUrl()};
  } catch(exception) {
    console.error(exception.stack);
    return null;
  }
}
