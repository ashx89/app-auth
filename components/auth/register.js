var async = require('async');
var token = require('app-util').token;

var COOKIE_NAME = 'user';

var User = require(global.__auth_base + '/models/user');
var Account = require('app-accounts').model;

var register = function onRegister(req, res, next) {
	var user = new User(req.body);

	async.waterfall([
		function validateEmail(callback) {
			req.checkBody('email', 'Invalid Email').isEmail();
			var errors = req.validationErrors()[0];
			if (errors) return res.status(400).json(errors);

			return callback(null);
		},
		function createUser(callback) {
			User.findOne({ email: user.email }, function onFindUser(err, exists) {
				if (err) return callback(err);
				if (exists) return callback(new Error('User already exists'));
				user.save(function onUserSave(err) {
					if (err) return callback(err);
					user.resource = process.env.S3_BUCKET_URL + user._id + '/';
					return callback(null, user);
				});
			});
		},
		function createAccount(user, callback) {
			Account.findOne({ user: user._id }, function onFindAccount(err, exists) {
				if (err) return callback(err);
				if (exists) return callback(new Error('Account already exists'));

				var account = new Account({ user: user._id });

				account.save(function onAccountSave(err) {
					if (err) return callback(err);
					return callback(null, user, account);
				});
			});
		},
		function saveAndReturnToken(user, account, callback) {
			user.save(function onUserSave(err) {
				if (err) return callback(err);

				var tokenObject = user.toJSON();
				tokenObject.account = account._id;

				res.cookie(COOKIE_NAME, token.create(tokenObject, { expiresIn: process.env.USER_TOKEN_EXPIRY }), { httpOnly: true });

				return callback(null, user);
			});
		}
	], function onComplete(err, user) {
		if (err) return next(err);
		return res.status(200).json(user);
	});
};

module.exports = register;
