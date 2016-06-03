var isValidId = require('mongoose').Types.ObjectId.isValid;

/**
 * User Model
 */
var model = require('./user');

/**
 * User Controller
 */
var user = {
	account: function (req, res, next) {
		model.findOne({ _id: req.user._id }, function (err, doc) {
			if (err) return next(err);
			return res.status(200).json(doc);
		});
	},

	fetch: function (req, res, next) {
		model.find({}, function (err, docs) {
			if (err) return next(err);
			return res.status(200).json(docs);
		});
	},

	fetchOne: function (req, res, next) {
		if (!isValidId(req.params.id)) return next();

		model.findOne({_id: req.params.id}, function (err, doc) {
			if (err) return next(err);
			return res.status(200).json(doc);
		});
	}
};

module.exports = user;
