var express = require('express');
var portalData = require('./portal-data').portalData;
var eventsource = require('express-eventsource');

var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(function(request, response, next) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});

function handleServer(name, url) {
  var data = portalData(url);
  var sse = eventsource({pingInterval: 25000});

  setInterval(function() {
    var newData = portalData(url);
    if(newData && JSON.stringify(newData) !== JSON.stringify(data.toString())) {
      data = newData;
      sse.sender()(data);
    }
  }, 180000);

  app.get('/' + name, function(request, response) {
    response.setHeader('Cache-Control', 'Public');
    response.send(data);
  });
  app.get('/watch/' + name, function(request, response, next) {
    response.setHeader('Cache-Control', 'no-cache');
    response.connection.setTimeout(0);
    next();
  }, sse.middleware());
}

handleServer('Rushu',
  'http://impsvillage.com/forums/topic/144221-rushu-dimension-portal-positions/');
handleServer('Rosal',
  'http://impsvillage.com/forums/topic/144665-rosal-dimensional-portal-positions/');
handleServer('Shika',
  'http://impsvillage.com/forums/topic/144721-shika-dimensional-portal-positions/');

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

