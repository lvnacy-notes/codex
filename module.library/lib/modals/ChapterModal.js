import { WorksModal } from './WorksModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import { Chapter } from '../objects/Chapter.js';

export class ChapterModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			parentWork: '',
			pageRange: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Chapter' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Chapter);

		this.buildWorksFields(contentEl);

		// parent-work can be any Work leaf -- scoped to the current
		// library's works/ folder (siblings of this note), no
		// expectedClass filter.
		const worksFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteLinkSetting(
			contentEl,
			'Parent work',
			'parentWork',
			{ folderPath: worksFolder, resolveFolderPath: resolveLibraryFolder }
		);
		this.buildTextSetting(
			contentEl,
			'Page range',
			'pageRange',
			'e.g. 45-67'
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}