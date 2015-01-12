var page = require('./ipb').page;
var dimensions = require('./names').dimensions;
var titleCase = require('./utils').titleCase;
var scanForCoordinates = require('./parser');

function appendData(parsedPage, portals) {
  parsedPage.posts().reverse().forEach(function(post) {
    var body = post.body;
    body.find('.ipsBlockquote').remove();
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

exports.portalData = function(url) {
  portals = {};
  dimensions.forEach(function(dimension) {
    portals[dimension] = [];
  });

  try {
    var previousPage = page(url).lastPage();
    var parsedPage;
    do {
      parsedPage = page(previousPage);
      appendData(parsedPage, portals);
      previousPage = parsedPage.previousPage();
    } while(previousPage && dimensions.some(function(dimension) {
      return portals[dimension].length < 3;
    }));
    return {source: url, portals: portals, edit: parsedPage.replyUrl()};
  } catch(exception) {
    console.error(exception.stack);
    return null;
  }
}
