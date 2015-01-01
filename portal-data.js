var page = require('./ipb').page;
var levenshtein = require('levenshtein-distance');

var dimensions = ['Enurado', 'Srambad', 'Xelorium'];
var dimensionPattern = new RegExp(dimensions.join('|'), 'i');

var titleCase = function(string) {
  return string.replace(/\b\w/g, function (letter) {
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
  var spellChecker = new levenshtein(workingText.split(/\s+/));
  dimensions.forEach(function(dimension) {
    spellChecker.find(dimension, function(misspelled) {
      workingText = workingText.replace(misspelled, dimension);
    });
  });
  workingText = workingText.replace(/\bxel\b/i, 'Xelorium');
  do {
    var dimensionMatch = workingText.match(dimensionPattern);
    if(dimensionMatch) {
      var dimension = dimensionMatch[0];
      var indexAfter = dimensionMatch.index + dimension.length;
      var textAfter = workingText.substr(indexAfter);
      nextDimension = textAfter.match(dimensionPattern);
      if(nextDimension) {
        workingText = workingText.substr(0, indexAfter + nextDimension.index);
        nextWorkingText = textAfter.slice(nextDimension.index);
      } else {
        nextWorkingText = textAfter;
      }
      var coordinates = grep(workingText, /(-?\d+),\s*(-?\d+)/, function(_, x, y) {
        return '[' + x + ',' + y + ']';
      });
      if(coordinates) {
        var area = grep(workingText, /Incarnam|Dark Jungle|Canopy Village/i, function(area) {
          return titleCase(area);
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
      workingText = nextWorkingText;
    }
  } while(workingText.length > 0 && nextDimension);
}

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
    console.log(exception);
    return null;
  }
}
