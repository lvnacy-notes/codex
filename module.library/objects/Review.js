import { Works } from './Works.js';

// Distinguishing field: subject-work (a single wikilink to the work
// being reviewed). Renders as its own "Review of X" clause rather than
// replacing the container-title slot the way Chapter/Entry's
// parentWork/referenceWork do, since the reviewed work isn't a
// container the review appears in.
export class Review extends Works {
	static classValue = 'review';

	static categoryOptions() {
		return [
			'book',
			'film',
			'exhibition',
			'performance'
		];
	}

	constructor(app, options = {}) {
		super(app, options);

		this.subjectWork = options.subjectWork ?? '';

		this.citation = this.computeCitation({
			title: this.filename,
			authors: this.authors,
			year: this.year,
			collections: this.collections,
			subjectWork: this.subjectWork,
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
			'subject-work': this.subjectWork,
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