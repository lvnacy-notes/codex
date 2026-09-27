import { BaseClass, buildFrontmatterBlock } from '../../core.apparatus/objects/BaseClass.js';
import { getStagePipeline } from '../core/manuscriptPipelines.js';
import { Scene } from './Scene.js';

export class Story extends BaseClass {
	static classValue = 'story';

	constructor(app, options = {}) {
		super(app, options);
		// Series participation -- stackable, paired with affiliations to
		// identify which series/world this story belongs to. Optional.
		this.cycle = options.cycle ?? '';
		this.title = options.title ?? this.filename;
		// Abbreviated title -- exists only on the Story card itself (not on
		// Scene/Manuscript). Required at story-creation time: it names this
		// story's generated scene Templater templates (e.g.
		// `${titleAbbv}-scene-editorial.md`), enforced by the calling
		// command since StoryModal has no built-in required-field check.
		this.titleAbbv = options.titleAbbv ?? '';
		this.gitRepoUrl = options.gitRepoUrl ?? '';
		this.storyStatus = options.storyStatus ?? '';
		// stage/editorial-status here mirror the story's currently-active
		// manuscript stage, so this one note shows project status at a
		// glance without opening the stage folder itself. story-status is
		// listed first in frontmatter (overall lifecycle), then stage,
		// then editorial-status (that stage's own progress -- same field
		// name/vocab as the stage's own Manuscript note, mirrored here for
		// at-a-glance visibility; no separate "stage-status" domain).
		// Defaults to the pipeline's first stage when not supplied, since
		// a newly-scaffolded story always starts at stage one.
		this.stage = options.stage ?? this.pipeline[0];
		this.editorialStatus = options.editorialStatus ?? '';
		// Map of stage name -> manuscript note basename, for the wikilinks
		// in frontmatter. Stages with no note yet (not created) render
		// blank -- Phase 2's orchestration layer fills these in as it
		// creates each Manuscript.
		this.manuscriptLinks = options.manuscriptLinks ?? {};
		this.published = options.published ?? false;
		this.appleBooks = options.appleBooks ?? '';
		this.barnesNoble = options.barnesNoble ?? '';
		this.cover = options.cover ?? '';
		this.coverAltText = options.coverAltText ?? '';
		this.bookBlurb = options.bookBlurb ?? '';
		this.pdf = options.pdf ?? '';
		this.epub = options.epub ?? '';
	}

	// Vault tag scoping this story's notes -- derived from title, single
	// source of truth (no separate tag input needed at creation time).
	get storyTag() {
		return this.title.replace(/\s+/g, '-').toLowerCase();
	}

