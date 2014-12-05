var page = require('./ipb').page;

var dimensions = ['Enurado', 'Srambad', 'Xelorium'];
var dimensionName = new RegExp(dimensions.join('|'), 'gi');
var coordinates = '-?\\d+, ?-?\\d+';
coordinates = new RegExp([
  coordinates,
  '\\[' + coordinates + '\\]',
  '\\(' + coordinates + '\\)'
].join('|'), 'g');

var capitalize = function(string) {
  return string.replace(/^./, function (letter) {
    return letter.toUpperCase();
  });
};

function appendData(parsedPage, portals) {
  parsedPage.posts().reverse().forEach(function(post) {
    text = post.body;
    var dimensionsMentioned = text.match(dimensionName);
    var coordinatesMentioned = text.match(coordinates);
    if(dimensionsMentioned && coordinatesMentioned &&
       dimensionsMentioned.length === coordinatesMentioned.length) {
      dimensionsMentioned.forEach(function (dimension, index) {
        portals[capitalize(dimension)].push({
          coordinates: '[' + coordinatesMentioned[index].match(/-?\d+/g).join(',') + ']',
          postingDate: post.postingDate,
          author: post.author,
          likes: post.likes
        });
      });
    } else {
      console.error('Cannot understand post: ' + post.body);
    }
  });

}

exports.portalData = function(url) {
  portals = {};
  dimensions.forEach(function(dimension) {
    portals[dimension] = [];
  });

  var previousPage = page(url).lastPage();
  do {
    var parsedPage = page(previousPage);
    appendData(parsedPage, portals);
    previousPage = parsedPage.previousPage();
  } while(previousPage && dimensions.some(function(dimension) {
    return portals[dimension].length < 3;
  }));
  return {source: url, portals: portals};
}
