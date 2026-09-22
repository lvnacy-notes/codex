import { BaseModal } from '../../../lib/modals/BaseModal.js';
import { CATALOG_STATUS_OPTIONS } from '../controls/library-vocab.js';

// Shared modal field builders for every Aggregate subclass (Collection,
// Periodical). Subclasses call these individually, interleaved with
// their own leaf-specific fields, since each orders its frontmatter
// differently. No builder for `authors` here -- it's cascade-only on
// every Aggregate subclass, never entered directly.
export class AggregateModal extends BaseModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			editors: [],
			publisher: '',
			placeOfPublication: '',
			genres: [],
			catalogStatus: '',
		});
	}

	buildCatalogStatusSetting(containerEl) {
		this.buildDropdownSetting(
			containerEl,
			'Catalog status',
			'catalogStatus',
			CATALOG_STATUS_OPTIONS
		);
	}

	buildEditorsSetting(containerEl, folderPath, resolveFolderPath) {
		this.buildNoteListSetting(
			containerEl,
			'Editors',
			'editors',
			{
				folderPath,
				resolveFolderPath,
				expectedClass: 'author',
			}
		);
	}

	buildPublisherFields(containerEl) {
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
	}

	buildGenresSetting(containerEl) {
		this.buildListSetting(
			containerEl,
			'Genres',
			'genres'
		);
	}
}