	// This story's stage list, resolved from its own category (length/
	// form) via the shared pipeline config. Throws if category isn't a
	// recognized length/form -- e.g. flash-fiction, which has no pipeline
	// defined yet.
	get pipeline() {
		return getStagePipeline(this.category);
	}

	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();
		const manuscriptLinkFields = {};
		for (const stage of this.pipeline) {
			const basename = this.manuscriptLinks[stage];
			manuscriptLinkFields[stage] = basename ? `[[${ basename }]]` : '';
		}
		return {
			class: base.class,
			category: base.category,
			cycle: this.cycle,
			affiliations: base.affiliations,
			title: this.title,
			'title-abbv': this.titleAbbv,
			'git-repo-url': this.gitRepoUrl,
			created: base.created,
			modified: base.modified,
			'story-status': this.storyStatus,
			stage: this.stage,
			'editorial-status': this.editorialStatus,
			...manuscriptLinkFields,
			published: this.published,
			'apple-books': this.appleBooks,
			'barnes-noble': this.barnesNoble,
			cover: this.cover,
			'cover-alt-text': this.coverAltText,
			'book-blurb': this.bookBlurb,
			pdf: this.pdf,
			epub: this.epub,
			'sorting-spec': buildSortingSpec(this.pipeline, this.storyTag),
			// Story's own tag always applies to itself, even if the caller
			// didn't think to pass it explicitly via options.tags.
			tags: Array.from(new Set([this.storyTag, ...base.tags])),
		};
	}

	getBody() {
		return buildStoryDashboard({
			title: this.title,
			storyTag: this.storyTag,
			pipeline: this.pipeline,
		});
	}

	// Templater `.md` scene templates for this story, generated once at
	// story-creation time and placed at the story project's own root
	// folder (not per-stage). These are templates, not live scene notes:
	// most fields are left blank for the user to fill in per real note,
	// only `tags` (this story's own tag) is always prefilled, `created`
	// is left as Templater's own `<% tp.date.now() %>` syntax rather than
	// a real date, and `modified` is left for a future pass. Serial
	// projects get three stage-specific templates -- serial-draft,
	// reassembly, and a stage-agnostic editorial template covering the
	// remaining numbered edit stages (1st-edit/2nd-edit/3rd-edit/final,
	// which all share the same shape); every other category gets just
	// the one stage-agnostic editorial template. Each returned template's
	// `suffix` matches what sceneTemplateSuffixForStage() below produces,
	// so a caller can build a suffix -> path map here and look it up
	// per-stage there.
	buildSceneTemplates() {
		const templateSpecs = this.category === 'serial'
			? [
				{ suffix: SCENE_TEMPLATE_SUFFIXES.SERIAL, stage: Scene.SERIAL_STAGE },
				{ suffix: SCENE_TEMPLATE_SUFFIXES.REASSEMBLY, stage: 'reassembly' },
				{ suffix: SCENE_TEMPLATE_SUFFIXES.EDITORIAL, stage: '' },
			]
			: [
				{ suffix: SCENE_TEMPLATE_SUFFIXES.EDITORIAL, stage: '' },
			];

		return templateSpecs.map(({ suffix, stage }) => ({
			suffix,
			filename: `${ this.titleAbbv }-${ suffix }.md`,
			content: buildSceneTemplateContent(this.app, this.storyTag, stage),
		}));
	}
}

// Suffixes used to both name a story's generated scene templates (see
// buildSceneTemplates() above) and, via sceneTemplateSuffixForStage() below,
// look up which one applies to a given manuscript stage. Kept as one map so
// the two stay in sync by construction rather than by convention.
const SCENE_TEMPLATE_SUFFIXES = {
	SERIAL: 'scene-serial',
	REASSEMBLY: 'scene-reassembly',
	EDITORIAL: 'scene-editorial',
};

// Which scene-template suffix a given pipeline stage should use --
// serial-draft and reassembly each get their own dedicated template, every
// other stage (including a serial project's own trailing edit stages, and
// every stage of a non-serial project) shares the one general editorial
// template. Exported so calamity-create-story.js can look up, per stage,
// which of the templates built by buildSceneTemplates() to wire into that
// stage's Manuscript.longform.sceneTemplate.
export function sceneTemplateSuffixForStage(stage) {
	if (stage === Scene.SERIAL_STAGE) {
		return SCENE_TEMPLATE_SUFFIXES.SERIAL;
	}
	if (stage === 'reassembly') {
		return SCENE_TEMPLATE_SUFFIXES.REASSEMBLY;
	}
	return SCENE_TEMPLATE_SUFFIXES.EDITORIAL;
}

// One-line folder-tree descriptions for stages with conventional meaning.
// Any stage not listed here (a custom/renamed stage) falls back to its own
// name rather than an empty description.
const STAGE_DESCRIPTIONS = {
	'shitty-first-draft': 'shitty first draft, obviously',
	'serial-draft': 'initial serialized draft',
	'reassembly': 'reassembling serialized posts into thematic chapters',
	'1st-edit': 'Developmental editing pass',
	'2nd-edit': 'Copy editing & continuity pass',
	'3rd-edit': 'Line editing & polish',
	'final': 'Publication-ready version',
};

