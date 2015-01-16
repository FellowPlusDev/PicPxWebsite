var express = require('express');
var router = express.Router();

var moment = require('moment');
var shortId = require('shortid');

// First consider commandline arguments and environment variables, respectively.
// Then load configuration from a designated file.
var config = require('../config/upyun.json');

var Upyun = require("ez-upyun").Upyun;
var upyun = new Upyun(config.bucket, config.username, config.password);

function generateFilename(fileExt) {
  var path = moment().format('YYYY/MM/DD');
  var filename = shortId.generate() + '.' + fileExt;
  return path + '/' + filename;
}

router.post('/upload', function(req, res) {
  var picture = req.files.picture;
  var filename = generateFilename(picture.extension);

  upyun.upload(picture.buffer, filename, picture.mimetype, function(err, result) {
    if (err) {
      console.error(err.message);
      res.render('index', { error: '上传失败' });
    } else {
      res.render('image', { url: config.baseUrl + filename })
    }
  });
});

module.exports = router;
