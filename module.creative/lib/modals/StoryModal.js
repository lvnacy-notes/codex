import { BaseModal } from '../../../lib/modals/BaseModal.js';
import { Story } from '../objects/Story.js';

// Story's `category` (length/form) is "pick one," not stackable -- cycle is
// the separate, stackable series-participation field. That's why this uses
// a plain dropdown rather than BaseModal.buildCategorySetting()/
// Story.categoryOptions(): that mechanism assumes a multi-select, stackable
// vocabulary, which doesn't fit a pick-one field. `flash-fiction` is
// deliberately excluded -- folded into `short-story` going forward -- so
// every option here always resolves to a real stage pipeline.
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
			category: '',
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
		this.buildDropdownSetting(
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