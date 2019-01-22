import 'whatwg-fetch';

import IAirTower from './IAirTower';

import CoreAirTower from './CoreAirTower';
import IngestAirTower from './IngestAirTower';

/**
 * AirTower abstracts all network calls to the backend to hide complexity.
 */
export default class AirTower extends IAirTower {
	
	static getInstance () {

		if (!AirTower.instance)
			AirTower.instance = new AirTower();

		return AirTower.instance;

	}

	static register (name, className) {
		AirTower.getInstance().register(name, className);
	}

	constructor () {
		super();
		this.airtowers = [];
	}

	register (name, className) {
		let tower = new className();

		this.airtowers.push(tower)
		this[name] = tower;
	}

	/**
	 * Returns a promise that resolves once the airtowers have bootstrapped.
	 */
	bootstrap () {
		return Promise.all(this.airtowers.map((a) => a.bootstrap())).catch((e) => false);
	}

}

AirTower.register('ingest', IngestAirTower);
AirTower.register('core', CoreAirTower);
