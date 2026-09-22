import { Works } from './Works.js';

// Distinguishing fields: commissioning-body (single wikilink, resolved
// to the linked note's title) and report-number. When authors is
// empty, commissioning-body fills the citation's author position
// (standard corporate-authorship convention in MLA/APA/Chicago); when
// both are present, authors and commissioning-body render as separate
// elements.
export class Report extends Works {
	static classValue = 'report';

	static categoryOptions() {
		return [
			'research',
			'policy',
			'technical',
			'white-paper',
			'working-paper',
		];
	}

	constructor(app, options = {}) {
		super(app, options);

		this.commissioningBody = options.commissioningBody ?? '';
		this.reportNumber = options.reportNumber ?? '';

		this.citation = this.computeCitation({
			title: this.filename,
			authors: this.authors,
			commissioningBody: this.commissioningBody,
			year: this.year,
			reportNumber: this.reportNumber,
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
			'commissioning-body': this.commissioningBody,
			'report-number': this.reportNumber,
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