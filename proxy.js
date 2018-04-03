var express = require('express');
var proxy = require('http-proxy-middleware');

var app = express();

app.use('/api', proxy({target: 'news.163.com/', changeOrigin: true}));
app.listen(3002);
