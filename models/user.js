var bcrypt = require('bcrypt');
var validator = require('validator');
var mongoose = require('mongoose');

function validLength (value) {
	return value && value.length >= 8;
};

function comparePassword (enteredPassword, callback) {
	bcrypt.compare(enteredPassword, this.password, function (err, isMatch) {
		if (err) return callback(err);
		return callback(null, isMatch);
	});
};

/**
 * User Data Model
 */
var userSchema = new mongoose.Schema({
	firstname: { type: String, validate: [validator.isAlpha, 'Invalid Firstname'] },
	lastname: { type: String, validate: [validator.isAlpha, 'Invalid Lastname'] },
	email: { type: String, required: true, lowercase: true, index: true, validate: [validator.isEmail, 'Invalid Email'] },
	password: { type: String, required: true, validate: [validLength, 'Password must be at least 8 characters'] },
	hash: String,
	salt: String,
	roles: { type: Array, default: ['user'] }
}, {
	minimize: true,
	timestamps: true
});

/**
 * User Data Model Methods
 */
userSchema.methods.comparePassword = comparePassword;

/**
 * User Data Model Virutals
 */
userSchema.virtual('fullname').get(function () {
	return this.firstname + ' ' + this.lastname;
});

/**
 * User Data Model Virutals
 */
userSchema.virtual('corporate').get(function () {
	return (this.roles.indexOf('corporate') > -1);
});

/**
 * Run when a new model has been created
 */
userSchema.pre('save', function (next) {
	var user = this;

	if (!user.isModified('password')) return next();

	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);

		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) return next(err);
			user.password = hash;
			return next();
		});
	});
});

/**
 * Run when a new model has been created
 */
userSchema.set('toJSON', {
	virtuals: true,
	transform: function (doc, ret, options) {
		delete ret.id;
		delete ret.__v;
		delete ret.password;
		delete ret.hash;
		delete ret.salt;
		//delete ret.role;
		return ret;
	}
});

module.exports = mongoose.model('User', userSchema);
