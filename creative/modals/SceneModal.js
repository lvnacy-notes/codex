import { BaseModal } from '../../core/modals/BaseModal.js';
import { Scene } from '../objects/Scene.js';

/**
 * Modal that collects the fields of a new scene.
 */
export class SceneModal extends BaseModal {
	/**
	 * Initializes the result fields.
	 * @param {import('obsidian').App} app
	 * @param {function(Object): (void|Promise<void>)} onSubmit Called with the result object on submit.
	 */
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			filename: '',
			category: [],
			affiliations: [],
			tags: [],
			stage: '',
			editorialStatus: '',
			chapter: '',
			context: '',
		});
	}

	/**
	 * Renders the new-scene form.
	 */
	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Scene' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Scene);
		this.buildListSuggestSetting(
			contentEl,
			'Affiliations',
			'affiliations',
			'affiliations'
		);
		this.buildDropdownSetting(
			contentEl,
			'Stage',
			'stage',
			[
				'shitty-first-draft',
				'serial-draft',
				'reassembly',
				'1st-edit',
				'2nd-edit',
			'3rd-edit',
			'final',
		]);
		this.buildDropdownSetting(
			contentEl,
			'Editorial / Serial status',
			'editorialStatus',
			[
				'not-started',
				'in-progress',
			'revision',
			'complete',
		]);
		this.buildTextSetting(
			contentEl,
			'Chapter',
			'chapter'
		);
		this.buildTextSetting(
			contentEl,
			'Context',
			'context'
		);
		this.buildListSuggestSetting(
			contentEl,
			'Tags',
			'tags',
			'tags'
		);

		this.buildSubmitButton(contentEl);
	}
}