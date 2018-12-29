const proxy = require('http-proxy-middleware');

module.exports = function (app) {
	console.log('fuck off')
	app.use(proxy('/api/ingest', { target: 'http://10.32.0.126:1965/', pathRewrite: { '^/api/ingest': '' } }));
}