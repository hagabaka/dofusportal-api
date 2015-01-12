var levenshtein = require('levenshtein-distance');
var utils = require('./utils');
var grep = utils.grep;
var names = require('./names');
var dimensions = names.dimensions;
var dimensionPattern = new RegExp(dimensions.join('|'), 'i');
var areas = names.areas;
var areaPattern = new RegExp(areas.join('|'), 'i');

module.exports = function scanForCoordinates(text, found) {
  var spellChecker = new levenshtein(text.split(/\s+/));
  dimensions.concat(areas).forEach(function(name) {
    text = text.replace(new RegExp(name, 'i'), name);
    spellChecker.find(name, function(misspelled) {
      text = text.replace(misspelled, name);
    });
  });
  text = text.replace(/\bxel\b/i, 'Xelorium');

  text.split(/\r?\n/).forEach(function(line) {
    var dimension = grep(line, dimensionPattern);
    var area = grep(line, areaPattern);
    var coordinates = grep(line, /(-?\d+),\s*(-?\d+)/, function(_, x, y) {
      return '[' + x + ',' + y + ']';
    });
    var uses = grep(line, /\(?(\d+)\)?\s+uses/, function(_, number) {
      return parseInt(number);
    });
    if(dimension && coordinates) {
      found(dimension, coordinates, {
        area: area,
        uses: uses
      });
    }
  });
};
