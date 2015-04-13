var express = require('express');
var app = express();
var fs = require("fs");

function readJsonFileSync(filepath, encoding){
  if (typeof (encoding) === 'undefined'){
      encoding = 'utf8';
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

function getConfig(file){
  var filepath = __dirname + '/' + file;
  return readJsonFileSync(filepath);
}

app.get('/', function(req, res) {
  fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
      res.send(text);
  });
})

app.get('/getEvents', function(req, res){
  var json = getConfig('public/content/json/events.json');
  res.json(json);
});

app.get('/getGroupedEvents', function(req, res){
  var json = getConfig('public/content/json/grouped-events.json');
  res.json(json);
});

app.use(express.static('public'));
app.use(express.static('files'));

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
