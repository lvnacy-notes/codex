import { WorksModal } from './WorksModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import { Entry } from '../objects/Entry.js';

export class EntryModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			referenceWork: '',
			entryTerm: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Entry' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Entry);

		this.buildWorksFields(contentEl);

		// reference-work can be any Work leaf, scoped to the current
		// library's works/ folder, no expectedClass filter.
		const worksFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteLinkSetting(
			contentEl,
			'Reference work',
			'referenceWork',
			{ folderPath: worksFolder, resolveFolderPath: resolveLibraryFolder }
		);
		this.buildTextSetting(
			contentEl,
			'Entry term',
			'entryTerm'
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}