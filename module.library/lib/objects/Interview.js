import { Works } from './Works.js';

// Distinguishing fields: interviewer, interviewee (wikilink arrays,
// resolved against Author notes). The interviewee stands in the
// author position for citation purposes; the interviewer is credited
// via a separate "interview by" clause. authors/editors/translators
// remain available at base tier but are not used by this leaf's
// citation.
export class Interview extends Works {
	static classValue = 'interview';

	constructor(app, options = {}) {
		super(app, options);

		this.interviewer = options.interviewer ?? [];
		this.interviewee = options.interviewee ?? [];

		this.citation = this.computeCitation({
			title: this.filename,
			interviewee: this.interviewee,
			interviewer: this.interviewer,
			year: this.year,
			collections: this.collections,
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
			interviewer: this.interviewer,
			interviewee: this.interviewee,
			year: works.year,
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