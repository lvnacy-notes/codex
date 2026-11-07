import { Log } from '../utils/logger.js';

/**
 * Throws when `expectedClass` is defined but is not an array of strings. `undefined` and an empty array are valid and mean no class restriction.
 * @param {*} expectedClass
 * @param {string} controlName Name of the calling control, used in the error message and log tag.
 * @throws {Error}
 */
export function validateExpectedClass(expectedClass, controlName) {
	if (expectedClass === undefined) {
		return;
	}
	const isValid = Array.isArray(expectedClass)
		&& expectedClass.every((value) => typeof value === 'string');
	if (!isValid) {
		const error = new Error(`${ controlName } expectedClass must be an array of strings, received: ${ JSON.stringify(expectedClass) }`);
		Log.error(
			controlName,
			error.message,
			error
		);
		throw error;
	}
}