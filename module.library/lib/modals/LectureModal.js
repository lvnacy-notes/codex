import { WorksModal } from './WorksModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import { Lecture } from '../objects/Lecture.js';

export class LectureModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			event: '',
			deliveryDate: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Lecture' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Lecture);

		this.buildWorksFields(contentEl);

		const worksFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteLinkSetting(
			contentEl,
			'Event',
			'event',
			{
				folderPath: worksFolder,
				resolveFolderPath: resolveLibraryFolder,
				placeholder: 'Link a note, or type a plain event name',
			}
		);
		this.buildTextSetting(
			contentEl,
			'Delivery date',
			'deliveryDate',
			'YYYY-MM-DD'
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}