const { BaseModal } = await requireAsync('./BaseModal.js');
const { Image } = await requireAsync('../objects/Image.js');

export class ImageModal extends BaseModal {

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