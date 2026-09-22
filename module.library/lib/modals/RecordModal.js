import { WorksModal } from './WorksModal.js';
import { Record } from '../objects/Record.js';
import { RECORD_FORMAT_OPTIONS } from '../controls/library-vocab.js';

export class RecordModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			format: '',
			duration: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Record' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Record);

		this.buildWorksFields(contentEl);

		this.buildDropdownSetting(
			contentEl,
			'Format',
			'format',
			RECORD_FORMAT_OPTIONS
		);
		this.buildTextSetting(
			contentEl,
			'Duration',
			'duration',
			'e.g. 48:12'
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}