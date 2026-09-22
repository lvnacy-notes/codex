import { BaseClass } from './BaseClass.js';

// Generic Apparatus-level metadata wrapper around an image file. Not
// scoped to any single module -- a module wanting a dedicated storage
// location for its own image objects extends this class and overrides
// resolveFolder() there.
export class Image extends BaseClass {
	static classValue = 'image';

	static categoryOptions() {
		return [
			'artwork',
			'cover',
			'diagram',
			'illustration',
			'map',
			'photograph',
			'portrait',
			'screenshot',
		];
	}

	constructor(app, options = {}) {
		super(app, options);

		this.imageVaultPath = options.imageVaultPath ?? '';
		this.source = options.source ?? '';
		this.attribution = options.attribution ?? '';
		this.license = options.license ?? '';
		this.altText = options.altText ?? '';
		this.caption = options.caption ?? '';
	}

	getBody() {
		return `![[${ this.imageVaultPath }]]`;
	}

	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();
		return {
			class: base.class,
			category: base.category,
			affiliations: base.affiliations,
			created: base.created,
			modified: base.modified,
			source: this.source,
			attribution: this.attribution,
			license: this.license,
			'alt-text': this.altText,
			caption: this.caption,
			context: base.context,
			tags: base.tags,
		};
	}
}