// Builds one scene template's full file content (frontmatter + body) via a
// throwaway Scene instance -- reused rather than duplicated so template
// output always matches Scene.js's own field set, ordering, and
// editorial-status/serial-status derivation. This instance is never
// .create()'d (no file-existence check, no folder creation, no real vault
// write): only its getFrontmatterFields()/getBody() are used, and `created`
// is overwritten afterward with Templater's own date syntax.
function buildSceneTemplateContent(app, storyTag, stage) {
	const scene = new Scene(app, {
		filename: 'scene-template-placeholder',
		stage,
		editorialStatus: '',
		chapter: '',
		context: '',
		tags: [ storyTag ],
	});
	const fields = scene.getFrontmatterFields();
	fields.created = '<% tp.date.now() %>';
	return `${ buildFrontmatterBlock(fields) }\n\n${ scene.getBody() }`;
}

function buildFolderTreeLines(pipeline) {
	return pipeline.map((stage, i) => {
		const description = STAGE_DESCRIPTIONS[stage] ?? stage;
		if (i === 0) {
			// The first stage's folder note also carries the story bible --
			// synopsis, character/faction/glossary tables, outline -- so it
			// gets the expanded comment every other stage doesn't.
			return `\u251c\u2500\u2500 ${ stage }/           # ${ description }\n\u2502   \u2514\u2500\u2500 ${ stage }.md     # contains:\n\u2502                                   - Longform project config\n\u2502                                   - story synopsis\n\u2502                                   - character, faction, glossary tables\n\u2502                                   - story outline`;
		}
		return `\u251c\u2500\u2500 ${ stage }/                     # ${ description }\n\u2502   \u2514\u2500\u2500 ${ stage }.md               # Longform project config`;
	}).join('\n');
}

function buildSortingSpec(pipeline, storyTag) {
	return [
        ...pipeline,
        '%',
        'images',
        'ARCHIVE',
        storyTag
    ].join('\n');
}

