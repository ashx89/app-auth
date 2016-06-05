var COOKIE_NAME = 'user';

var logout = function onLogout(req, res) {
	res.cookie(COOKIE_NAME, null, { expires: new Date() });
	return res.status(200).json({ message: 'Logged out' });
};

module.exports = logout;
