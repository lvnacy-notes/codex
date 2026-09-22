import { Works } from './Works.js';

// Distinguishing fields: event (the lecture series or conference --
// either a wikilink resolved to that note's title, or a plain text
// string used as-is) and delivery-date (when the lecture was given,
// distinct from year -- original composition). Citation prefers
// delivery-date over year when both are present.
export class Lecture extends Works {
	static classValue = 'lecture';

	constructor(app, options = {}) {
		super(app, options);

		this.event = options.event ?? '';
		this.deliveryDate = options.deliveryDate ?? '';

		this.citation = this.computeCitation({
			title: this.filename,
			authors: this.authors,
			event: this.event,
			deliveryDate: this.deliveryDate,
			year: this.year,
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
			event: this.event,
			'delivery-date': this.deliveryDate,
			collections: works.collections,
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