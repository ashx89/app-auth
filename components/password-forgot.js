var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(process.env.PASSWORD_RESET_EMAIL);

/**
 * User Model
 */
var User = require(__base + '/models/user');

/**
 * Email Settings
 */
var mailOptions = {
	from: '"' + process.env.APPLICATION_NAME + ' 👥" <' + process.env.APPLICATION_EMAIL + '>',
	subject: 'Password Reset'
};

/**
 * Forgot Password function
 */
var passwordForgot = function onForgot(req, res, next) {
	req.checkBody('email', 'Invalid Email').isEmail();
	var errors = req.validationErrors()[0];
	if (errors) return res.status(400).json(errors);

	var email = req.body.email;

	async.waterfall([
		function createRandomToken(callback) {
			crypto.randomBytes(20, function onCrypto(err, buffer) {
				var token = buffer.toString('hex');
				return callback(err, token);
			});
		},
		function saveTokenToDatabase(token, callback) {
			User.findOne({ email: email }, function onFind(err, user) {
				if (err) return next(err);
				if (!user) return next(new Error('Account does not exist'));

				user.reset_password_token = token;
				user.reset_password_expiry = Date.now() + 3600000;

				user.save(function onSave(err) {
					return callback(err, token, user);
				});
			});
		},
		function sendResetEmail(token, user, callback) {
			var link = 'http://' + process.env.API_HOST + '/auth/password-reset?token=' + token;

			mailOptions.to = email;
			mailOptions.html = '<p>We\'ve received request to reset the password to this account.</p>\n\n';
			mailOptions.html += '<p>To reset your password, please click on this link (expires in 24 hours): ';
			mailOptions.html += '<a href="' + link + '">Reset Password</a></p>';

			transporter.sendMail(mailOptions, function onSendMail(err) {
				return callback(err, token);
			});
		}
	], function onComplete(err, token) {
		if (err) return next(err);
		return res.status(200).json(token);
	});
};

module.exports = passwordForgot;
