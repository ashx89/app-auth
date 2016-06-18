var express = require('express');
var app = express();

app.post('/auth/login', require('./components/login'));
app.post('/auth/logout', require('./components/logout'));
app.post('/auth/register', require('./components/register'));
app.post('/auth/password-forgot', require('./components/password-forgot'));

app.get('/auth/password-reset', require('./components/password-reset').get);
app.post('/auth/password-reset', require('./components/password-reset').post);

module.exports.app = app;

var User = require('./models/user');
module.exports.userModal = User;
