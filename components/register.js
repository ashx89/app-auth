var token = require('app-util').token;

var COOKIE_NAME = 'user';

var USER_TOKEN_EXPIRY = process.env.USER_TOKEN_EXPIRY;

/**
 * User Model
 */
var User = require('../models/user');

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

			user.resource = process.env.S3_BUCKET_URL + user._id;

			user.save(function onUserSave(err) {
				if (err) return next(err);

				res.cookie(COOKIE_NAME, token.create(user.toJSON(), { expiresIn: USER_TOKEN_EXPIRY }), { httpOnly: true });
				return res.status(200).json(user);
			});
		});
	});
};

module.exports = register;
