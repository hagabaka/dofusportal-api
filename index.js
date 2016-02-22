var express = require('express');
var portalData = require('./portal-data').portalData;
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

function handleServer(name, url, pageParser) {
  var data = portalData(url, pageParser);
  if(data) {
    storage.set(name, data);
  } else {
    storage.get(name, function(storedData) {
      data = storedData;
    });
  }
  var sse = eventsource({pingInterval: 25000});

  setInterval(function() {
    var newData = portalData(url, pageParser);
    if(newData && JSON.stringify(newData) !== JSON.stringify(data.toString())) {
      data = newData;
      storage.set(name, data);
      sse.sender()(data);
    }
  }, 180000);

  app.get('/' + name, function(request, response) {
    response.setHeader('Cache-Control', 'Public');
    if(data) {
      response.send(data);
    } else {
      response.status(502).json({error: 'Error opening ImpsVillage'});
    }
  });
  app.get('/watch/' + name, function(request, response, next) {
    response.setHeader('Cache-Control', 'no-cache');
    response.connection.setTimeout(0);
    next();
  }, sse.middleware());
}

handleServer('Rushu',
  'http://impsvillage.com/forums/topic/144221-rushu-dimension-portal-positions/', ipb);
handleServer('Rosal',
  'http://impsvillage.com/forums/topic/144665-rosal-dimensional-portal-positions/', ipb);
handleServer('Shika',
  'http://impsvillage.com/forums/topic/144721-shika-dimensional-portal-positions/', ipb);
handleServer('Solar',
  'http://impsvillage.com/forums/topic/145255-solar-dimension-portal-positions/', ipb);
handleServer('Zatoishwan',
  'http://forum.dofus.com/en/1045-zatoishwan/319280-zato-dimension-portal-positions', dofusForum); 
handleServer('Test',
 'http://impsvillage.com/forums/topic/149030-test-server-dimension-portal-positions/', ipb);

