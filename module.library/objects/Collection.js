import { Aggregate } from './Aggregate.js';
import { computeCitation } from '../citation/citation-engine.js';
import { resolveNoteTitle, toWikilink } from '../controls/resolve-titles.js';
import { resolveNoteFile } from '../controls/resolve-note-file.js';
import { appendToFrontmatterArray } from '../controls/append-to-frontmatter-array.js';

// A single periodical issue (when `periodical` is set) or a standalone
// authored/edited volume (anthology, essay collection, festschrift).
// `periodical`/`volume`/`issue` are the source of truth other leaves
// (e.g. Article) resolve against via resolveCollectionFields() -- they
// are not duplicated on those leaves. A periodical-issue Collection
// does not get its own citation -- see formatCollection in each style
// module -- `citation` is left empty in that case, key still declared
// for frontmatter shape consistency across every Collection.
export class Collection extends Aggregate {
	static classValue = 'collection';

	static categoryOptions() {
		return [
			'anthology',
			'essay-collection',
			'fiction',
			'poetry',
			'festschrift'
		];
	}

	constructor(app, options = {}) {
		super(app, options);

		this.sortTitle = options.sortTitle ?? '';
		this.shortName = options.shortName ?? '';
		this.dateCataloged = options.dateCataloged ?? '';
		this.year = options.year ?? '';
		this.periodical = options.periodical
			? toWikilink(resolveNoteTitle(app, this.path, options.periodical))
			: '';
		this.volume = options.volume ?? '';
		this.issue = options.issue ?? '';
		this.translators = options.translators ?? [];
		this.works = options.works ?? [];
		this.source = options.source ?? '';
		this.cover = options.cover ?? '';
		this.coverCard = options.coverCard ?? '';
		this.themes = options.themes ?? [];
		this.keywords = options.keywords ?? [];
		this.contentWarnings = options.contentWarnings ?? [];

		this.citation = computeCitation(
			app,
			this.path,
			this.folder,
			Collection.classValue,
			{
				title: this.filename,
				authors: this.authors,
				editors: this.editors,
				translators: this.translators,
				year: this.year,
				periodical: options.periodical,
				publisher: this.publisher,
				placeOfPublication: this.placeOfPublication,
			}
		);
	}

	// Pushes this Collection itself into its Periodical's collections
	// array, if it has one set.
	async postCreate(file) {
		await super.postCreate(file);

		if (this.periodical) {
			const periodicalFile = resolveNoteFile(this.app, this.path, this.periodical);
			await appendToFrontmatterArray(this.app, periodicalFile, 'collections', toWikilink(this.filename));
		}
	}

	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();
		const aggregate = this.aggregateFrontmatterFields();
		return {
			class: base.class,
			category: base.category,
			affiliations: base.affiliations,
			'sort-title': this.sortTitle,
			'short-name': this.shortName,
			'catalog-status': aggregate['catalog-status'],
			created: base.created,
			modified: base.modified,
			'date-cataloged': this.dateCataloged,
			year: this.year,
			periodical: this.periodical,
			volume: this.volume,
			issue: this.issue,
			authors: aggregate.authors,
			editors: aggregate.editors,
			translators: this.translators,
			works: this.works,
			publisher: aggregate.publisher,
			'place-of-publication': aggregate['place-of-publication'],
			citation: this.citation,
			source: this.source,
			cover: this.cover,
			'cover-card': this.coverCard,
			genres: aggregate.genres,
			themes: this.themes,
			keywords: this.keywords,
			'content-warnings': this.contentWarnings,
			context: base.context,
			tags: base.tags,
		};
	}

	getBody() {
		return `# ${this.filename}

## abstract
---

<!-- Summary of the collection. -->

## notes
---

<!-- Reading notes, reactions, relevant excerpts. -->`;
	}
}