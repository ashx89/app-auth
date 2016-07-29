var token = require('app-util').token;

var COOKIE_NAME = 'user';

var User = require(global.__auth_base + '/models/user');
var Account = require(global.__base + '/manager').AccountModel;

/**
 * Register authenticaton function
 */
var register = function onRegister(req, res, next) {
	var user = new User(req.body);

	req.checkBody('email', 'Invalid Email').isEmail();

	var errors = req.validationErrors()[0];
	if (errors) return res.status(400).json(errors);

	User.findOne({ email: user.email }, function onFindUser(err, exists) {
		if (err) return next(err);
		if (exists) return next(new Error('Account already exists'));

		user.save(function onUserSave(err) {
			if (err) return next(err);

			Account.findOne({ user: user._id }, function onFindAccount(err, exists) {
				if (err) return next(err);
				if (exists) return next(new Error('Account already exists'));

				var account = new Account();
				account.user = user._id;

				account.save(function onUserSave(err) {
					if (err) return next(err);

					user.resource = process.env.S3_BUCKET_URL + user._id + '/';

					user.save(function onUserSave(err) {
						if (err) return next(err);

						var tokenObject = user.toJSON();
						tokenObject.account = account._id;

						res.cookie(COOKIE_NAME, token.create(tokenObject, { expiresIn: process.env.USER_TOKEN_EXPIRY }), { httpOnly: true });
						return res.status(200).json(user);
					});
				});
			});
		});
	});
};

module.exports = register;
