import { BaseModal } from './BaseModal.js';
import { Image } from '../objects/Image.js';

/**
 * Modal that collects the fields for a new Image note.
 */
export class ImageModal extends BaseModal {

	/**
	 * Stores `onSubmit` and adds the Image fields to the result object.
	 * @param {import('obsidian').App} app
	 * @param {function(Object): void} onSubmit Called with the result object on submit.
	 */
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			filename: '',
			category: [],
			imageVaultPath: '',
			source: '',
			attribution: '',
			license: '',
			altText: '',
			caption: '',
		});
	}

	/**
	 * Renders the Image fields, then the shared fields and the submit button.
	 */
	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Image' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Image);
		this.buildFileSuggestSetting(
			contentEl,
			'Vault path to image',
			'imageVaultPath'
		);
		this.buildTextSetting(
			contentEl,
			'Source',
			'source'
		);
		this.buildTextSetting(
			contentEl,
			'Attribution',
			'attribution'
		);
		this.buildTextSetting(
			contentEl,
			'License',
			'license'
		);
		this.buildTextSetting(
			contentEl,
			'Alt text',
			'altText'
		);
		this.buildTextSetting(
			contentEl,
			'Caption',
			'caption'
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}