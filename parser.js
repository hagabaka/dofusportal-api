var levenshtein = require('levenshtein-distance');
var utils = require('./utils');
var grep = utils.grep;
var names = require('./names');
var dimensions = names.dimensions;
var dimensionPattern = new RegExp(dimensions.join('|'), 'i');
var areas = names.areas;
var areaPattern = new RegExp(areas.join('|'), 'i');

function scanForOnePortal(text, found) {
  var dimension = grep(text, dimensionPattern);
  var area = grep(text, areaPattern);
  var coordinates = grep(text, /(-?\d+)\s*[,;]\s*(-?\d+)/, function(_, x, y) {
    return '[' + x + ',' + y + ']';
  });
  var uses = grep(text, /\(?(\d+)\)?\s*(?:free|remaining)?\s*uses?\b/i, function(_, number) {
    return parseInt(number);
  });
  var foundInText = dimension && coordinates;
  if(foundInText) {
    found(dimension, coordinates, {
      area: area,
      uses: uses
    });
  }
  return foundInText;
}

module.exports = function scanForCoordinates(text, handlePortal) {
  var spellChecker = new levenshtein(text.split(/\s+/));
  dimensions.concat(areas).forEach(function(name) {
    text = text.replace(new RegExp(name, 'i'), name);
    spellChecker.find(name, function(misspelled) {
      text = text.replace(misspelled, name);
    });
  });
  text = text.replace(/\bxel\b/i, 'Xelorium');

  // First try to scan for a portal in each line
  var portalsFound = [];
  text.split(/\r?\n/).forEach(function(line) {
    scanForOnePortal(line, function() {
      portalsFound.push(arguments);
    });
  });
  // If multiple portals are found, handle them
  if(portalsFound.length > 1) {
    portalsFound.forEach(function(portal) {
      handlePortal.apply(null, portal);
    });
  } else {
    // If scanning by line fails, or only one portal is found,
    // try to scan for a portal in the entire text and handle it
    scanForOnePortal(text, handlePortal);
  }
};
