const proxy = require('http-proxy-middleware');

module.exports = function (app) {

	function proxyReq (proxyReq, req, res) {
		// This bypasses the JsonCsrf security check on the backend.
		// This won't be invoked in production.
		if (req.method == 'GET') {
			proxyReq.setHeader('Origin', 'http://localhost:3000')
		} else if (req.method == 'POST') {
			proxyReq.removeHeader('origin');
		}
	}

	app.use(proxy('/api/ingest', {
		target: 'http://video-ingest-revprox.insanityradio.com/',
		changeOrigin: false,
		headers: {
			host: 'video-ingest-revprox.insanityradio.com'
		},
		pathRewrite: { '^/api/ingest': '' },
		onProxyReq: proxyReq
	}));

	app.use(proxy('/api', {
		//target: 'http://10.32.2.31/',
		target: 'http://127.0.0.1:1964',
		onProxyReq: proxyReq
	}));
}