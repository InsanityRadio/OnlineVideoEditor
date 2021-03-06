export default class IAirTower {

	fetch (url, query, options, root = '/api') {

		if (query != undefined) {
			var search = new URLSearchParams(query)
			url += '?' + search.toString();
		}

		if (!options) {
			options = {};
		}

		options.credentials = 'same-origin';

		if (!options.headers) {
			options.headers = {}
		}

		// Setting this header prevents the JsonCsrf web application firewall rule being triggered
		options.headers['X-Requested-With'] = 'XMLHttpRequest';

		return fetch(root + url, options)
			.then ((response) => this.checkResponse(response))
			.then ((response) => response.json());

	}

	checkResponse (response) {

		if (response.status >= 500) {
			console.error("Backend returned " + response.status);
		}

		return response;

	}

	fetchWithForm (url, query, form, options) {

		let data = new FormData();
		Object.keys(form).forEach(key => data.append(key, form[key]));

		let def = {
			method: 'POST',
			body: data
		};
		Object.assign(def, options || {})

		return this.fetch(url, query, def)

	}

	/**
	 * Upload a File object
	 */
	fetchWithFile (url, query, file, options) {
		return this.fetchWithForm(url, query, { file }, options);
	}

}