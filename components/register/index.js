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
 * Register authenticaton function
 */
var register = function onRegister(req, res, next) {
	var user = new User(req.body);

	User.findOne({ email: user.email }, function onFindUser(err, exists) {
		if (err) return next(err);
		if (exists) return next(new Error('User already exists'));

		user.save(function onUserSave(err) {
			if (err) return next(err);

			res.cookie('user', token.create(user.toJSON(), { expiresIn: TOKEN_EXPIRY }), { httpOnly: true });
			return res.status(200).json(user);
		});
	});
};

module.exports = register;
