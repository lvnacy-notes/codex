import { BaseModal } from '../../core.apparatus/modals/BaseModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import {
	CATALOG_STATUS_OPTIONS,
	CONTENT_WARNINGS,
} from '../controls/library-vocab.js';

// Shared modal fields for every Works leaf class. Subclass modals call
// buildWorksFields() directly on top of their own leaf-specific fields.
export class WorksModal extends BaseModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			filename: '',
			authors: [],
			editors: [],
			translators: [],
			year: '',
			collections: [],
			edition: '',
			publisher: '',
			placeOfPublication: '',
			textSource: '',
			abstract: '',
			catalogStatus: '',
			dateConsumed: '',
			dateCataloged: '',
			dateReviewed: '',
			wordCount: '',
			themes: [],
			keywords: [],
			contentWarnings: [],
			cites: [],
			related: [],
			partOf: '',
		});
	}

	// Library-scoped override of BaseModal's vault-wide default --
	// Works leaves live inside a library, so Context results are
	// restricted to notes within the enclosing library rather than the
	// whole vault, matching every other relational field in this
	// module.
	buildContextSetting(containerEl) {
		const worksFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';
		this.buildNoteListSetting(
			containerEl,
			'Context',
			'context',
			{ folderPath: worksFolder, resolveFolderPath: resolveLibraryFolder }
		);
	}

	// Fields shared across every Works leaf. Leaf-specific fields are
	// built by the leaf modal itself. Every relational field is scoped
	// to the enclosing library via resolveLibraryFolder, seeded from
	// this note's own folder.
	buildWorksFields(containerEl) {
		const worksFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteListSetting(
            containerEl,
            'Authors',
            'authors',
            {
				folderPath: worksFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'author',
			}
        );
		this.buildNoteListSetting(
            containerEl,
            'Editors',
            'editors',
            {
				folderPath: worksFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'author',
			}
        );
		this.buildNoteListSetting(
            containerEl,
            'Translators',
            'translators',
            {
				folderPath: worksFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'author',
			}
        );
		this.buildTextSetting(
            containerEl,
            'Year',
            'year',
            'e.g. 2019'
        );
		this.buildNoteListSetting(
			containerEl,
			'Collections',
			'collections',
			{
				folderPath: worksFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'collection',
			}
		);
		this.buildTextSetting(
            containerEl,
            'Edition',
            'edition'
        );
		this.buildTextSetting(
            containerEl,
            'Publisher',
            'publisher'
        );
		this.buildTextSetting(
            containerEl,
            'Place of publication',
            'placeOfPublication'
        );
		this.buildTextSetting(
            containerEl,
            'Text source (URL)',
            'textSource'
        );
		this.buildTextSetting(
            containerEl,
            'Abstract',
            'abstract'
        );
		this.buildDropdownSetting(
            containerEl,
            'Catalog status',
            'catalogStatus',
            CATALOG_STATUS_OPTIONS
        );
		this.buildTextSetting(
            containerEl,
            'Date consumed',
            'dateConsumed',
            'YYYY-MM-DD'
        );
		this.buildTextSetting(
            containerEl,
            'Date cataloged',
            'dateCataloged',
            'YYYY-MM-DD'
        );
		this.buildTextSetting(
            containerEl,
            'Date reviewed',
            'dateReviewed',
            'YYYY-MM-DD'
        );
		this.buildTextSetting(
            containerEl,
            'Word count',
            'wordCount'
        );
		this.buildListSetting(
            containerEl,
            'Themes',
            'themes'
        );
		this.buildListSetting(
            containerEl,
            'Keywords',
            'keywords'
        );
		this.buildListSetting(
            containerEl,
            'Content warnings',
            'contentWarnings',
            '',
            '',
            CONTENT_WARNINGS
        );
		this.buildNoteListSetting(
            containerEl,
            'Cites',
            'cites',
            { folderPath: worksFolder, resolveFolderPath: resolveLibraryFolder }
        );
		this.buildNoteListSetting(
            containerEl,
            'Related',
            'related',
            { folderPath: worksFolder, resolveFolderPath: resolveLibraryFolder }
        );
		this.buildNoteLinkSetting(
            containerEl,
            'Part of',
            'partOf',
            { folderPath: worksFolder, resolveFolderPath: resolveLibraryFolder }
        );
	}
}