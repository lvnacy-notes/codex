import { Setting } from 'obsidian';
import { BaseModal } from '../../core.apparatus/modals/BaseModal.js';
import { Library } from '../objects/Library.js';
import {
	CITATION_STYLE_OPTIONS,
	LIBRARY_STATUS_OPTIONS,
} from '../controls/library-vocab.js';

// Modal for creating a new Library root/dashboard note. Unlike every
// other creation modal in this module, Library has no enclosing library
// to scope relational fields against -- it IS the library, so none of
// its fields go through resolveLibraryFolder/resolveLibraryNote.
export class LibraryModal extends BaseModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			filename: '',
			category: '',
			libraryName: '',
			libraryTag: '',
			libraryStatus: '',
			citationStyle: '',
			worksFolderName: '',
			domain: '',
			genres: [],
			tone: [],
			period: '',
		});
	}

	onOpen() {
		const { contentEl } = this;

		this.buildFilenameSetting(contentEl);
		this.buildCategorySetting(contentEl, Library);
		this.buildIdentitySetting(contentEl);
		this.buildDropdownSetting(
			contentEl,
			'Library status',
			'libraryStatus',
			LIBRARY_STATUS_OPTIONS
		);
		this.buildDropdownSetting(
			contentEl,
			'Citation style',
			'citationStyle',
			CITATION_STYLE_OPTIONS
		);
		this.buildTextSetting(
			contentEl,
			'Works folder name',
			'worksFolderName',
			'works'
		);
		this.buildTextSetting(
			contentEl,
			'Domain',
			'domain'
		);
		this.buildListSetting(
			contentEl,
			'Genres',
			'genres'
		);
		this.buildListSetting(
			contentEl,
			'Tone',
			'tone'
		);
		this.buildTextSetting(
			contentEl,
			'Period',
			'period'
		);

		super.onOpen();
		this.buildSubmitButton(contentEl);
	}

	// Filename choice: match the containing folder's name, or literally
	// "INDEX" -- the only two conventions in current use.
	buildFilenameSetting(containerEl) {
		const folderName = this.app.workspace.getActiveFile()?.parent?.name ?? '';
		this.buildDropdownSetting(
			containerEl,
			'Filename',
			'filename',
			[folderName, 'INDEX']
		);
	}

	// Library name and library-tag are built together: the tag field
	// suggests a kebab-case default derived from the name field, but stops
	// suggesting the moment the curator types into the tag field directly.
	buildIdentitySetting(containerEl) {
		let tagTouched = false;
		let tagText;

		new Setting(containerEl)
			.setName('Library name')
			.addText((text) =>
				text.onChange((value) => {
					this.result.libraryName = value;
					if (!tagTouched && tagText) {
						const suggestion = kebabCase(value);
						tagText.setValue(suggestion);
						this.result.libraryTag = suggestion;
					}
				})
			);

		new Setting(containerEl)
			.setName('Library tag')
			.addText((text) => {
				tagText = text;
				text.setPlaceholder('kebab-case-tag').onChange((value) => {
					tagTouched = true;
					this.result.libraryTag = value;
				});
			});
	}
}

function kebabCase(value) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}