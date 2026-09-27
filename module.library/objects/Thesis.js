import { Works } from './Works.js';

// Distinguishing fields: institution (wikilink, resolved to the linked
// note's title), degree (controlled vocabulary -- 'Doctoral' or
// "Master's" -- each style formatter maps this to its own standard
// phrasing), and advisor (wikilink, captured for reference only --
// none of MLA/APA/Chicago author-date print an advisor's name in a
// thesis/dissertation citation, so it never reaches computeCitation()).
export class Thesis extends Works {
	static classValue = 'thesis';

	constructor(app, options = {}) {
		super(app, options);

		this.institution = options.institution ?? '';
		this.degree = options.degree ?? '';
		this.advisor = options.advisor ?? '';

		this.citation = this.computeCitation({
			title: this.filename,
			authors: this.authors,
			year: this.year,
			institution: this.institution,
			degree: this.degree,
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
			institution: this.institution,
			degree: this.degree,
			advisor: this.advisor,
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