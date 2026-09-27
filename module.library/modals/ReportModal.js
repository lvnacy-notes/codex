import { WorksModal } from './WorksModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import { Report } from '../objects/Report.js';

export class ReportModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			commissioningBody: '',
			reportNumber: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Report' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Report);

		this.buildWorksFields(contentEl);

		const worksFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteLinkSetting(
			contentEl,
			'Commissioning body',
			'commissioningBody',
			{
				folderPath: worksFolder,
				resolveFolderPath: resolveLibraryFolder,
				placeholder: "Link the issuing organization's note"
			}
		);
		this.buildTextSetting(
			contentEl,
			'Report number',
			'reportNumber'
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}