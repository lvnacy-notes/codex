import { Aggregate } from './Aggregate.js';

// Tracks an entire periodical's run (title -> issue -> piece), one
// level above Collection (a single issue). `collections` is a
// cascade-only field, populated by Collection.js's own postCreate()
// hook -- nothing in this class sets it directly. Never touches the
// citation engine.
export class Periodical extends Aggregate {
	static classValue = 'periodical';

	static categoryOptions() {
		return [
			'pulp-magazine',
			'literary-magazine',
			'trade-journal',
			'academic-journal',
			'opinion-journal',
			'fanzine',
			'webzine',
			'newsletter',
			'newspaper',
			'digest',
			'magazine',
		];
	}

	constructor(app, options = {}) {
		super(app, options);

		this.collections = options.collections ?? [];
		this.issn = options.issn ?? '';
		this.frequency = options.frequency ?? '';
		this.activeYears = options.activeYears ?? '';
		this.circulation = options.circulation ?? '';
	}

	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();
		const aggregate = this.aggregateFrontmatterFields();
		return {
			class: base.class,
			category: base.category,
			affiliations: base.affiliations,
			'catalog-status': aggregate['catalog-status'],
			created: base.created,
			modified: base.modified,
			issn: this.issn,
			frequency: this.frequency,
			'active-years': this.activeYears,
			circulation: this.circulation,
			authors: aggregate.authors,
			collections: this.collections,
			editors: aggregate.editors,
			publisher: aggregate.publisher,
			'place-of-publication': aggregate['place-of-publication'],
			genres: aggregate.genres,
			context: base.context,
			tags: base.tags,
		};
	}

	getBody() {
		return `# ${this.filename}

## issues

![[${this.filename} Issues.base]]

## notes
---

<!-- Notes on the periodical's run as a whole. -->`;
	}
}