import { BaseClass } from '../../../lib/objects/BaseClass.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import {
	resolveNoteTitles,
	resolveNoteLinksLenient,
	toWikilink,
} from '../controls/resolve-titles.js';

// Strips a single leading "a/an/the" from a filename for sort purposes,
// matching the derivation Work leaves use for sort-title.
function deriveSortTitle(filename) {
	return filename.replace(/^(a|an|the)\s+/i, '');
}

// A single glossary term. Never touches the citation engine -- extends
// BaseClass directly, not Works. Lives in the enclosing library's glossary/
// folder alongside the Glossary dashboard note.
export class Definition extends BaseClass {
	static classValue = 'definition';

	static categoryOptions() {
		return [
			'terminology',
			'concept',
			'movement',
			'technique',
			'genre',
		];
	}

	constructor(app, options = {}) {
		super(app, options);

		this.sortTitle = deriveSortTitle(this.filename);
		// Obsidian's own special property -- left as a plain free-text
		// array with no custom resolution.
		this.aliases = options.aliases ?? [];
		this.shortDefinition = options.shortDefinition ?? '';

		// Curator-entered, never Accession-populated -- eager, throwing
		// resolution since a broken reference-work link is treated as an
		// error, not a tolerated cross-reference.
		this.referenceWork = resolveNoteTitles(
			app,
			this.path,
			options.referenceWork ?? []
		).map(toWikilink);

		// Cross-references other Definition notes -- eager, lenient,
		// tolerating an unresolvable link rather than throwing.
		this.related = resolveNoteLinksLenient(
			app,
			this.path,
			options.related ?? []
		);

		// context is already raw on `this` via BaseClass's own constructor;
		// layer the same eager-lenient resolution on top of it that
		// Works.js applies to its own context field.
		this.context = resolveNoteLinksLenient(app, this.path, this.context);
	}

	// Resolves to the enclosing library's fixed glossary/ folder -- the same
	// target Glossary.resolveFolder() resolves to.
	static async resolveFolder(app) {
		const libraryFolder = resolveLibraryFolder(app);
		return `${ libraryFolder }/glossary`;
	}

	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();

		return {
			class: base.class,
			category: base.category,
			affiliations: base.affiliations,
			'sort-title': this.sortTitle,
			aliases: this.aliases,
			created: base.created,
			modified: base.modified,
			'short-definition': this.shortDefinition,
			'reference-work': this.referenceWork,
			related: this.related,
			context: base.context,
			tags: base.tags,
		};
	}

	getBody() {
		return [
			'## definition',
			'---',
			'',
		].join('\n');
	}
}