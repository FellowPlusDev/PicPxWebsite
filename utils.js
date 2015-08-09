var md5     = require('MD5');
var moment  = require('moment');
var shortId = require('shortid');
var _       = require('underscore');
var config  = require('./config/upyun.json');
var request = require('request').defaults({
  auth: {
    user: config.username,
    pass: config.password
  }
});

var utils = {};

utils.urlFor = function(endpoint) {
  return 'http://v0.api.upyun.com/' + config.bucket + endpoint;
};

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
};

function folderListHandler(line) {
  var parts = line.split('\t');

  // Returns only folders
  if (parts.length != 4 || parts[1] != 'F') {
    return null;
  } else {
    return parts[0];
  }
}

utils.getMonths = function(callback) {
  var url = utils.urlFor('/');
  request.get(url, function(err, response, body) {
    var lines  = (body || '').split('\n');
    var months = _.chain(lines).map(folderListHandler).compact()
                  .sort().reverse().value();

    callback(months);
  });
};

function fileListHandler(line) {
  var parts = line.split('\t');

  // Returns only folders
  if (parts.length != 4 || parts[1] != 'N') {
    return null;
  } else {
    return parts[0];
  }
}

utils.getPictures = function(month, callback) {
  var url = utils.urlFor('/' + month);
  request.get(url, function(err, response, body) {
    var lines = (body || '').split('\n');
    var files = _.chain(lines).map(fileListHandler).compact()
                 .map(function(filename) {
                   return config.baseUrl + month + '/' + filename;
                 }).value();

    callback(files);
  });
};

utils.removePicture = function(url) {
  console.log('Removing', url);

  var filename = url.replace(config.baseUrl, '');
  var fileUrl  = utils.urlFor('/' + filename);
  request.del(fileUrl);
};

module.exports = utils;