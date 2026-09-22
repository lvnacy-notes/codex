import { Log } from './logger.js';

const logContext = {
	context: 'date validation',
	path: '.obsidian/js/utilities/dateValidation.js'
};

function dateWarning() {
	Log.info(logContext, 'Date regex validation failed');
	return '';
};

export function dateValidator(date) {
	const dateValidation = /^[0-9]{4}-(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-(0[1-9]|[1-2][0-9]|30)))$/;

	if (date === '' || undefined) {
		return '';
	};

	try {
		const confirmedDate = dateValidation.test(date) ? date : dateWarning();
		return confirmedDate;
	} catch(error) {
		Log.error(logContext, 'Date Validator fucked up. Go fix it.', error);
	};
};