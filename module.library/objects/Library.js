import { BaseClass } from '../../core.apparatus/objects/BaseClass.js';

// Root/dashboard note for one context library. One per context library;
// real libraries extend this directly.
export class Library extends BaseClass {
	static classValue = 'library';

	constructor(app, options = {}) {
		super(app, options);

		this.libraryName = options.libraryName ?? '';
		// The vault tag scoping this library's notes, used to filter the
		// dashboard queries below to just this library.
		this.libraryTag = options.libraryTag ?? '';
		this.libraryStatus = options.libraryStatus ?? '';
		this.citationStyle = options.citationStyle ?? '';
		this.worksFolderName = options.worksFolderName ?? '';
		this.sortingSpec = options.sortingSpec ?? '';
		this.domain = options.domain ?? '';
		this.genres = options.genres ?? [];
		this.tone = options.tone ?? [];
		this.period = options.period ?? '';
	}

	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();
		return {
			class: base.class,
			category: base.category,
			affiliations: base.affiliations,
			created: base.created,
			modified: base.modified,
			'library-name': this.libraryName,
			'library-tag': this.libraryTag,
			'library-status': this.libraryStatus,
			'citation-style': this.citationStyle,
			'works-folder-name': this.worksFolderName,
			'sorting-spec': this.sortingSpec,
			domain: this.domain,
			genres: this.genres,
			tone: this.tone,
			period: this.period,
			context: base.context,
			tags: base.tags
		};
	}

	getBody() {
		return buildLibraryDashboard({
			libraryTag: this.libraryTag,
			libraryName: this.libraryName,
		});
	}
}

function buildLibraryDashboard({ libraryTag, libraryName }) {
	return `# contents

\`\`\`toc
\`\`\`

# library dashboard

## status distribution

\`\`\`dataview
TABLE without ID
	catalog-status AS Status,
	length(rows) AS Count
FROM
	#${ libraryTag } AND
	#catalog-works
GROUP BY
	catalog-status
SORT
	catalog-status ASC
\`\`\`

## recently cataloged

\`\`\`dataview
TABLE without ID
	file.link AS Title,
	authors AS Authors,
	year AS Year,
	catalog-status AS Status
FROM
	#${ libraryTag } AND
	#catalog-works
SORT
	date-cataloged DESC
LIMIT 10
\`\`\`

## bibliography

![[${ libraryName } Bibliography.base]]

## raw / tbr

\`\`\`dataview
TABLE without ID
	file.link AS Title,
	authors AS Authors,
	year AS Year,
	date-cataloged AS "Date Cataloged"
FROM
	#${ libraryTag } AND
	#catalog-works
WHERE
	contains(catalog-status, "raw") OR contains(catalog-status, "placeholder")
SORT
	date-cataloged DESC
\`\`\`

## authors

\`\`\`dataview
TABLE without ID
	author-link AS Author,
	length(rows) AS Works
FROM
	#${ libraryTag } AND
	#catalog-works
FLATTEN
	authors AS author-link
GROUP BY
	author-link
\`\`\`

## guidelines


## change log

`;
}