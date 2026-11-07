import { BaseModal } from '../../core/modals/BaseModal.js';

/**
 * Valid length/form values for Story's `category`. A story has exactly one,
 * so the modal renders them as a pick-one dropdown stored as a one-element
 * string array (see BaseModal.buildDropdownArraySetting()), not the
 * stackable multi-select from BaseModal.buildCategorySetting(). Every
 * option here resolves to a real stage pipeline.
 */
const STORY_CATEGORY_OPTIONS = [
	'short-story',
	'novelette',
	'novella',
	'novel',
	'serial',
];

export class StoryModal extends BaseModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			titleAbbv: '',
			category: [],
			cycle: '',
			affiliations: [],
			gitRepoUrl: '',
			storyStatus: '',
			editorialStatus: '',
			tags: [],
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Story' });

		// Required -- names this story's generated scene Templater templates
		// (e.g. `${titleAbbv}-scene-editorial.md`). BaseModal has no built-in
		// required-field validation, so the actual hard block on an empty
		// value lives in calamity-create-story.js.
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
		// Single value, not a list -- Story stores cycle as a plain string.
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
		// At-a-glance mirror of the current stage's own editorial-status --
		// `stage` itself isn't collected here at all. It's auto-set to the
		// pipeline's first stage by Story's constructor once `category` is
		// known, so there's nothing meaningful to pick before that resolves.
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