import IAirTower from './IAirTower';

import CoreImport from './models/CoreImport';

export default class CoreAirTower extends IAirTower {

	fetch (url, query, options, root = '') {
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
	 * Find all active imports from service
	 *
	 * Returns a promise that resolves with the specified import.
	 */
	findImportByID (importID) {
		return this.fetch('/_/imports')
			.then ((response) => {
				if (response.success != 1) {
					throw new Error('Failed to load a list of imports from the server!')
				}

				let importObj = response['imports'].find((imp) => imp.uuid == importID)

				if (!importObj) {
					throw new Error('Could not find import on backend')
				}

				return new CoreImport(importObj);
			})
	}

	takeOwnership (serviceName, importID) {
		return this.fetchWithForm('/_/import/new', {}, {
			service: serviceName,
			uuid: importID
		}).catch((e) => null)
	}

}
