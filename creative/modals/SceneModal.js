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
			context: [],
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
		const stageEl = contentEl.createDiv();
		const statusEl = contentEl.createDiv();
		this.buildDropdownSetting(
			stageEl,
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
			],
			(stage) => this.buildStatusSetting(statusEl, stage)
		);
		this.buildTextSetting(
			contentEl,
			'Chapter',
			'chapter'
		);
		this.buildContextSetting(contentEl);
		this.buildListSuggestSetting(
			contentEl,
			'Tags',
			'tags',
			'tags'
		);

		this.buildSubmitButton(contentEl);
	}

	/**
	 * Rebuilds the status control for a stage: serial-status options at the serial stage, editorial-status options at any other stage, and nothing when no stage is selected. Clears the stored status when it is not valid for the stage.
	 * @param {HTMLElement} containerEl Container the control renders in. Emptied first.
	 * @param {string} stage Selected stage, or `''`.
	 */
	buildStatusSetting(containerEl, stage) {
		containerEl.empty();
		if (!stage) {
			this.result.editorialStatus = '';
			return;
		}
		const isSerial = stage === Scene.SERIAL_STAGE;
		const options = isSerial ? Scene.SERIAL_STATUS_VALUES : Scene.EDITORIAL_STATUS_VALUES;
		if (!options.includes(this.result.editorialStatus)) {
			this.result.editorialStatus = '';
		}
		this.buildDropdownSetting(
			containerEl,
			isSerial ? 'Serial status' : 'Editorial status',
			'editorialStatus',
			options
		);
	}
}