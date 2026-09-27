import { Works } from './Works.js';

// Distinguishing fields: format (controlled vocabulary, prints in the
// citation -- bracketed for APA, a plain trailing element for
// MLA/Chicago) and duration (free-text runtime, metadata-only, never
// rendered in the citation). No categoryOptions() override -- the
// category vocabulary for recorded media varies by context library,
// so it's deferred to each library's own Record subclass.
export class Record extends Works {
	static classValue = 'record';

	constructor(app, options = {}) {
		super(app, options);

		this.duration = options.duration ?? '';
		this.format = options.format ?? '';

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
			format: this.format,
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
			format: this.format,
			duration: this.duration,
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