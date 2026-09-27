import { WorksModal } from './WorksModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import { Thesis } from '../objects/Thesis.js';
import { THESIS_DEGREE_OPTIONS } from '../controls/library-vocab.js';

export class ThesisModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			institution: '',
			degree: '',
			advisor: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Thesis' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Thesis);

		this.buildWorksFields(contentEl);

		const worksFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteLinkSetting(
			contentEl,
			'Institution',
			'institution',
			{
				folderPath: worksFolder,
				resolveFolderPath: resolveLibraryFolder,
				placeholder: "Link the institution's note",
			}
		);
		this.buildDropdownSetting(
			contentEl,
			'Degree',
			'degree',
			THESIS_DEGREE_OPTIONS
		);

		this.buildNoteLinkSetting(
			contentEl,
			'Advisor',
			'advisor',
			{
				folderPath: worksFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'author',
				placeholder: "Link the advisor's Author note"
			}
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}