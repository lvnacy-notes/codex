import { BaseModal } from '../../core.apparatus/modals/BaseModal.js';
import { Author } from '../objects/Author.js';

export class AuthorModal extends BaseModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			filename: '',
			category: [],
			prefix: '',
			firstName: '',
			lastName: '',
			suffix: '',
			homepage: '',
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Author' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Author);
		this.buildTextSetting(
			contentEl,
			'Prefix',
			'prefix',
			'e.g. Dr.'
		);
		this.buildTextSetting(
			contentEl,
			'First name',
			'firstName'
		);
		this.buildTextSetting(
			contentEl,
			'Last name',
			'lastName'
		);
		this.buildTextSetting(
			contentEl,
			'Suffix',
			'suffix',
			'e.g. Jr., III'
		);
		this.buildTextSetting(
			contentEl,
			'Homepage',
			'homepage',
			'https://...'
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}