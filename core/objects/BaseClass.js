import { moment } from 'obsidian';
import { buildFrontmatterBlock } from '../../frontmatter';
import { Log } from '../../utils/logger.js';

export class BaseClass {
	// Subclasses set: static classValue = 'scene';
	static classValue = null;

	/**
	 * Subclasses with a fixed category vocabulary should override this,
	 * returning the list of valid options (e.g. static categoryOptions() {
	 * return ['literary', 'film-tv', 'foreign-rights']; }). Returns null by
	 * default, meaning "no fixed vocabulary" — the corresponding modal falls
	 * back to a plain comma-separated list in that case (see BaseModal's
	 * buildCategorySetting()). The point of the null default rather than
	 * requiring every subclass to implement this: a class that forgets to
	 * override it still gets a usable category input instead of none at all.
	 */
	static categoryOptions() {
		return null;
	}

	constructor(app, options = {}) {
		if (!app) {
			const error = new Error('BaseClass requires an Obsidian app instance.');
 			Log.error(
				this,
				error.message,
				error
			);
 			throw error;
		}
		if (!options.filename) {
			const error = new Error('BaseClass requires a filename.');
 			Log.error(
				this,
				error.message,
				error
			);
 			throw error;
		}

		this.app = app;
		this.folder = options.folder ?? '';
		this.filename = options.filename;
		this.category = options.category ?? [];
		this.affiliations = options.affiliations ?? [];
		// Wikilink array. Catch-all cross-reference to any other object
		// relevant to this note that doesn't fit an existing relational
		// field. Carried on every note via BaseClass. Stored raw --
		// BaseClass has no resolver access; subclasses that can resolve
		// links may layer resolution on top of this raw value.
		this.context = options.context ?? [];
		this.tags = options.tags ?? [];
	}

	// Shared fields every class carries. Subclasses call this from
	// getFrontmatterFields() and splice their own keys around it
	// rather than overriding this directly.
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

	buildContent() {
		return `${ this.buildFrontmatter() }\n\n${ this.getBody() }`;
	}

	buildFrontmatter() {
		return buildFrontmatterBlock(this.getFrontmatterFields());
	}

	async create() {
		if (this.app.vault.getAbstractFileByPath(this.path)) {
			const error = new Error(`A file already exists at ${ this.path }`);
 			Log.error(
				this,
				error.message,
				error
			);
 			throw error;
		}

		let file;
		try {
			file = await this.app.vault.create(this.path, this.buildContent());
 			Log.log(this, `Created ${ this.path }`);
		} catch (error) {
			Log.fatal(
				this,
				`Failed to create ${ this.path }`,
				error
			);
 			throw error;
		}

		// Runs after the file is confirmed on disk. A failure here throws
		// and propagates out of create() same as any other error -- the
		// note itself already exists at this point, so a curator seeing
		// this error knows the primary creation succeeded and only the
		// follow-on work needs manual reconciliation.
		await this.postCreate(file);

		return file;
	}

	/**
	 * Hook for subclasses to run additional work after this note has been
	 * successfully written to disk. No-op by default. Receives the newly
	 * created TFile. Subclasses that override this should call
	 * super.postCreate(file) first, then layer their own behavior on top,
	 * so the chain composes across the tier the same way
	 * getFrontmatterFields() does.
	 */
	async postCreate(file) {
		// no-op by default
	}

	/**
	 * Finds the affiliation entry on a note that identifies *it* — the first
	 * value in its own `affiliations` frontmatter matching one of the given
	 * prefixes — so a referencing note can copy that value verbatim instead of
	 * someone re-typing it and risking a mismatch that silently breaks the
	 * graph connection. Returns undefined if no such entry is found.
	 * No default for `prefixes`: there's no Apparatus-wide affiliation
	 * namespace, only per-taxonomy conventions (ENVOY's "agent."/"market.",
	 * whatever Calamity's classes settle on, etc.) — callers supply their own,
	 * the way ENVOY's core/affiliations.js wrapper does.
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
	 * Override in subclasses to add class-specific fields, in whatever
	 * key order the frontmatter should render.
	 */
	getFrontmatterFields() {
		return this.baseFrontmatterFields();
	}

	/**
	 * Override in subclasses — markdown body below the frontmatter.
	 */
	getBody() {
		return '';
	}

	get path() {
		const folderPart = this.folder ? `${ this.folder }/` : '';
		return `${ folderPart }${ this.filename }.md`;
	}

	// Default folder-resolution strategy: the parent folder of the file
	// the command was run from. Override in subclasses that need a
	// different strategy (e.g. a folder-suggest modal).
	static async resolveFolder(app) {
		return app.workspace.getActiveFile()?.parent?.path ?? '';
	}
}