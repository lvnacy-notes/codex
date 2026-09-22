import { Log } from './logger';

// set log context
const logContext = {
	context: 'romanNumeralConversion',
	path: 'utilities/romanNumeralConversion.js'
};

export default function convertRomantoArabic(numeral) {

	const romanNumeralIndex = {
		'I': 1,
		'V': 5,
		'X': 10,
		'L': 50,
		'C': 100,
		'D': 500,
		'M': 1000
	};

	const numeralArray = numeral.toUpperCase().split('');

	try {

		return numeralArray.reduce((accumulator, current) => {

			// algorithm needs to be reworked
			// this is too simplistic and does not acurately produce a 
			// conversion
			console.log(romanNumeralIndex[current]);
			if (romanNumeralIndex[current] >= accumulator) {
				accumulator += romanNumeralIndex[current];
			} else {
				accumulator -= romanNumeralIndex[current];
			}
		}, 0);
	
	} catch(error) {
		Log.error(logContext, 'Error running Roman Numeral converter', error);
	};

}