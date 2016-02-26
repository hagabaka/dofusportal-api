var $ = require('cheerio');
var dimensions = require('./names').dimensions;
var scanForCoordinates = require('./parser');

var MAX_PORTALS_PER_DIMENSION = 3;
var MAX_PAGE_COUNT = 3;
var ENOUGH_PORTALS = true;

function PortalData(url, pageParser) {
  this.url = url;
  this.pageParser = pageParser;
  this.portals = {};
  var portals = this.portals;
  dimensions.forEach(function(dimension) {
    portals[dimension] = [];
  });
  this.pageCount = 0;
}
PortalData.prototype.get = function() {
  var self = this;
  return this.pageParser(this.url).then(function(parsedPage) {
    return self.handleUrl(parsedPage.lastPage());
  }).catch(function(error) {
    console.log(error);
  });
};
PortalData.prototype.handleUrl = function(url) {
  this.pageCount++;
  console.log(url);
  var self = this;
  return this.pageParser(url).then(function(parsedPage) {
    var previousPage = parsedPage.previousPage();
    if(self.pageCount <= MAX_PAGE_COUNT &&
       previousPage &&
       self.appendData(parsedPage) !== ENOUGH_PORTALS
    ) {
      return self.handleUrl(previousPage);
    }
    return {
      portals: self.portals,
      source: self.url,
      edit: parsedPage.replyUrl()
    };
  });
};
PortalData.prototype.hasEnoughPortalsFor = function(dimension) {
  return this.portals[dimension].length >= MAX_PORTALS_PER_DIMENSION;
};
PortalData.prototype.appendData = function(parsedPage) {
  var self = this;
  if(dimensions.every(function(dimension) {
    return self.hasEnoughPortalsFor(dimension);
  })) {
    return ENOUGH_PORTALS;
  }
  parsedPage.posts().reverse().forEach(function(post) {
    var body = post.body;
    body.find('.ipsBlockquote').remove();
    body.find('p, br').each(function() {
      var $this = $(this);
      $this.text($this.text() + '\n');
    });
    scanForCoordinates(body.text(), function(dimension, coordinates, details) {
      if(!self.hasEnoughPortalsFor(dimension)) {
        self.portals[dimension].push({
          coordinates: coordinates,
          area: details.area,
          uses: details.uses,
          postingDate: post.postingDate,
          author: post.author
        });
      }
    });
  });
};

exports.PortalData = PortalData;
