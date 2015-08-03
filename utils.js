var md5     = require('MD5');
var moment  = require('moment');
var shortId = require('shortid');
var config  = require('./config/upyun.json');

var utils = {};

utils.makePolicy = function(image) {
  var fileExt = image.split('.').pop() || 'jpg';
  var path = moment().format('YYMM');
  var filename = '/' + path + '/' + shortId.generate() + '.' + fileExt;

  return new Buffer(JSON.stringify({
    'bucket': config.bucket,
    'save-key': filename,
    'expiration': moment().unix()+ 300
  })).toString('base64');
};

utils.makeSignature = function(policy) {
  var signature = policy + '&' + config.formApiSecret;

  return md5(signature);
}

module.exports = utils;