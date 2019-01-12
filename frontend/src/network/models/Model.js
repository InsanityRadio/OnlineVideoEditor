/**
 * Model allows us to represent data loaded from the server. 
 * It allows us to quickly create a model, including child models, from a single object from a JSON response.
 * 
 * By using Object.defineProperty, we can rightly make this data structure immutable.
 */
export default class Model {

	constructor (data) {
		if (!data) {
			return;
		}
		this.initialize(data);
	}

	initialize (data) {
		// Lazy initialize all our getters, as we can't define them pre-super call.
		for (var key in data) {
			this['_' + key] = data[key];
		}
	}

	get (attribute) {

		let structure = this['a_' + attribute];
		let params = this['b_' + attribute];
		if (!structure) {
			return this['_' + attribute];
		}

		return this['_' + attribute].map((a) => new structure(a, params));

	}

	set (attribute, value) {
		this['_' + attribute] = value;
		return this;
	}

	/*
	 * Create the appropriate getters for an attribute. Can be passed a class to be used as a constructor.
	 */
	attr_reader (attribute, structure, array, params) {

		if (array && structure) {
			this['a_' + attribute] = structure;
			this['b_' + attribute] = params;
			Object.defineProperty(this, attribute, {
				get: function () {
					return this.get(attribute);
				}.bind(this)
			})
		} else {
			Object.defineProperty(this, attribute, {
				get: function () {
					return structure ? new structure(this.get(attribute)) : this.get(attribute);
				}.bind(this)
			})
		}

	}

}