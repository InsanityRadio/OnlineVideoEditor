import IAirTower from './IAirTower';

import CoreImport from './models/CoreImport';
import Slate from './models/Slate';

export default class CoreAirTower extends IAirTower {

	fetch (url, query, options, root = '') {
		return super.fetch(root + url, query, options);
	}

	bootstrap () {
		return this.fetch('/bootstrap')
			.then ((response) => {
				this.setCSRFToken(response.csrf_token);
				this.setServices(response.services);
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

	loadImports () {
		return this.fetch('/_/imports')
			.then ((response) => {
				if (response.success != 1) {
					throw new Error('Failed to load a list of imports from the server!');
				}

				return response['imports'].map((imp) => new CoreImport(imp));
			});
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
					throw new Error('Failed to load a list of imports from the server!');
				}

				let importObj = response['imports'].find((imp) => imp.uuid == importID);

				if (!importObj) {
					throw new Error('Could not find import on backend');
				}

				return new CoreImport(importObj);
			});
	}

	takeOwnership (serviceName, importID, title) {
		return this.fetchWithForm('/_/import/new', {}, {
			service: serviceName,
			title: title,
			uuid: importID
		})
			.then((response) => this.createImportObj(response));
	}

	updateVideo (uuid, videoID, configuration) {
		return this.fetchWithForm('/import/' + uuid + '/' + videoID + '/save', {}, {
			configuration: configuration
		})
			.then((response) => this.createImportObj(response));
	}

	createVideoByType (uuid, type) {
		return this.fetchWithForm('/import/' + uuid + '/create_video', { type: type }, {})
			.then((response) => this.createImportObj(response));
	}

	deleteVideoById (uuid, videoID) {
		return this.fetchWithForm('/import/' + uuid + '/' + videoID + '/delete', {}, {})
			.then((response) => this.createImportObj(response));
	}

	loadRenderState (uuid) {
		return this.fetch('/import/' + uuid + '/render')
			.then((response) => {
				if (response.success != 1) {
					throw new Error('Failed to load render states for given import');
				}

				return response.renders;
			});
	}

	renderVideo (uuid, videoID) {
		return this.fetchWithForm('/import/' + uuid + '/' + videoID + '/render', {}, {})
			.then((response) => this.createImportObj(response));
	}


	createImportObj (response) {
		if (response.success != 1) {
			throw new Error('Failed to load a list of imports from the server!');
		}

		let importObj = response['import'];

		if (!importObj) {
			throw new Error('Could not find import on backend');
		}

		return new CoreImport(importObj);
	}

	createSlateObj (response) {
		if (response.success != 1) {
			throw new Error('Failed to load slate');
		}

		let slateObj = response['slate'];
		if (!slateObj) {
			throw new Error('Could not load slate from backend');
		}

		return new Slate(slateObj);
	}

	loadSlates () {
		return this.fetch('/slates/')
			.then((response) => {
				if (!response.success) {
					throw new Error('Failed to load list of slates from server');
				}

				let slates = response.slates.map((slateObj) => new Slate(slateObj));
				return slates;
			});
	}

	uploadSlate (name, videoFile, cuePoint) {
		return this.fetchWithFile('/slates/new', { name: name, cue_point: cuePoint }, videoFile)
			.then((response) => this.createSlateObj(response));
	}

	deleteSlate (id) {
		return this.fetchWithForm('/slates/delete', { id: id }, {});
	}

}
