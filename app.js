var express    = require('express');
var bodyParser = require('body-parser');
var utils      = require('./utils')
var app        = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use('/assets', express.static('public'));
app.use('/assets/lib', express.static('bower_components'));

app.get('/', function(req, res, next) {
  res.render('index');
});

app.post('/uptoken', function(req, res) {
  var image = req.body.image;
  var policy = utils.makePolicy(image);
  var signature = utils.makeSignature(policy);

  res.json({ policy: policy, signature: signature });
});

module.exports = app;
