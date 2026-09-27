import { BaseModal } from '../../core.apparatus/modals/BaseModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import { Periodical } from '../objects/Periodical.js';
import {
	CATALOG_STATUS_OPTIONS,
	CIRCULATION_OPTIONS,
	FREQUENCY_OPTIONS,
} from '../controls/library-vocab.js';

// authors and collections have no fields here -- both are cascade-only,
// populated after creation by Work.js's and Collection.js's own
// postCreate() hooks.
export class PeriodicalModal extends BaseModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			filename: '',
			category: [],
			editors: [],
			publisher: '',
			placeOfPublication: '',
			issn: '',
			frequency: '',
			activeYears: '',
			genres: [],
			circulation: '',
			catalogStatus: '',
			filterTag: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Periodical' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Periodical);

		const collectionsFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteListSetting(
			contentEl,
			'Editors',
			'editors',
			{
				folderPath: collectionsFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'author',
			}
		);
		this.buildTextSetting(
			contentEl,
			'Publisher',
			'publisher'
		);
		this.buildTextSetting(
			contentEl,
			'Place of publication',
			'placeOfPublication'
		);
		this.buildTextSetting(
			contentEl,
			'ISSN',
			'issn'
		);
		this.buildDropdownSetting(
			contentEl,
			'Frequency',
			'frequency',
			FREQUENCY_OPTIONS
		);
		this.buildTextSetting(
			contentEl,
			'Active years',
			'activeYears',
			'e.g. 1939-1954'
		);
		this.buildListSetting(
			contentEl,
			'Genres',
			'genres'
		);
		this.buildDropdownSetting(
			contentEl,
			'Circulation',
			'circulation',
			CIRCULATION_OPTIONS
		);
		this.buildDropdownSetting(
			contentEl,
			'Catalog status',
			'catalogStatus',
			CATALOG_STATUS_OPTIONS
		);
		this.buildTextSetting(
			contentEl,
			'Filter tag',
			'filterTag',
			'kebab-case-tag'
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}