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

app.get('/rushu', function(request, response) {
  response.send(portalData(
    'http://impsvillage.com/forums/topic/144221-rushu-dimension-portal-positions/'
  ));
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

