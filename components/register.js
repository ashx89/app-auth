var token = require('app-util').token;

/**
 * When to expire token
 */
var TOKEN_EXPIRY = process.env.USER_TOKEN_EXPIRY;

/**
 * Used to set the response cookie
 */
var COOKIE_NAME = 'user';

/**
 * User Model
 */
var User = require(__base + '/models/user');

/**
 * Register authenticaton function
 */
var register = function onRegister(req, res, next) {
	var user = new User(req.body);

	// Schema model not picking up isEmail validation
	req.checkBody('email', 'Invalid Email').isEmail();

	var errors = req.validationErrors()[0];
	if (errors) return res.status(400).json(errors);

	User.findOne({ email: user.email }, function onFindUser(err, exists) {
		if (err) return next(err);
		if (exists) return next(new Error('Account already exists'));

		user.save(function onUserSave(err) {
			if (err) return next(err);

			res.cookie(COOKIE_NAME, token.create(user.toJSON(), { expiresIn: TOKEN_EXPIRY }), { httpOnly: true });
			return res.status(200).json(user);
		});
	});
};

module.exports = register;
