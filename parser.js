var levenshtein = require('levenshtein-distance');
var utils = require('./utils');
var grep = utils.grep;
var dimensions = require('./names').dimensions;
var dimensionPattern = new RegExp(dimensions.join('|'), 'i');

module.exports = function scanForCoordinates(text, found) {
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
          return utils.titleCase(area);
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
