/* eslint-disable no-console */
const { Notice } = await requireAsync('obsidian');

/**
 * Emergency (emerg): indicates that the system is unusable and requires immediate attention.
 * Alert (alert): indicates that immediate action is necessary to resolve a critical issue.
 * Critical (crit): signifies critical conditions in the program that demand intervention to prevent system failure.
 * Error (error): indicates error conditions that impair some operation but are less severe than critical situations.
 * Warning (warn): signifies potential issues that may lead to errors or unexpected behavior in the future if not addressed.
 * Notice (notice): applies to normal but significant conditions that may require monitoring.
 * Informational (info): includes messages that provide a record of the normal operation of the system.
 * Debug (debug): intended for logging detailed information about the system for debugging purposes.
 * 
 * @param { Object } context
 * @param { string } message
 * @param { Object } error
 * 
 */

export const Log = {

	fatal: (context, message, error) => {
		new Notice(`!FATAL! ${ message }\nCheck the console for details`);
		console.error(context, error ?? new Error(message));
	},

	error: (context, message, error) => {
		new Notice(`ERROR: ${ message }\nCheck the console for details`);
		console.error(context, error ?? new Error(message));
	},

	warn: (context, message, error) => {
		new Notice(`WARN: ${ message }\nCheck the console for details`);
		console.warn(context, error ?? new Error(message));
	},

	log: (context, message, item) => {
		new Notice(item ? `LOG: ${ message } ${ item }` : `LOG: ${ message }`);
		item ? console.log(context, message, item) : console.log(context, message);
	},

	info: (context, message, item) => {
		new Notice(`INFO: ${ message } ${ item }`);
		console.info(context, message, item);
	},

	debug: (context, message) => {
		new Notice(`DEBUG: ${ message }`);
		console.debug(context, message);
	},

	trace: (context, message) => {
		new Notice(`TRACE: ${ message }\nCheck console for details`);
		console.trace(context, message);
	}
};