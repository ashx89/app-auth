global.__base = __dirname;

var express = require('express');
var mongoose = require('mongoose');

var app = express();
var config = require('config');
var requireToken = require('./middleware/token').require();

/**
 * App Middleware
 */
app.use(require('express-validator')());
app.use(requireToken);

/**
 * Routes :: Authentication
 */

/**
 * Routes :: Error
 */
app.use(require('./middleware/error'));
