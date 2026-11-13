import { BaseModal } from '../../core/modals/BaseModal.js';

/**
 * Valid length/form values for a story's `category`.
 * @type {string[]}
 */
const STORY_CATEGORY_OPTIONS = [
	'short-story',
	'novelette',
	'novella',
	'novel',
	'serial',
];

/**
 * Modal that collects the fields of a new story.
 */
export class StoryModal extends BaseModal {
	/**
	 * Initializes the result fields.
	 * @param {import('obsidian').App} app
	 * @param {function(Object): (void|Promise<void>)} onSubmit Called with the result object on submit.
	 */
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			titleAbbv: '',
			category: [],
			cycle: '',
			affiliations: [],
			gitRepoUrl: '',
			vaultMembership: [],
			storyStatus: '',
			editorialStatus: '',
			tags: [],
		});
	}

	/**
	 * Renders the new-story form.
	 */
	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Story' });

		this.buildTextSetting(
            contentEl,
            'Title Abbreviation',
            'titleAbbv'
        );
		this.buildDropdownArraySetting(
            contentEl,
            'Category (length/form)',
            'category',
            STORY_CATEGORY_OPTIONS
        );
        this.buildListSuggestSetting(
            contentEl,
            'Affiliations',
            'affiliations',
            'affiliations'
        );
		this.buildTextSuggestSetting(
            contentEl,
            'Cycle',
            'cycle',
            'cycle'
        );
		this.buildTextSetting(
            contentEl,
            'Git repo URL',
            'gitRepoUrl'
        );
		this.buildListSuggestSetting(
            contentEl,
            'Vault membership',
            'vaultMembership',
            'vault-membership'
        );
		this.buildDropdownSetting(
            contentEl,
            'Story status',
            'storyStatus',
            [
				'backlog',
                'active',
                'paused',
                'complete',
                'abandoned',
                'archived',
		    ]
        );
		this.buildDropdownSetting(
            contentEl,
            'Editorial status',
            'editorialStatus',
            [
                'backlog',
                'in-progress',
                'revision',
                'complete',
		    ]
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