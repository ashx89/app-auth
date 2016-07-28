var token = require('app-util').token;

var COOKIE_NAME = 'user';

var USER_TOKEN_EXPIRY = process.env.USER_TOKEN_EXPIRY;

/**
 * User Model
 */
var User = require(global.__auth_base + '/models/user');

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

			res.cookie(COOKIE_NAME, token.create(doc.toJSON(), { expiresIn: USER_TOKEN_EXPIRY }, { httpOnly: true }));
			if (!err && match) return res.status(200).json(doc);
		});
	});
};

module.exports = login;
