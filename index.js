
module.exports = function (serverApp, config) {
	/**
	 * Routes :: Authentication
	 */
	serverApp.use(vhost(config.get('apiHost'), require('./app/authentication')(config)));

	return serverApp;
};
