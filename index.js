global.__auth_base = __dirname;

var express = require('express');
var app = express();

app.post('/auth/login', require('./components/auth/login'));
app.post('/auth/logout', require('./components/auth/logout'));
app.post('/auth/register', require('./components/auth/register'));
app.post('/auth/password-forgot', require('./components/auth/password-forgot'));

app.get('/auth/password-reset', require('./components/auth/password-reset').get);
app.post('/auth/password-reset', require('./components/auth/password-reset').post);

app.get('/users/search', require('./components/users/search'));

module.exports = {
	app: app,
	model: require('./models/user')
};
