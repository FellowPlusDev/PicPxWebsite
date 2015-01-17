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
  var path = moment().format('YYMM');
  var filename = shortId.generate() + '.' + fileExt;
  return path + '/' + filename;
}

router.post('/upload', function(req, res) {
  var image = req.files.image;
  var filename = generateFilename(image.extension);

  upyun.upload(image.buffer, filename, image.mimetype, function(err, result) {
    if (err) {
      console.error(err.message);
      res.json({ status: 'error', message: '上传失败' });
    } else {
      var url = config.baseUrl + filename;
      res.json({ status: 'success', message: url });
    }
  });
});

module.exports = router;
