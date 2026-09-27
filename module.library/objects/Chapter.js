import { Works } from './Works.js';

// Distinguishing fields: parent-work (a single wikilink to the Works
// note this chapter appears within) and page-range. parent-work is
// resolved at citation time via resolve-titles.js's resolveNoteTitle(),
// wired through citation-engine.js's generateCitation().
export class Chapter extends Works {
	static classValue = 'chapter';

	constructor(app, options = {}) {
		super(app, options);

		this.parentWork = options.parentWork ?? '';
		this.pageRange = options.pageRange ?? '';

		this.citation = this.computeCitation({
			title: this.filename,
			authors: this.authors,
			editors: this.editors,
			translators: this.translators,
			year: this.year,
			parentWork: this.parentWork,
			pageRange: this.pageRange,
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
			'parent-work': this.parentWork,
			'page-range': this.pageRange,
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