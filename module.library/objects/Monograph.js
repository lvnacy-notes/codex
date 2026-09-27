import { Works } from './Works.js';

// Distinguishing field: isbn (captured for reference, never included in
// the rendered citation -- none of MLA/APA/Chicago call for it in a
// standard bibliography entry). Citation shape is otherwise identical
// to Essay's.
export class Monograph extends Works {
	static classValue = 'monograph';

	static categoryOptions() {
		return [
			'academic',
			'popular',
			'textbook',
			'handbook',
			'memoir',
			'biography',
			'polemic',
		];
	}

	constructor(app, options = {}) {
		super(app, options);

		this.isbn = options.isbn ?? '';

		this.citation = this.computeCitation({
			title: this.filename,
			authors: this.authors,
			editors: this.editors,
			translators: this.translators,
			year: this.year,
			collections: this.collections,
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
			edition: works.edition,
			isbn: this.isbn,
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