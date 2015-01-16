var express = require('express');
var app = express();


app.listen(80);
console.log("app listening on port %d in %s mode", 80, app.settings.env);
