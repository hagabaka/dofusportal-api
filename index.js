var express = require('express');
var portalData = require('./portal-data').portalData;

var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(function(request, response, next) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader('Cache-Control', 'Public, max-age=600');
  return next();
});

function handleServer(name, url) {
  var data = portalData(url);

  setInterval(function() {
    var newData = portalData(url);
    if(newData.toString() !== data.toString()) {
      data = newData;
    }
  }, 180000);

  app.get('/' + name, function(request, response) {
    console.log('Waiting for data');
    response.send(data);
  });
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

