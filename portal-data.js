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

function scanForCoordinates(text, found) {
  var lines = text.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
  lines.forEach(function(line) {
    var dimensionsMentioned = line.match(dimensionName);
    var coordinatesMentioned = line.match(coordinates);
    if(dimensionsMentioned && coordinatesMentioned &&
       dimensionsMentioned.length === coordinatesMentioned.length) {
      dimensionsMentioned.forEach(function (dimension, index) {
        var coordinates = '[' + coordinatesMentioned[index].match(/-?\d+/g).join(',') + ']';
        found(capitalize(dimension), coordinates);
      });
    }
  });
}

function appendData(parsedPage, portals) {
  parsedPage.posts().reverse().forEach(function(post) {
    scanForCoordinates(post.body, function(dimension, coordinates) {
      portals[capitalize(dimension)].push({
        coordinates: coordinates,
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
}
