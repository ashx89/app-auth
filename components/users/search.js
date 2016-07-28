var _ = require('underscore');

var User = require(global.__auth_base + '/models/user');
var Account = require(global.__base + '/manager').AccountModel;

var search = function onFetch(req, res, next) {
	var data = {};

	var resultsObject = {
		items: []
	};

	User.paginate({}, {
		page: (req.query.page) ? parseInt(req.query.page, 10) : 1,
		limit: (req.query.limit) ? parseInt(req.query.limit, 10) : parseInt(process.env.APPLICATION_SEARCH_LIMIT, 10),
		sort: (req.query.sort) ? req.query.sort.replace(/,/g, ' ') : 'lastname',
		select: (req.query.select) ? req.query.select.replace(/,/g, ' ') : undefined,
	}).then(function onPaginate(result) {
		if (!result.docs.length) return next(new Error('Users not found'));

		resultsObject.found = {
			total: result.total,
			limit: result.limit,
			page: result.page,
			pages: result.pages
		};

		result.docs.forEach(function onEachUser(user, index) {
			Account.findOne({ user: user._id }, function onFind(err, account) {
				if (err) return next(err);

				data = _.extend(data, account);
				data.account_id = account._id;

				data._id = user._id;
				data.firstname = user.firstname;
				data.lastname = user.lastname;
				data.fullname = user.fullname;
				data.resource = user.resource;
				data.roles = user.roles;
				data.email = user.email;
				data.createdAt = user.createdAt;
				data.updatedAt = user.updatedAt;

				resultsObject.items.push(data);

				if (result.docs.length === index + 1) return res.status(200).json(resultsObject);
			});
		});
	});
};

module.exports = search;
