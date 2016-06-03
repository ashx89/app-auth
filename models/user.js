var bcrypt = require('bcrypt');
var validator = require('mongoose-validators');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function validLength(value) {
	return value && value.length >= 8;
}

/**
 * User Data Model
 */
var userSchema = new Schema({
	firstname: {
		type: String,
		required: true,
		validate: [validator.isAlpha, 'Invalid Firstname']
	},
	lastname: {
		type: String,
		required: true,
		validate: [validator.isAlpha, 'Invalid Lastname']
	},
	email: {
		type: String,
		required: true,
		lowercase: true,
		index: true,
		validate: [validator.isEmail, 'Invalid Email']
	},
	password: {
		type: String,
		required: true,
		validate: [validLength, 'Password must be at least 8 characters']
	},
	hash: String,
	salt: String,
	roles: { type: Array, default: ['user'] }
}, {
	minimize: true,
	timestamps: true
});

/**
 * Compare the entered password to the stored password
 * @param {string} enteredPassword
 * @param {function} callback
 */
userSchema.methods.comparePassword = function onPasswordCompare(enteredPassword, callback) {
	bcrypt.compare(enteredPassword, this.password, function onBcryptCompare(err, isMatch) {
		if (err) return callback(err);
		return callback(null, isMatch);
	});
};

/**
 * User Data Model Virutals
 */
userSchema.virtual('fullname').get(function onGetFullname() {
	return this.firstname + ' ' + this.lastname;
});

/**
 * User Data Model Virutals
 */
userSchema.virtual('corporate').get(function onGetRole() {
	return (this.roles.indexOf('corporate') > -1);
});

/**
 * Run when a new model has been created
 */
userSchema.pre('save', function onModelSave(next) {
	var user = this;

	if (!user.isModified('password')) return next();

	bcrypt.genSalt(10, function onBcryptSalt(err, salt) {
		if (err) return next(err);

		bcrypt.hash(user.password, salt, function onBcryptHash(err, hash) {
			if (err) return next(err);
			user.password = hash;
			next();
		});
	});
});

/**
 * What to return when model is loaded
 */
userSchema.set('toJSON', {
	virtuals: true,
	transform: function onTransform(doc, ret) {
		delete ret.id;
		delete ret.__v;
		delete ret.password;
		delete ret.hash;
		delete ret.salt;
		return ret;
	}
});

module.exports = mongoose.model('User', userSchema);
