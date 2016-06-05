global.__base = __dirname;

var express = require('express');
var app = express();

var mongoose = require('mongoose');

var token = require('app-util').token;

module.exports = function onAuthExport(config) {
	mongoose.connect(process.env.DATABASE);

	//token.setConfig(config);

	/**
	 * Authentication Routes
	 */
	app.post('/auth/login', require('./components/login'));
	app.post('/auth/logout', require('./components/logout'));
	app.post('/auth/register', require('./components/register'));
	app.post('/auth/password-forgot', require('./components/password-forgot'));

	app.get('/auth/password-reset', require('./components/password-reset').get);
	app.post('/auth/password-reset', require('./components/password-reset').post);

	return app;
};
