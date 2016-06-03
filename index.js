var express = require('express');
var app = express();

var token = require('app-util').token;

module.exports = function (config) {

	token.setConfig(config);

	/**
	 * Authentication Middleware
	 */
	app.use(require('express-validator')());

	/**
	 * Authentication Routes
	 */
	app.get('/auth/login', require('./app/login'));
	app.get('/auth/logout', require('./app/logout'));
	app.get('/auth/register', require('./app/register'));

	return app;
};
