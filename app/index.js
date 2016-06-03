var express = require('express');
var app = express();

/**
 * Authentication Middleware
 */
app.use(require('express-validator'));

module.exports = function (config) {
	/**
	 * Authentication Routes
	 */
	app.get('/auth/register', require('./register'));

	return app;
};
