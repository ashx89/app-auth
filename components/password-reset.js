var async = require('async');
var token = require('app-util').token;
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(process.env.PASSWORD_RESET_EMAIL);

var TOKEN_EXPIRY = process.env.USER_TOKEN_EXPIRY;

var COOKIE_NAME = 'user';

/**
 * User Model
 */
var User = require(__base + '/models/user');

var mailOptions = {
	from: '"' + process.env.APPLICATION_NAME + ' 👥" <' + process.env.APPLICATION_EMAIL + '>',
	subject: 'Your password has been updated'
};

var passwordResetGet = function onReset(req, res, next) {
	var resetToken = req.query.token ? req.query.token : '';
	if (!resetToken) return next(new Error('No reset token found'));

	var query = { reset_password_token: resetToken, reset_password_expiry: { $gt: Date.now() } };

	User.findOne(query, function onFind(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Password reset token is invalid or has expired'));

		return res.status(200).json(user);
	});
};

/**
 * Login authenticaton function
 */
var passwordResetPost = function onReset(req, res, next) {
	var resetToken = req.query.token ? req.query.token : '';
	if (!resetToken) return next(new Error('No reset token found'));

	async.waterfall([
		function verifyPasswordResetToken(callback) {
			var query = { reset_password_token: resetToken, reset_password_expiry: { $gt: Date.now() } };

			User.findOne(query, function onFind(err, user) {
				if (err) return next(err);
				if (!user) return next(new Error('Password reset token is invalid or has expired'));

				user.password = req.body.password;
				user.reset_password_token = undefined;
				user.reset_password_expiry = undefined;

				user.save(function onSave(err) {
					res.cookie(COOKIE_NAME, token.create(user.toJSON(), { expiresIn: TOKEN_EXPIRY }, { httpOnly: true }));
					return callback(err, user);
				});
			});
		},
		function sendEmailConfirmation(user, callback) {
			mailOptions.to = user.email;
			mailOptions.html = '<h3>Password Changed Complete!</h3>\n\n';
			mailOptions.html += '<p>Your password has been updated for account: <b>' + user.email + '</b>';

			transporter.sendMail(mailOptions, function onSendMail(err) {
				return callback(err, user);
			});
		}
	], function onComplete(err, user) {
		if (err) return next(err);
		return res.status(200).json(user);
	});
};

module.exports = {
	get: passwordResetGet,
	post: passwordResetPost
};
