import { WorksModal } from './WorksModal.js';
import { Essay } from '../objects/Essay.js';

export class EssayModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Essay' });

		this.buildTextSetting(
            contentEl,
            'Filename',
            'filename'
        );
		this.buildCategorySetting(contentEl, Essay);

		this.buildWorksFields(contentEl);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}