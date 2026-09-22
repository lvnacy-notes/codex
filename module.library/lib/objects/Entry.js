import { Works } from './Works.js';

// Distinguishing fields: reference-work (a single wikilink to the
// Works note this entry appears within) and entry-term (the headword
// this entry is filed under). entry-term is passed as the citation's
// `title` instead of this.filename, since the entry-term is the
// entry's title-equivalent.
export class Entry extends Works {
	static classValue = 'entry';

	constructor(app, options = {}) {
		super(app, options);

		this.referenceWork = options.referenceWork ?? '';
		this.entryTerm = options.entryTerm ?? '';

		this.citation = this.computeCitation({
			title: this.entryTerm,
			authors: this.authors,
			editors: this.editors,
			translators: this.translators,
			year: this.year,
			referenceWork: this.referenceWork,
			edition: this.edition,
			publisher: this.publisher,
			placeOfPublication: this.placeOfPublication,
		});
	}

	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();
		const works = this.worksFrontmatterFields();
		return {
			class: base.class,
			category: base.category,
			affiliations: base.affiliations,
			'sort-title': works['sort-title'],
			authors: works.authors,
			editors: works.editors,
			translators: works.translators,
			year: works.year,
			collections: works.collections,
			'reference-work': this.referenceWork,
			'entry-term': this.entryTerm,
			edition: works.edition,
			publisher: works.publisher,
			'place-of-publication': works['place-of-publication'],
			citation: works.citation,
			'text-source': works['text-source'],
			abstract: works.abstract,
			'catalog-status': works['catalog-status'],
			'date-consumed': works['date-consumed'],
			'date-cataloged': works['date-cataloged'],
			'date-reviewed': works['date-reviewed'],
			'word-count': works['word-count'],
			themes: works.themes,
			keywords: works.keywords,
			'content-warnings': works['content-warnings'],
			created: base.created,
			modified: base.modified,
			context: base.context,
			tags: base.tags,
		};
	}
}