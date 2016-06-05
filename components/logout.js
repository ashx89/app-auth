
var logout = function onLogout(req, res) {
	res.cookie('user', null, { expires: new Date() });
	return res.status(200).json({ message: 'Logged out' });
};

module.exports = logout;
