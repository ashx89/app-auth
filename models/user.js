var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var paginate = require('mongoose-paginate');
var validator = require('mongoose-validators');

paginate.paginate.options = {
	sort: 'lastname',
	lean: true,
	limit: 10
};

function validLength(value) {
	return value && value.length >= 8;
}

/**
 * User Data Model
 */
var userSchema = new mongoose.Schema({
	firstname: {
		type: String,
		required: [true, 'Missing Firstname'],
		validate: [validator.isAlpha, 'Invalid Firstname']
	},
	lastname: {
		type: String,
		required: [true, 'Missing Lastname'],
		validate: [validator.isAlpha, 'Invalid Lastname']
	},
	email: {
		type: String,
		lowercase: true,
		index: true,
		required: [true, 'Missing Email Address'],
		validate: [validator.isEmail, 'Invalid Email']
	},
	password: {
		type: String,
		required: [true, 'Missing Password'],
		validate: [validLength, 'Password must be at least 8 characters']
	},
	hash: String,
	salt: String,
	reset_password_token: String,
	reset_password_expiry: String,
	resource: { type: String },
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
		delete ret.reset_password_token;
		delete ret.reset_password_expiry;
		return ret;
	}
});

/**
 * Add pagination to model
 */
userSchema.plugin(paginate);

module.exports = mongoose.model('User', userSchema);
