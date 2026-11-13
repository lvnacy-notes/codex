import { moment } from 'obsidian';
import { buildFrontmatterBlock } from '../../frontmatter';
import { Log } from '../../utils/logger.js';

/**
 * Abstract base class for all Apparatus object classes.
 */
export class BaseClass {
	/**
	 * Value written to the `class` frontmatter field. Set by each subclass.
	 */
	static classValue = null;

	/**
	 * Returns the class's valid category strings, or `null` when it has no fixed vocabulary.
	 * @returns {string[]|null}
	 */
	static categoryOptions() {
		return null;
	}

	/**
	 * Stores the app and the note's options.
	 * @param {import('obsidian').App} app
	 * @param {Object} options
	 * @param {string} options.filename Note filename, without extension.
	 * @param {string} [options.folder=''] Destination folder path.
	 * @param {string[]} [options.category=[]]
	 * @param {string[]} [options.affiliations=[]]
	 * @param {string[]} [options.context=[]] Wikilinks, stored unresolved.
	 * @param {string[]} [options.tags=[]]
	 * @throws {Error} When `app` or `options.filename` is missing.
	 */
	constructor(app, options = {}) {
		if (!app) {
			throw new Error('BaseClass requires an Obsidian app instance.');
		}
		if (!options.filename) {
			throw new Error('BaseClass requires a filename.');
		}

		this.app = app;
		this.folder = options.folder ?? '';
		this.filename = options.filename;
		this.category = options.category ?? [];
		this.affiliations = options.affiliations ?? [];
		this.context = options.context ?? [];
		this.tags = options.tags ?? [];
	}

	/**
	 * Returns the frontmatter fields every class carries.
	 * @returns {Object}
	 */
	baseFrontmatterFields() {
		return {
			class: this.constructor.classValue,
			category: this.category,
			affiliations: this.affiliations,
			created: moment().format('YYYY-MM-DD'),
			modified: '',
			context: this.context,
			tags: this.tags,
		};
	}

	/**
	 * Returns the frontmatter block followed by the body.
	 * @returns {string}
	 */
	buildContent() {
		return `${ this.buildFrontmatter() }\n\n${ this.getBody() }`;
	}

	/**
	 * Returns the frontmatter block for this note.
	 * @returns {string}
	 */
	buildFrontmatter() {
		return buildFrontmatterBlock(this.getFrontmatterFields());
	}

	/**
	 * Writes the note to the vault, then runs `postCreate`.
	 * @returns {Promise<import('obsidian').TFile>} The created note.
	 * @throws {Error} When a file already exists at the path or the write fails.
	 */
	async create() {
		if (this.app.vault.getAbstractFileByPath(this.path)) {
			throw new Error(`A file already exists at ${ this.path }`);
		}

		const file = await this.app.vault.create(this.path, this.buildContent());
		Log.log(this, `Created ${ this.path }`);

		await this.postCreate(file);

		return file;
	}

	/**
	 * Runs after the note is written to disk. No-op by default.
	 * @param {import('obsidian').TFile} file The created note.
	 * @returns {Promise<void>}
	 */
	async postCreate(file) {
	}

	/**
	 * Returns the first of the file's affiliations that starts with one of the given prefixes.
	 * @param {import('obsidian').App} app
	 * @param {import('obsidian').TFile} file
	 * @param {string[]} prefixes
	 * @returns {string|undefined}
	 */
	static findIdentityAffiliation(
		app,
		file,
		prefixes
	) {
		const affiliations = app.metadataCache.getFileCache(file)?.frontmatter?.affiliations ?? [];
		return affiliations.find((a) => prefixes.some((p) => a.startsWith(p)));
	}

	/**
	 * Returns the frontmatter fields in render order. Override to add class-specific fields.
	 * @returns {Object}
	 */
	getFrontmatterFields() {
		return this.baseFrontmatterFields();
	}

	/**
	 * Returns the markdown body below the frontmatter. Override in subclasses.
	 * @returns {string}
	 */
	getBody() {
		return '';
	}

	/**
	 * Vault path of the note: `<folder>/<filename>.md`.
	 * @returns {string}
	 */
	get path() {
		const folderPart = this.folder ? `${ this.folder }/` : '';
		return `${ folderPart }${ this.filename }.md`;
	}

	/**
	 * Returns the destination folder path: the active file's parent folder, or `''` when there is none. Override to change the strategy.
	 * @param {import('obsidian').App} app
	 * @returns {Promise<string>}
	 */
	static async resolveFolder(app) {
		return app.workspace.getActiveFile()?.parent?.path ?? '';
	}
}