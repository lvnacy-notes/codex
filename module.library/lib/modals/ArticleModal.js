import { WorksModal } from './WorksModal.js';
import { Article } from '../objects/Article.js';

export class ArticleModal extends WorksModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			pageRange: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Article' });

		this.buildTextSetting(
            contentEl,
            'Filename',
            'filename'
        );
		this.buildCategorySetting(contentEl, Article);

		this.buildWorksFields(contentEl);

		this.buildTextSetting(
            contentEl,
            'Page range',
            'pageRange',
            'e.g. 112-134'
        );

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}