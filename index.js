var express = require('express');
var PortalData = require('./portal-data').PortalData;
var storage = require('./storage');
var ipb = require('./ipb').page;
var dofusForum = require('./dofus-forum').page;
var eventsource = require('express-eventsource');

var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(function(request, response, next) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

function ServerHandler(name, url, pageParser) {
  this.name = name;
  this.url = url;
  this.pageParser = pageParser;
  this.data = null;
  this.sse = eventsource({pingInterval: 25000});
}
ServerHandler.prototype.start = function() {
  app.get('/' + this.name, function(request, response) {
    response.setHeader('Cache-Control', 'Public');
    if(this.data) {
      response.send(this.data);
    } else {
      response.status(502).json({error: 'Error opening the forum'});
    }
  });
  app.get('/watch/' + this.name, function(request, response, next) {
    response.setHeader('Cache-Control', 'no-cache');
    response.connection.setTimeout(0);
    next();
  }, this.sse.middleware());
  this.load();
  this.refresh();
  setInterval(this.refresh.bind(this), 180000);
};
ServerHandler.prototype.load = function() {
  storage.get(this.name, function(data) {
    if(!this.data) {
      this.data = data;
    }
  });
};
ServerHandler.prototype.refresh = function() {
  var self = this;
  new PortalData(this.url, this.pageParser).get().then(function(data) {
    if(data && JSON.stringify(data) !== JSON.stringify(self.data)) {
      self.data = data;
      storage.set(self.name, data);
      self.sse.sender()(data);
    }
  });
};

new ServerHandler('Rushu',
  'http://impsvillage.com/forums/topic/144221-rushu-dimension-portal-positions/', ipb).start();
new ServerHandler('Rosal',
  'http://impsvillage.com/forums/topic/144665-rosal-dimensional-portal-positions/', ipb).start();
new ServerHandler('Shika',
  'http://impsvillage.com/forums/topic/144721-shika-dimensional-portal-positions/', ipb).start();
new ServerHandler('Solar',
  'http://impsvillage.com/forums/topic/145255-solar-dimension-portal-positions/', ipb).start();
new ServerHandler('Zatoishwan',
  'http://forum.dofus.com/en/1045-zatoishwan/319280-zato-dimension-portal-positions', dofusForum).start(); 
new ServerHandler('Test',
 'http://impsvillage.com/forums/topic/149030-test-server-dimension-portal-positions/', ipb).start();

