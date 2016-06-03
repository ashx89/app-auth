global.__base = __dirname;

var express = require('express');
var app = express();

var mongoose = require('mongoose');
var token = require('app-util').token;

module.exports = function onAuthExport(config) {
	/**
	 * Connect to database
	 */
	mongoose.connect(config.get('database'));

	/**
	 * Set application token configuration
	 */
	token.setConfig(config);

	/**
	 * Authentication Middleware
	 */
	app.use(require('express-validator')());

	/**
	 * Authentication Routes
	 */
	app.post('/auth/login', require('./components/login'));
	app.post('/auth/logout', require('./components/logout'));
	app.post('/auth/register', require('./components/register'));

	app.get('/account', require('./models/controller').account);

	return app;
};
