var token = require('app-util').token;

/**
 * When to expire token
 */
var TOKEN_EXPIRY = 60 * 1;

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
		if (!doc) return next(new Error('User does not exist'));

		doc.comparePassword(password, function onComparePassword(passwordErr, match) {
			if (passwordErr) return next(passwordErr);
			if (!match) return next(new Error('Incorrect password'));

			res.cookie('user', token.create(doc.toJSON(), { expiresIn: TOKEN_EXPIRY }, { httpOnly: true }));
			if (!passwordErr && match) return res.status(200).json(doc);
		});
	});
};

module.exports = login;
