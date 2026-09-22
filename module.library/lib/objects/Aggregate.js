import { BaseClass } from '../../../lib/objects/BaseClass.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';

// Shared middle tier for Library classes that aggregate other Works
// notes under one bibliographic identity -- Collection (a single
// periodical issue or standalone volume) and Periodical (an entire
// periodical's run). Owns the fields common to both: editors,
// publisher, place-of-publication, genres, catalog-status -- plus the
// fixed collections/ folder both are created into. `authors` is
// declared here too, but is cascade-only on every subclass -- populated
// after creation by a contained Works' own postCreate() hook, never
// entered directly.
export class Aggregate extends BaseClass {
	constructor(app, options = {}) {
		super(app, options);

		this.authors = options.authors ?? [];
		this.editors = options.editors ?? [];
		this.publisher = options.publisher ?? '';
		this.placeOfPublication = options.placeOfPublication ?? '';
		this.genres = options.genres ?? [];
		this.catalogStatus = options.catalogStatus ?? '';
	}

	// Values shared across every Aggregate subclass, gathered here so
	// subclasses can splice them into their own getFrontmatterFields() in
	// whatever key order their schema calls for.
	aggregateFrontmatterFields() {
		return {
			authors: this.authors,
			editors: this.editors,
			publisher: this.publisher,
			'place-of-publication': this.placeOfPublication,
			genres: this.genres,
			'catalog-status': this.catalogStatus,
		};
	}

	// Resolves the enclosing library's fixed collections/ folder from the
	// active file's location. Throws if the active file isn't inside a
	// library. Inherited by every Aggregate subclass.
	static async resolveFolder(app) {
		const startFolderPath = app.workspace.getActiveFile()?.parent?.path ?? '';
		const libraryFolder = resolveLibraryFolder(app, startFolderPath);
		return `${ libraryFolder }/collections`;
	}
}