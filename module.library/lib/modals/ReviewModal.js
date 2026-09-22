import { WorksModal } from './WorksModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import { Review } from '../objects/Review.js';

export class ReviewModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			subjectWork: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Review' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Review);

		this.buildWorksFields(contentEl);

		// subject-work can be any Work leaf, scoped to the current
		// library's works/ folder, no expectedClass filter.
		const worksFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteLinkSetting(
			contentEl,
			'Subject work',
			'subjectWork',
			{ folderPath: worksFolder, resolveFolderPath: resolveLibraryFolder }
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}