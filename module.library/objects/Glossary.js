import { BaseClass } from '../../core.apparatus/objects/BaseClass.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';

// Singleton dashboard/folder-note for a context library's glossary/
// subfolder. One per library, filename always "Glossary" -- auto-created by
// library-create-library.js alongside the Library note itself, never
// created via its own standalone command.
export class Glossary extends BaseClass {
	static classValue = 'glossary';

	static categoryOptions() {
		return null;
	}

	constructor(app, options = {}) {
		super(app, {
			...options,
			filename: 'Glossary',
		});

		this.libraryName = options.libraryName ?? '';
		this.libraryTag = options.libraryTag ?? '';
	}

	// Resolves to the enclosing library's fixed glossary/ folder -- the same
	// target Definition.resolveFolder() resolves to, so the Glossary note
	// and the Definition notes it indexes live side by side.
	static async resolveFolder(app) {
		const libraryFolder = resolveLibraryFolder(app);
		return `${ libraryFolder }/glossary`;
	}

	getBody() {
		const glossaryBaseFilename = `${ this.libraryName } Glossary.base`;

		return [
			'## Contents',
			'---',
			'```toc',
			'```',
			'',
			'## Guidelines',
			'---',
			'',
			'## All Terms',
			'---',
			`![[${ glossaryBaseFilename }]]`,
			'',
			'## By Category',
			'---',
			'```dataview',
			'TABLE short-definition AS "Definition"',
			`FROM #${ this.libraryTag }`,
			'WHERE class = "definition"',
			'SORT category ASC, file.name ASC',
			'```',
			'',
			'## Change Log',
			'---',
			'',
		].join('\n');
	}
}

// Builds the companion Glossary .base file's content -- scopes the table to
// this library's own tag plus class == "definition", excluding the
// Glossary note itself (class: glossary, not definition). Exported
// standalone so every command that needs to create or backfill this file
// (library-create-library.js, library-create-glossary.js) shares one
// implementation rather than maintaining separate copies.
export function buildGlossaryBaseContent(libraryTag) {
	return [
		'filters:',
		'  and:',
		`    - file.hasTag("${ libraryTag }")`,
		'    - \'class == "definition"\'',
		'views:',
		'  - type: table',
		'    name: Glossary',
		'    order:',
		'      - file.name',
		'      - category',
		'      - short-definition',
		'',
	].join('\n');
}