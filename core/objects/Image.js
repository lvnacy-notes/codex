import { BaseClass } from './BaseClass.js';

/**
 * Apparatus-level metadata wrapper around an image file.
 */
export class Image extends BaseClass {
	/**
	 * Value written to the `class` frontmatter field.
	 */
	static classValue = 'image';

	/**
	 * Returns the class's valid category strings.
	 * @returns {string[]}
	 */
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

	/**
	 * Stores the app and the image note's options.
	 * @param {import('obsidian').App} app
	 * @param {Object} options
	 * @param {string} options.filename Note filename, without extension.
	 * @param {string} [options.folder=''] Destination folder path.
	 * @param {string[]} [options.category=[]]
	 * @param {string[]} [options.affiliations=[]]
	 * @param {string[]} [options.context=[]] Wikilinks, stored unresolved.
	 * @param {string[]} [options.tags=[]]
	 * @param {string} [options.imageVaultPath=''] Vault path of the image file.
	 * @param {string} [options.source=''] Provenance of the image.
	 * @param {string} [options.attribution='']
	 * @param {string} [options.license='']
	 * @param {string} [options.altText='']
	 * @param {string} [options.caption='']
	 */
	constructor(app, options = {}) {
		super(app, options);

		this.imageVaultPath = options.imageVaultPath ?? '';
		this.source = options.source ?? '';
		this.attribution = options.attribution ?? '';
		this.license = options.license ?? '';
		this.altText = options.altText ?? '';
		this.caption = options.caption ?? '';
	}

	/**
	 * Returns the image embed, or `''` when `imageVaultPath` is empty.
	 * @returns {string}
	 */
	getBody() {
		if (!this.imageVaultPath) {
			return '';
		}

		return `![[${ this.imageVaultPath }]]`;
	}

	/**
	 * Returns the frontmatter fields in render order.
	 * @returns {Object}
	 */
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