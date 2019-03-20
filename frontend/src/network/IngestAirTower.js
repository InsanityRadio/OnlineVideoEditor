import IAirTower from './IAirTower';

import Import from './models/Import';

export default class IngestAirTower extends IAirTower {

	fetch (url, query, options, root = '/ingest') {
		return super.fetch(root + url, query, options);
	}

	bootstrap () {
		return this.fetch('/bootstrap')
			.then ((response) => {
				this.setCSRFToken(response.csrf_token)
				this.setServices(response.services)
			})
	}

	setCSRFToken (token) {
		this.csrfToken = token;
	}

	setServices (services) {
		this.services = services;
	}

	getServices () {
		return this.services;
	}

	/**
	 * Import video from service between the specified UNIX times (seconds, not MS).
	 * 
	 * Returns a promise that resolves with an Import object representing our import.
	 */
	importVideo (service, startTime, endTime) {
		let data = {
			start_time: startTime,
			end_time: endTime
		};

		return this.fetchWithForm('/' + service + '/import', undefined, data)
			.then ((response) => {
				if (response.success != 1) {
					throw new Error('Import failed');
				}

				return new Import(response['data'], service);
			});
	}

	/**
	 * Find all active imports from service
	 *
	 * Returns a promise that resolves with an array of Import objects.
	 */
	findImports (service) {
		return this.fetch('/' + service + '/imports')
			.then ((response) => {
				if (response.success != 1) {
					throw new Error('Failed to load a list of imports from the server!')
				}

				return response.imports.map((importModel) => new Import(importModel, service));
			})
	}

	/**
	 * Find all active imports from service
	 *
	 * Returns a promise that resolves with the specified import.
	 */
	findImportByID (service, importID) {
		return this.fetch('/' + service + '/import/' + importID)
			.then ((response) => {
				if (response.success != 1) {
					throw new Error('Failed to load a list of imports from the server!')
				}

				return new Import(response['import'], service);
			})
	}

}
