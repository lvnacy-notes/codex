import { WorksModal } from './WorksModal.js';
import { Monograph } from '../objects/Monograph.js';

export class MonographModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			isbn: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Monograph' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Monograph);

		this.buildWorksFields(contentEl);

		this.buildTextSetting(
			contentEl,
			'ISBN',
			'isbn'
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}