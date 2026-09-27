import { BaseClass } from '../../core.apparatus/objects/BaseClass.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';

// Reference class resolved against by resolve-authors.js at citation
// time. Represents a contributor referenced from authors/editors/
// translators/interviewer/interviewee fields across the Library module.
export class Author extends BaseClass {
	static classValue = 'author';

	// Closed vocabulary describing which role(s) this Author plays across
	// the corpus. Descriptive only -- has no effect on picker scoping,
	// cascade behavior, or citation resolution.
	static categoryOptions() {
		return [
			'author',
			'editor',
			'translator',
			'interviewer',
			'interviewee',
		];
	}

	// Resolves the enclosing library's fixed authors/ folder from the
	// active file's location. Throws if the active file isn't inside a
	// library.
	static async resolveFolder(app) {
		const startFolderPath = app.workspace.getActiveFile()?.parent?.path ?? '';
		const libraryFolder = resolveLibraryFolder(app, startFolderPath);
		return `${ libraryFolder }/authors`;
	}

	constructor(app, options = {}) {
		super(app, options);

		this.prefix = options.prefix ?? '';
		this.firstName = options.firstName ?? '';
		this.lastName = options.lastName ?? '';
		this.suffix = options.suffix ?? '';
		this.collections = options.collections ?? [];
		this.works = options.works ?? [];
		this.homepage = options.homepage ?? '';
	}

	getBody() {
		return `## works

\`\`\`dataview
TABLE without ID
	file.link AS Title,
	year as "Year Published",
	collections AS Collections
FROM
	#catalog-works
WHERE
	contains(authors, [[${ this.filename }]]) OR
	contains(editors, [[${ this.filename }]]) OR
	contains(translators, [[${ this.filename }]]) OR
	contains(interviewer, [[${ this.filename }]]) OR
	contains(interviewee, [[${ this.filename }]])
\`\`\`

### Authored

\`\`\`dataview
TABLE without ID
	file.link AS Title,
	year as "Year Published",
	collections AS Collections
FROM
	#catalog-works
WHERE
	contains(authors, [[${ this.filename }]])
\`\`\`

### Edited

\`\`\`dataview
TABLE without ID
	file.link AS Title,
	year as "Year Published",
	collections AS Collections
FROM
	#catalog-works
WHERE
	contains(editors, [[${ this.filename }]])
\`\`\`

### Translated

\`\`\`dataview
TABLE without ID
	file.link AS Title,
	year as "Year Published",
	collections AS Collections
FROM
	#catalog-works
WHERE
	contains(translators, [[${ this.filename }]])
\`\`\`

### Interviews

\`\`\`dataview
TABLE without ID
	file.link AS Work,
	contains(interviewee, [[${ this.filename }]]) AS Interviewee,
	contains(interviewer, [[${ this.filename }]]) AS Interviewer
FROM
	#catalog-works
WHERE
	contains(interviewer, [[${ this.filename }]]) OR
	contains(interviewee, [[${ this.filename }]])
\`\`\``;
	}

	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();
		return {
			class: base.class,
			category: base.category,
			affiliations: base.affiliations,
			created: base.created,
			modified: base.modified,
			prefix: this.prefix,
			'first-name': this.firstName,
			'last-name': this.lastName,
			suffix: this.suffix,
			collections: this.collections,
			works: this.works,
			homepage: this.homepage,
			context: this.context,
			tags: base.tags,
		};
	}
}