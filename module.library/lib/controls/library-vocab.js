// Controlled vocabularies for Works-tier and leaf-tier fields in the
// Library module. Mirrors Apparatus Library Property Taxonomy.md --
// modals import from here rather than defining their own copies, and
// this file is updated whenever that document changes.

import { FORMATTERS } from '../../citation/citation-engine.js';

export const CITATION_STYLE_OPTIONS = Object.keys(FORMATTERS);

export const CATALOG_STATUS_OPTIONS = [
	'raw',
	'active',
	'processed',
	'archived',
	'placeholder',
	'shelved'
];

export const CIRCULATION_OPTIONS = [
	'active',
	'hiatus',
	'ceased'
];

export const CONTENT_WARNING_GROUPS = {
	'Violence': [
        'violence',
        'graphic-violence',
        'torture',
        'war'
    ],
	'Sexual content': ['sexual-content', 'sexual-assault'],
	'Self-harm': ['self-harm', 'suicide'],
	'Substance use': ['substance-use', 'addiction'],
	'Abuse': ['domestic-abuse', 'child-abuse'],
	'Death and grief': [
        'death',
        'grief',
        'terminal-illness'
    ],
	'Discrimination and hate': [
		'racism',
		'homophobia',
		'transphobia',
		'misogyny',
		'antisemitism',
		'ableism',
	],
	'Medical and psychological': [
		'medical-content',
		'mental-illness',
		'eating-disorders',
	],
	'Other disturbing content': [
		'body-horror',
		'animal-harm',
		'disturbing-imagery',
	],
};

export const CONTENT_WARNINGS = Object.values(CONTENT_WARNING_GROUPS).flat();

export const FREQUENCY_OPTIONS = [
	'daily',
	'semiweekly',
	'weekly',
	'fortnightly',
	'monthly',
	'bimonthly',
	'quarterly',
	'semiannual',
	'annual',
	'biennial',
	'irregular',
];

export const LIBRARY_STATUS_OPTIONS = [
	'unbound',
	'active',
	'dormant',
	'musty',
	'archived'
];

export const RECORD_FORMAT_OPTIONS = [
	'CD',
	'vinyl',
	'cassette',
	'digital file',
	'streaming audio',
	'streaming video',
	'DVD',
	'Blu-ray',
	'podcast episode',
	'radio broadcast',
	'television broadcast',
	'film',
];

export const THESIS_DEGREE_OPTIONS = ['Doctoral', "Master's"];

export const WORK_LENGTH = [
	'flash-fiction',
	'short-story',
	'novelette',
	'novella',
	'novel',
	'serial'
]