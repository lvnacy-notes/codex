import { Works } from './Works.js';

export class Article extends Works {
	static classValue = 'article';

	static categoryOptions() {
		return [
            'journal',
            'magazine',
            'newspaper',
            'trade'
        ];
	}

	constructor(app, options = {}) {
		super(app, options);

		this.pageRange = options.pageRange ?? '';

		// `title` is the note's own filename, not a frontmatter field.
		// `periodical`/`volume`/`issue` are resolved by the citation
		// engine off the linked Collection note, not stored here.
		this.citation = this.computeCitation({
			title: this.filename,
			authors: this.authors,
			year: this.year,
			collections: this.collections,
			pageRange: this.pageRange,
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