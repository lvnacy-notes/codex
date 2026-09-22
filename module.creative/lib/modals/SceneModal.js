import { BaseModal } from '../../../lib/modals/BaseModal.js';
import { Scene } from '../objects/Scene.js';

export class SceneModal extends BaseModal {
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

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Scene' });

		this.buildTextSetting(contentEl, 'Filename', 'filename');
		// Scene has no fixed category vocabulary (none was ever decided in
		// the taxonomy), so this correctly falls back to a suggest-enabled
		// comma-list rather than a multi-select — see BaseClass.categoryOptions().
		this.buildCategorySetting(contentEl, Scene);
		this.buildListSuggestSetting(contentEl, 'Affiliations', 'affiliations', 'affiliations');
		// 'serial-draft' (not 'serial') -- must match the pipeline's own
		// stage name (see manuscriptPipelines.js / Story.js's
		// STAGE_DESCRIPTIONS) since Scene.statusFieldKey keys off this
		// exact string to decide editorial-status vs serial-status.
		this.buildDropdownSetting(contentEl, 'Stage', 'stage', [
			'shitty-first-draft',
			'serial-draft',
			'reassembly',
			'1st-edit',
			'2nd-edit',
			'3rd-edit',
			'final',
		]);
		// Label covers both cases -- Scene itself derives whether this
		// value is saved under `editorial-status` or `serial-status`
		// based on the `stage` picked above, so there's no separate
		// switch to keep in sync here.
		this.buildDropdownSetting(contentEl, 'Editorial / Serial status', 'editorialStatus', [
			'not-started',
			'in-progress',
			'revision',
			'complete',
		]);
		this.buildTextSetting(contentEl, 'Chapter', 'chapter');
		this.buildTextSetting(contentEl, 'Context', 'context');
		this.buildListSuggestSetting(contentEl, 'Tags', 'tags', 'tags');

		this.buildSubmitButton(contentEl);
	}
}