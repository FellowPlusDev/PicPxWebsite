var express = require('express');
var moment = require('moment');
var shortId = require('shortid');
var md5 = require('MD5');

var config = require('../config/upyun.json');

var router = express.Router();


function makePolicy(image) {
  var fileExt = image.split('.').pop() || 'jpg';
  var path = moment().format('YYMM');
  var filename = '/' + path + '/' + shortId.generate() + '.' + fileExt;

  return new Buffer(JSON.stringify({
    'bucket': config.bucket,
    'save-key': filename,
    'expiration': moment().unix()+ 300
  })).toString('base64');
}

function makeSignature(policy) {
  var signature = policy + '&' + config.formApiSecret;

  return md5(signature);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/uptoken', function(req, res) {
  var image = req.body.image;

  console.log('Generating uptoken for image:', image);

  var policy = makePolicy(image);
  console.log('- ploicy:', policy);

  var signature = makeSignature(policy);
  console.log('- signature:', signature);
  
  res.json({ policy: policy, signature: signature });
});

module.exports = router;
