var token = require('app-util').token;

/**
 * When to expire token
 */
var TOKEN_EXPIRY = 60 * 1;

/**
 * Used to set the response cookie
 */
var COOKIE_NAME = 'user';

/**
 * User Model
 */
var User = require(__base + '/models/user');

/**
 * Login authenticaton function
 */
var login = function onLogin(req, res, next) {
	var email = req.body.email;
	var password = req.body.password;

	if (!email || !password) return next(new Error('Invalid email or password'));

	User.findOne({ email: email }, function onFindUser(err, doc) {
		if (err) return next(err);
		if (!doc) return next(new Error('Account does not exist'));

		doc.comparePassword(password, function onComparePassword(err, match) {
			if (err) return next(err);
			if (!match) return next(new Error('Incorrect password'));

			res.cookie(COOKIE_NAME, token.create(doc.toJSON(), { expiresIn: TOKEN_EXPIRY }, { httpOnly: true }));
			if (!err && match) return res.status(200).json(doc);
		});
	});
};

module.exports = login;
