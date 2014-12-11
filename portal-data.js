var page = require('./ipb').page;

var dimensions = ['Enurado', 'Srambad', 'Xelorium'];
var dimensionPattern = new RegExp(dimensions.join('|') + '|\\bxel\\b', 'i');

var capitalize = function(string) {
  return string.replace(/^./, function (letter) {
    return letter.toUpperCase();
  });
};

function grep(text, regexp, process) {
  var match = text.match(regexp);
  if(match) {
    if(process) {
      return process.apply(this, match);
    } else {
      return match[0];
    }
  } else {
    return null;
  }
}

function scanForCoordinates(text, found) {
  var nextDimension;
  var workingText = text;
  do {
    var dimensionMatch = workingText.match(dimensionPattern);
    if(dimensionMatch) {
      var dimension = dimensionMatch[0].replace(/^xel$/i, 'Xelorium');
      var indexAfter = dimensionMatch.index + dimension.length;
      var textAfter = workingText.substr(indexAfter);
      nextDimension = textAfter.match(dimensionPattern);
      if(nextDimension) {
        workingText = workingText.substr(0, indexAfter + nextDimension.index);
      }
      var coordinates = grep(workingText, /(-?\d+),\s*(-?\d+)/, function(_, x, y) {
        return '[' + x + ',' + y + ']';
      });
      if(coordinates) {
        var area = grep(workingText, /Incarnam|Dark Jungle|Canopy Village/i, function(area) {
          return capitalize(area);
        });
        var uses = grep(workingText, /\(?(\d+)\)?\s+uses/, function(_, number) {
          return parseInt(number);
        });
        found(dimension, coordinates, {
          area: area,
          uses: uses
        });
      } else {
        console.log('Missing coordinates', workingText, text);
      }
      workingText = textAfter;
    }
  } while(workingText.length > 0 && nextDimension);
}

function appendData(parsedPage, portals) {
  parsedPage.posts().reverse().forEach(function(post) {
    var body = post.body;
    body.find('.ipsBlockquote').remove();
    scanForCoordinates(body.text(), function(dimension, coordinates, details) {
      portals[capitalize(dimension)].push({
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
