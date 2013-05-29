var express = require('express');
var app = express();

/*var path = (require('path')).resolve('.');
app.use(express.static(path));
app.use(express.directory(path));
app.listen(8080);*/

// export the module for use with grunt
module.exports = app;