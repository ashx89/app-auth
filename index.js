global.__base = __dirname;

var express = require('express');
var app = express();

var mongoose = require('mongoose');

var token = require('app-util').token;

module.exports = function onAuthExport(config) {
	mongoose.connect(config.get('database'));

	token.setConfig(config);

	/**
	 * Authentication Routes
	 */
	app.post('/auth/login', require('./components/login'));
	app.post('/auth/logout', require('./components/logout'));
	app.post('/auth/register', require('./components/register'));

	return app;
};
