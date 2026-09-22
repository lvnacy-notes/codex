import { WorksModal } from './WorksModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import { Interview } from '../objects/Interview.js';

export class InterviewModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			interviewer: [],
			interviewee: [],
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Interview' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Interview);

		this.buildWorksFields(contentEl);

		const worksFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteListSetting(
			contentEl,
			'Interviewer',
			'interviewer',
			{
				folderPath: worksFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'author',
			}
		);
		this.buildNoteListSetting(
			contentEl,
			'Interviewee',
			'interviewee',
			{
				folderPath: worksFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'author',
			}
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}