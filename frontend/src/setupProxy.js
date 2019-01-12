const proxy = require('http-proxy-middleware');

module.exports = function (app) {
	app.use(proxy('/api/ingest', {
		target: 'http://10.32.2.30/',
		pathRewrite: { '^/api/ingest': '' },
		headers: { 'Origin': 'http://localhost' }
	}));
}