function buildStoryDashboard({ title, storyTag, pipeline }) {
	return `# contents

\`\`\`toc
\`\`\`

# progress dashboard

## stage completion

**Stage Completion Status:**
\`\`\`dataviewjs
const { getStagePipeline } = await requireAsync('/.obsidian/apparatus/creative/core/manuscriptPipelines.js');
const stages = getStagePipeline(dv.current().category);
const allScenes = dv.pages("#${ storyTag }").where(p => \`\${ p.class }\`.includes("scene"));

// serial-draft scenes carry serial-status (its own vocabulary, distinct
// completion label) instead of editorial-status -- everything else uses
// the shared editorial-status vocabulary. In each list, the last value is
// treated as the "done" state driving the completion percentage.
const STATUS_VALUES_BY_STAGE = {
	'serial-draft': ['backlog', 'active', 'ready', 'published'],
};
const DEFAULT_STATUS_VALUES = ['not-started', 'in-progress', 'revision', 'complete'];

for (let stage of stages) {
	const scenes = allScenes.where(p => \`\${ p.stage }\`.includes(stage));
	const total = scenes.length;
	const values = STATUS_VALUES_BY_STAGE[stage] ?? DEFAULT_STATUS_VALUES;
	const statusOf = (p) => stage === 'serial-draft' ? p["serial-status"] : p["editorial-status"];
	const counts = values.map((v) => scenes.where(p => statusOf(p) === v).length);
	const doneLabel = values[values.length - 1];
	const doneCount = counts[counts.length - 1];
	const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
	const breakdown = values.slice(0, -1).map((v, i) => \`\${ counts[i] } \${ v }\`).join(' | ');
	dv.paragraph(\`**\${ stage }**: \${doneCount}/\${total} \${doneLabel} (\${percent}%) | \${breakdown}\`);
}
\`\`\`

## word count

> [!info] Word count requires the [Novel Word Count](https://github.com/isaaclyman/novel-word-count-obsidian) plugin or equivalent. Alternatively, track manually using the field below in each scene's frontmatter: \`word-count: [n]\`

**Word Count by Stage:**
\`\`\`dataviewjs
const allScenes = dv.pages("#${ storyTag }").where(p => \`\${ p.class }\`.includes("scene"));
const { getStagePipeline } = await requireAsync('/.obsidian/apparatus/creative/core/manuscriptPipelines.js');
const stages = getStagePipeline(dv.current().category);

for (let stage of stages) {
	const scenes = allScenes.where(p => \`\${ p.stage }\`.includes(stage));
	if (scenes.length === 0) continue;
	const total = scenes
		.map(p => p["word-count"] ?? 0)
		.array()
		.reduce((a, b) => a + b, 0);
	dv.paragraph(\`**\${ stage }**: \${total.toLocaleString()} words across \${scenes.length} scene(s)\`);
}
\`\`\`

## scene status by stage

**All Scenes Across Stages:**
\`\`\`dataview
TABLE WITHOUT ID
	file.link as Scene,
	chapter as Ch,
	stage as Stage,
	default(editorial-status, serial-status) as Status,
	word-count as Words,
	modified as "Last Edit"
FROM
	#${ storyTag }
WHERE
	contains(class, "scene")
SORT
	stage asc, chapter asc
\`\`\`

## scene lineage

### cross-stage lineage

#### Shitty First Draft → 1st-edit
\`\`\`dataview
TABLE WITHOUT ID
	source as "Shitty First Draft Scene",
	rows.file.link as "1st-edit Scenes"
FROM
	#${ storyTag }
WHERE
	contains(class, "scene") AND
	contains(stage, "1st-edit") AND
	context
FLATTEN
	context as source
GROUP BY
	source
SORT
	source ASC
\`\`\`

#### 1st-edit → 2nd-edit
\`\`\`dataview
TABLE WITHOUT ID
	source as "1st-edit Scene",
	rows.file.link as "2nd-edit Scenes"
FROM
	#${ storyTag }
WHERE
	contains(class, "scene") AND
	contains(stage, "2nd-edit") AND
	context
FLATTEN
	context as source
GROUP BY
	source
SORT
	source ASC
\`\`\`

#### 2nd-edit → 3rd-edit
\`\`\`dataview
TABLE WITHOUT ID
	source as "2nd-edit Scene",
	rows.file.link as "3rd-edit Scenes"
FROM
	#${ storyTag }
WHERE
	contains(class, "scene") AND
	contains(stage, "3rd-edit") AND
	context
FLATTEN
	context as source
GROUP BY
	source
SORT
	source ASC
\`\`\`

## recent activity

**Recently Modified Scenes:**
\`\`\`dataview
TABLE WITHOUT ID
	file.link as Scene,
	stage as Stage,
	chapter as "Ch",
	default(editorial-status, serial-status) as Status,
	modified as "Last Modified"
FROM
	#${ storyTag }
WHERE
	contains(class, "scene")
SORT
	modified DESC
LIMIT 10
\`\`\`

## unresolved editorial notes

**Scenes Needing Attention:**
\`\`\`dataview
TABLE WITHOUT ID
	file.link as Scene,
	stage as Stage,
	default(editorial-status, serial-status) as Status
FROM
	#${ storyTag }
WHERE
	contains(class, "scene") AND
	(
		contains(stage, "1st-edit") OR
		contains(stage, "2nd-edit") OR
		contains(stage, "3rd-edit")
	) AND
	contains(default(editorial-status, serial-status), "revision")
SORT
	stage ASC, chapter ASC
\`\`\`

## inline comments

\`\`\`dataviewjs
const { getStagePipeline } = await requireAsync('/.obsidian/apparatus/creative/core/manuscriptPipelines.js');
const commentStages = getStagePipeline(dv.current().category).slice(0, -1);
const pages = dv.pages("#${ storyTag }")
	.where(p => \`\${p.class}\`.includes("scene"))
	.where(p => commentStages.some((stage) => \`\${p.stage}\`.includes(stage)));

const results = [];
for (const page of pages) {
	const file = app.vault.getAbstractFileByPath(page.file.path);
	if (!file) continue;
	const content = await app.vault.read(file);
	if (!content) continue;
	const matches = [...content.matchAll(/<!--\\s*([\\s\\S]*?)-->/g)];
	for (const match of matches) {
		const raw = match[1].trim();
		const named = raw.match(/^([A-Za-z][\\w'-]*)\\s*:\\s*([\\s\\S]*)$/);
		const author = named ? named[1] : "author";
		const comment = (named ? named[2] : raw).trim();
		results.push([page.file.link, page.stage, author, comment]);
	}
}

if (results.length === 0) {
	dv.paragraph("✓ No inline comments.");
} else {
	dv.table(["Scene", "Stage", "Author", "Comment"], results);
}
\`\`\`

# project organization

The story project is broken up into two primary categories: structure and narrative. Project organization and standardized processes comprise the structure. Outlines, notes, drafts, and edits comprise the narrative.

## folder structure

\`\`\`
${ title }/
├── ${ title }.md${ ' '.repeat(Math.max(1, 13 - title.length)) }# project specifications
${ buildFolderTreeLines(pipeline) }
├── world-building docs           # characters, factions, locations, etc
├── glossary/                     # worldbuilding vernacular
├── graphics                      # book covers, marketing assets, etc
├── [miscellany] 
└── ARCHIVE/
		├── ARCHIVE.md            # status + integrity dashboards
		├── DRAFTS/               # Timestamped snapshots of completed stages
		│   ├── [YYYY-MM-DD]-${ pipeline[0] }/
		│   └── [...]
		└── CHANGELOG/            # record of changes
\`\`\`

Folders are organized via the [Obsidian Custom File Explorer sorting plugin](https://github.com/SebastianMC/obsidian-custom-sort) and lead with the drafts folders which are organized by revision stage. See [[\`${ title }\`#revision workflow]]. The story outline lives in the folder note of the first draft, which also contains the preliminary Longform config.

Each stage folder functions as an independent Longform project. Scenes are copied forward to the next stage; the previous stage is archived to \`ARCHIVE/DRAFTS/[YYYY-MM-DD]-[stage-name]/\` as a snapshot once the draft is complete and the scenes have all been copied into the next stage.

# revision workflow

${ title } moves through a structured editorial pipeline from shitty first draft → staged editing revisions → final publication version. Each stage is managed as a separate Longform project, enabling isolated focus on specific editorial objectives while preserving complete revision history through comprehensive frontmatter tracking.

**Current stage**: ${ pipeline.map((s) => '\`' + s + '\`').join(' → ') } → publishing

## status tracking

Two separate status fields operate at two separate levels, and neither substitutes for the other:

- **\`editorial-status\`** (scene-level, on individual scene notes) tracks a single scene's own progress. Scenes at the \`serial-draft\` stage use \`serial-status\` instead of \`editorial-status\` -- same role, different field name, since a serial's first stage is tracked distinctly.
- **\`editorial-status\`** (manuscript-level, on this story's per-stage folder notes -- same field name as the scene-level property above, distinct by note class rather than by name) tracks the progress of an entire stage as a whole, independent of any individual scene's status. That stage note's own \`editorial-status\` is what this story's own \`editorial-status\` field (in its frontmatter) mirrors for at-a-glance visibility.

**Editorial/Serial Status Values** (scene-level):
- \`backlog\`: Not yet started
- \`in-progress\`: Currently being written or revised
- \`revision\`: Review complete; requires additional changes
- \`complete\`: Editorial review complete; ready for the next stage

Scenes transition through these states multiple times across different stages. A scene marked \`complete\` in \`shitty-first-draft\` resets to \`in-progress\` (or \`backlog\`) when copied to \`1st-edit\`, beginning a new editorial cycle.

## frontmatter specification

### universal fields (all scenes in all stages)

\`\`\`yaml
class: scene                           # Always 'scene'
category: [draft]                      # Writing or editing
created: YYYY-MM-DD                    # When scene was first created
modified: YYYY-MM-DD                   # When last modified
stage: ${ '[' + pipeline.join('|') + ']' }  # Current stage
chapter: [number]                      # Reference to source chapter in ${ pipeline[0] }
context: [[I]], [[II]]                 # Prior draft scene mapping (use wiki links)
tags: [${ storyTag }]                  # Project identifier and additional metadata for dataview flexibility
\`\`\`

> [!info] A Note About "context"
> The \`context\` field was originally designed to generate backlinks between a serial draft's scene (from serial story scaffolds) and its related post dashboard for publication. It now serves to manage backlinks between drafts for historical benefit: \`context\` maps the prior scene or scenes to the current scene. Because drafts are not set in stone until **final**, this provides historical context of all scenes. Example when using \`context\` in _1st-edit_:
> \`\`\`
> context: [[lunch]], [[the garden]]
> \`\`\`

### status fields

\`\`\`yaml
editorial-status: [backlog|in-progress|revision|complete]  # every stage except serial-draft
serial-status: [backlog|in-progress|revision|complete]     # serial-draft scenes only
\`\`\`

**editorial-status** / **serial-status:** scene-level editorial state. See [[${ title }#status tracking]] above.

## editorial workflow

### stage transitions

1. **Before copying to next stage:**
	- Verify all inline comments in current stage have been addressed and removed
	- Archivist snapshots the completed stage to \`ARCHIVE/DRAFTS/[YYYY-MM-DD]-[stage-name]/\`

2. **When copying to next stage:**
	- Copy all scene files from current stage to next stage folder
	- Update frontmatter: change \`stage:\` field to new stage name
	- Update frontmatter: reset the scene's status field to \`in-progress\` or \`backlog\`

3. **After promotion:**
	- Update this story's own \`stage\`/\`editorial-status\` fields to reflect the new active stage

### inline editorial comments

use \`<!-- [editor-initials]: [comment] [date] -->\` format for prose-level feedback.

Example:

\`\`\`markdown
Solomon's hand trembles as he traces the ward.

<!-- ME: expand psychological tension here—is this moment
of doubt or determination? The reader needs to feel
the weight of his choice. 2026-02-24 -->

He whispers the incantation, knowing it will be useless.
\`\`\`

For multi-line comment blocks:

\`\`\`markdown
<!-- EDITOR NOTES: Dreamwalk mechanics -->

[Scene content discussing dimensional boundaries...]

<!-- END EDITOR NOTES -->
\`\`\`

Mark resolved comments with \`[RESOLVED]\` before moving to later stages:

\`\`\`markdown
<!-- [RESOLVED] ME: expanded internal conflict (see lines 18-31). 2026-03-01 -->
\`\`\`

## longform project configuration template

Each stage folder contains \`[stage-name]/[stage-name].md\` with this structure:

\`\`\`yaml
---
class: manuscript
category: draft
stage:
editorial-status:
longform:
  format: scenes
  title: ${ title }
  draftTitle: [stage name]
  workflow: Default Workflow
  sceneFolder: /
  sceneTemplate: [path to matching scene template]
  scenes: [I, II, III, ...]     # List in current ordering
sorting-spec: |
  < a-z by-metadata: chapter
tags:
  - ${ storyTag }
---

# [Stage Name]

\`\`\`

Populate \`scenes:\` array with the ordered list of scene filenames for that stage. This can also be managed through the Longform plugin's interface.

## scene naming evolution

Scene names may evolve across stages to reflect deepened understanding. Track lineage through \`context\` using wikilinks to prior-stage scenes.

Example evolution:
\`\`\`yaml
# 1st-edit
class: scene
chapter: 4
context: [[oriented]]

# 2nd-edit (if renamed)
class: scene
chapter: 4
context: [[disoriented]]
# [scene now called something else; context links back]

# 3rd-edit
class: scene
chapter: 4
context: [[1st-edit scene name]]
\`\`\`

## implementation checklist

- [ ] Create folders: ${ pipeline.slice(1).map((s) => '\`' + s + '\`').join(', ') }
- [ ] Create \`[stage-name].md\` Longform config in each folder
- [ ] Copy \`${ pipeline[0] }\` scenes forward to the next stage
- [ ] Update frontmatter on all scenes: \`stage:\`, and \`editorial-status:\`/\`serial-status:\`
- [ ] Verify Longform plugin recognizes all ${ pipeline.length } active projects
- [ ] Document editorial conventions in project README or this section for new collaborators
`;
}