---
class: archive
category: specification
affiliations:
created: 2026-11-10
modified: 2026-11-11
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[BaseClass.js Specification]]"
  - "[[Manuscript.js Specification]]"
  - "[[Scene.js Specification]]"
  - "[[StoryArchive.js Specification]]"
tags:
---
Story project note. Holds the story's metadata and lifecycle, links to one manuscript note per pipeline stage, and supplies the progress dashboard and project documentation in its body.

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

`Story` extends `BaseClass`. It adds the story's identity, lifecycle, publication, and manuscript-link fields, derives a vault tag and a stage pipeline from `title` and `category`, and generates the scene templates that accompany the story (§9).

`Story` is the root of the story scaffold. `creative-create-story.js` creates the scene templates, one `Manuscript` per pipeline stage, and the `StoryArchive` around it, then writes the story note last (§8).

| Property | Value |
| --- | --- |
| Location | `.codex/creative/objects/Story.js` |
| Export | `Story` (named) |
| Extends | `BaseClass` (`.codex/core/objects/BaseClass.js`) |
| Module | Creative |
| Accompanying modal | `StoryModal`, see §7 |
| Command | `creative-create-story.js`, see §8 |

Inherited behavior is specified in [[BaseClass.js Specification]]. Members with Kind `hook` in this spec are `Story`'s overrides of `BaseClass` hooks.

**Error handling:** `Story` adds no logging. It throws only what `BaseClass` throws and what the stage-pipeline lookup throws (§6).

**Dependencies**

| Import | Source | Use |
| --- | --- | --- |
| `BaseClass` | `../../core/objects/BaseClass.js` | Superclass |
| `Scene` | `./Scene.js` | Builds the scene templates (§9) |
| `SCENE_TEMPLATE_SUFFIXES` | `../controls/scene-template-helpers.js` | Scene template filename suffixes (§9) |
| `getStagePipeline` | `../controls/manuscript-pipelines.js` | Resolves the stage list (§6) |
| `buildFrontmatterBlock` | `../../frontmatter` | Renders scene template frontmatter (§9) |

**Helper modules**

| Module | Location | Documented in |
| --- | --- | --- |
| `manuscript-pipelines.js` | `.codex/creative/controls/manuscript-pipelines.js` | §6 |
| `scene-template-helpers.js` | `.codex/creative/controls/scene-template-helpers.js` | §9 |

**Constructor options**

All `BaseClass` options apply, as specified in [[BaseClass.js Specification]] §1. `Story` adds:

| Option | Default | Stored as |
| --- | --- | --- |
| `options.cycle` | `''` | `this.cycle` |
| `options.title` | `this.filename` | `this.title` |
| `options.titleAbbv` | `''` | `this.titleAbbv` |
| `options.gitRepoUrl` | `''` | `this.gitRepoUrl` |
| `options.vaultMembership` | `[]` | `this.vaultMembership` |
| `options.storyStatus` | `''` | `this.storyStatus` |
| `options.stage` | `this.pipeline[0]` | `this.stage` |
| `options.editorialStatus` | `''` | `this.editorialStatus` |
| `options.manuscriptLinks` | `{}` | `this.manuscriptLinks` |
| `options.envoyProject` | `''` | `this.envoyProject` |
| `options.published` | `false` | `this.published` |
| `options.appleBooks` | `''` | `this.appleBooks` |
| `options.barnesNoble` | `''` | `this.barnesNoble` |
| `options.cover` | `''` | `this.cover` |
| `options.coverAltText` | `''` | `this.coverAltText` |
| `options.bookBlurb` | `''` | `this.bookBlurb` |
| `options.pdf` | `''` | `this.pdf` |
| `options.epub` | `''` | `this.epub` |

`this.manuscriptLinks` maps a stage name to the basename of that stage's manuscript note.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, options = {})` | instance | Calls `super(app, options)`, then stores the options above. `title` defaults to the filename. `stage` defaults to the first stage of the story's pipeline, which is resolved only when `options.stage` is not supplied. Throws what the `BaseClass` constructor throws, and the `pipeline` error (§6) when `options.stage` is not supplied and `category[0]` is empty or has no pipeline. Does not validate `titleAbbv`. | `stage` and `editorialStatus` mirror the story's active manuscript stage, so one note shows project status at a glance. `stage` defaults to the first stage because a new story starts at stage one. |
| `static classValue` | hook | Set to `'story'`. Written to the `class` frontmatter field. | — |

## 2. Frontmatter Fields
---

**Inherited fields:** `class`, `category`, `affiliations`, `created`, `modified`, and `tags`, as specified in [[BaseClass.js Specification]] §2. `tags` always includes the story's own tag (§6). `context` is not rendered. **Class-specific fields:** every other field below.

**Fields**, in render order, as returned by `getFrontmatterFields()`:

| Order | Key | Value | Rendered when empty |
| --- | --- | --- | --- |
| 1 | `class` | `base.class` | `class:` |
| 2 | `category` | `base.category` | `category:` |
| 3 | `affiliations` | `base.affiliations` | `affiliations:` |
| 4 | `cycle` | `this.cycle` | `cycle:` |
| 5 | `title` | `this.title` | `title:` |
| 6 | `title-abbv` | `this.titleAbbv` | `title-abbv:` |
| 7 | `sort-title` | `this.sortTitle` | `sort-title:` |
| 8 | `git-repo-url` | `this.gitRepoUrl` | `git-repo-url:` |
| 9 | `vault-membership` | `this.vaultMembership` | `vault-membership:` |
| 10 | `created` | `base.created` | n/a |
| 11 | `modified` | `base.modified` | `modified:` |
| 12 | `story-status` | `this.storyStatus` | `story-status:` |
| 13 | `stage` | `this.stage` | `stage:` |
| 14 | `editorial-status` | `this.editorialStatus` | `editorial-status:` |
| 15 | one key per pipeline stage | `[[<basename>]]` from `this.manuscriptLinks[stage]` | `<stage>:` |
| 16 | `envoy-project` | `this.envoyProject` | `envoy-project:` |
| 17 | `published` | `this.published` | n/a (renders `published: false` by default) |
| 18 | `apple-books` | `this.appleBooks` | `apple-books:` |
| 19 | `barnes-noble` | `this.barnesNoble` | `barnes-noble:` |
| 20 | `cover` | `this.cover` | `cover:` |
| 21 | `cover-alt-text` | `this.coverAltText` | `cover-alt-text:` |
| 22 | `book-blurb` | `this.bookBlurb` | `book-blurb:` |
| 23 | `pdf` | `this.pdf` | `pdf:` |
| 24 | `epub` | `this.epub` | `epub:` |
| 25 | `sorting-spec` | `buildSortingSpec(this.pipeline, this.storyTag)` | n/a |
| 26 | `tags` | The story tag first, then `base.tags`, with duplicates removed | `tags:` |

`base` is the object returned by `baseFrontmatterFields()`. Stage keys (order 15) follow the order of `this.pipeline`. A stage with no basename in `this.manuscriptLinks` renders empty.

**Class-specific field meanings**

| Key | Meaning |
| --- | --- |
| `cycle` | The series the story is part of. A single value. The world the series belongs to is listed in `affiliations`. Optional. |
| `title` | The story's title. Defaults to the filename. Source of the story tag (§6). |
| `title-abbv` | Abbreviated title. Exists only on the story note. Names the generated scene templates (§9). |
| `sort-title` | `title` without a leading `The`, `A`, or `An`. Gives true alphabetical ordering of stories. Derived, never supplied. |
| `git-repo-url` | Stored as supplied. |
| `vault-membership` | List of the vaults the story is kept in, so stories kept in other vaults can be identified from the main vault. |
| `story-status` | Lifecycle of the story as a whole (§4). |
| `stage` | The story's currently active manuscript stage. |
| `editorial-status` | Progress of the active stage, mirroring the stage's own manuscript note (§4). |
| one key per pipeline stage | Wikilink to that stage's manuscript note. |
| `envoy-project`, `published`, `apple-books`, `barnes-noble`, `cover`, `cover-alt-text`, `book-blurb`, `pdf`, `epub` | Stored as supplied. Left at their defaults at creation. |
| `sorting-spec` | Custom File Explorer sorting specification for the story folder: the stage folders in pipeline order, then `%`, `images`, `ARCHIVE`, and the story tag, one per line. |

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getFrontmatterFields()` | hook | Returns the fields above in the order above. Throws the `pipeline` error (§6) when `category[0]` is empty or has no pipeline. | Order runs from overall lifecycle (`story-status`) to the active stage (`stage`) to that stage's progress (`editorial-status`). The story's own tag is always merged into `tags`, even when the caller omits it. |
| `get sortTitle()` | getter | Returns `title` with one leading `The`, `A`, or `An` removed, case-insensitive, when it is followed by whitespace and further text. Returns `title` unchanged otherwise, including when `title` is only an article. | Derived from `title`, so no separate input is needed. A leading article does not affect where a story sorts. |
| `buildSortingSpec(pipeline, storyTag)` | internal | Returns the stages in order, then `%`, `images`, `ARCHIVE`, and `storyTag`, joined by newlines. | — |

## 3. Category Vocabulary
---

A story has exactly one length/form. `category` holds it as a one-element array, and `Story` reads only `category[0]`. The valid values are `short-story`, `novelette`, `novella`, `novel`, and `serial`, each of which resolves to a stage pipeline (§6). See [[Apparatus Module Taxonomy]].

`Story` does not override `categoryOptions()`. `StoryModal` reads the vocabulary from its own `STORY_CATEGORY_OPTIONS` and renders it as a pick-one dropdown, not through `BaseModal.buildCategorySetting()`.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `STORY_CATEGORY_OPTIONS` | internal | `['short-story', 'novelette', 'novella', 'novel', 'serial']`. Declared in `StoryModal.js`. | A story has exactly one length/form, so the modal renders a pick-one dropdown stored as a one-element array, not the stackable multi-select. |

## 4. Status Field
---

A story carries two status fields. Both are domain-scoped properties registered in [[Apparatus Status Taxonomy]]:

| Key | Meaning | Values offered by `StoryModal` |
| --- | --- | --- |
| `story-status` | Lifecycle of the story as a whole. | `backlog`, `active`, `paused`, `complete`, `abandoned`, `archived` |
| `editorial-status` | Progress of the story's active stage, mirroring that stage's own manuscript note. | `backlog`, `in-progress`, `revision`, `complete` |

`Story` always writes the second field under the key `editorial-status`, including at the `serial-draft` stage. The class does not validate either value. The value lists are declared inline in `StoryModal.onOpen()`; `Story.js` declares none. No members.

## 5. Body Content
---

`getBody()` returns the story dashboard and project documentation, generated by `buildStoryDashboard` from the story's `title`, `storyTag`, and `pipeline`. Every query is scoped to notes tagged with the story tag.

**Sections**, in order:

| Heading | Content | Varies with |
| --- | --- | --- |
| `# contents` | Table of contents. | Nothing |
| `# progress dashboard` | The query sections listed below. | `storyTag` |
| `# project organization` | `## folder structure`: a folder tree and two paragraphs on the sorting plugin, Longform stage projects, and archive snapshots. | `title`, the stage list |
| `# revision workflow` | An introductory paragraph and the pipeline as a stage chain ending in `publishing`, then the sections below. | `title`, the stage list |
| `## status tracking` | The two status levels (scene and manuscript) and a value list for scene-level status. | Nothing |
| `## frontmatter specification` | `### universal fields`: a YAML block of the scene fields and a note on `context`. `### status fields`: a YAML block of the two scene status keys. | `title`, `storyTag`, the stage list |
| `## editorial workflow` | `### stage transitions`: three numbered steps. `### inline editorial comments`: the comment format, multi-line blocks, and the `[RESOLVED]` convention. | Nothing |
| `## longform project configuration template` | A YAML template of a stage's manuscript note. | `title`, `storyTag` |
| `## scene naming evolution` | How `context` tracks a renamed scene across stages, with an example. | Nothing |
| `## implementation checklist` | A task list. | The stage list |

**Progress dashboard queries.** `<storyTag>` stands for the story tag. Each is shown as generated.

**stage completion** (`## stage completion`). Loads `getStagePipeline` with `requireAsync`, takes the first value of the current note's `category`, and gets its stage list. For each stage it counts scenes tagged `<storyTag>` at that stage by status. `serial-draft` scenes are read through `serial-status` with the values `backlog`, `active`, `ready`, `published`. Every other stage is read through `editorial-status` with `not-started`, `in-progress`, `revision`, `complete`. The last value is the done state. Prints one line per stage: done over total, the done label, the percentage, and the count of each remaining value.

```js
const { getStagePipeline } = await requireAsync('/.codex/creative/controls/manuscript-pipelines.js');
const [category] = dv.current().category;
const stages = getStagePipeline(category);
const allScenes = dv.pages("#<storyTag>").where(p => `${ p.class }`.includes("scene"));

// serial-draft scenes carry serial-status (its own vocabulary, distinct
// completion label) instead of editorial-status -- everything else uses
// the shared editorial-status vocabulary. In each list, the last value is
// treated as the "done" state driving the completion percentage.
const STATUS_VALUES_BY_STAGE = {
	'serial-draft': ['backlog', 'active', 'ready', 'published'],
};
const DEFAULT_STATUS_VALUES = ['not-started', 'in-progress', 'revision', 'complete'];

for (let stage of stages) {
	const scenes = allScenes.where(p => `${ p.stage }`.includes(stage));
	const total = scenes.length;
	const values = STATUS_VALUES_BY_STAGE[stage] ?? DEFAULT_STATUS_VALUES;
	const statusOf = (p) => stage === 'serial-draft' ? p["serial-status"] : p["editorial-status"];
	const counts = values.map((v) => scenes.where(p => statusOf(p) === v).length);
	const doneLabel = values[values.length - 1];
	const doneCount = counts[counts.length - 1];
	const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
	const breakdown = values.slice(0, -1).map((v, i) => `${ counts[i] } ${ v }`).join(' | ');
	dv.paragraph(`**${ stage }**: ${doneCount}/${total} ${doneLabel} (${percent}%) | ${breakdown}`);
}
```

**word count** (`## word count`). Sums the `word-count` frontmatter field of the scenes at each stage and prints the total and the scene count per stage. Skips stages with no scenes. A callout above it says the field comes from the Novel Word Count plugin or manual entry.

```js
const allScenes = dv.pages("#<storyTag>").where(p => `${ p.class }`.includes("scene"));
const { getStagePipeline } = await requireAsync('/.codex/creative/controls/manuscript-pipelines.js');
const [category] = dv.current().category;
const stages = getStagePipeline(category);

for (let stage of stages) {
	const scenes = allScenes.where(p => `${ p.stage }`.includes(stage));
	if (scenes.length === 0) continue;
	const total = scenes
		.map(p => p["word-count"] ?? 0)
		.array()
		.reduce((a, b) => a + b, 0);
	dv.paragraph(`**${ stage }**: ${total.toLocaleString()} words across ${scenes.length} scene(s)`);
}
```

**scene status by stage** (`## scene status by stage`). Lists every scene with its chapter, stage, status (`editorial-status`, falling back to `serial-status`), `word-count`, and `modified`, sorted by stage then chapter.

```text
TABLE WITHOUT ID
	file.link as Scene,
	chapter as Ch,
	stage as Stage,
	default(editorial-status, serial-status) as Status,
	word-count as Words,
	modified as "Last Edit"
FROM
	#<storyTag>
WHERE
	contains(class, "scene")
SORT
	stage asc, chapter asc
```

**cross-stage lineage** (`## scene lineage`). Three queries, one per stage pair: `Shitty First Draft → 1st-edit`, `1st-edit → 2nd-edit`, and `2nd-edit → 3rd-edit`. Each lists the scenes of the later stage grouped by the scene links in their `context`, so each prior-stage scene shows the scenes that descend from it. The stage names are fixed in the template, not derived from the pipeline.

```text
TABLE WITHOUT ID
	source as "Shitty First Draft Scene",
	rows.file.link as "1st-edit Scenes"
FROM
	#<storyTag>
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
```

```text
TABLE WITHOUT ID
	source as "1st-edit Scene",
	rows.file.link as "2nd-edit Scenes"
FROM
	#<storyTag>
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
```

```text
TABLE WITHOUT ID
	source as "2nd-edit Scene",
	rows.file.link as "3rd-edit Scenes"
FROM
	#<storyTag>
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
```

**recent activity** (`## recent activity`). Lists the ten most recently modified scenes with stage, chapter, and status.

```text
TABLE WITHOUT ID
	file.link as Scene,
	stage as Stage,
	chapter as "Ch",
	default(editorial-status, serial-status) as Status,
	modified as "Last Modified"
FROM
	#<storyTag>
WHERE
	contains(class, "scene")
SORT
	modified DESC
LIMIT 10
```

**unresolved editorial notes** (`## unresolved editorial notes`). Lists scenes at `1st-edit`, `2nd-edit`, or `3rd-edit` whose status contains `revision`, sorted by stage then chapter. The three stage names are fixed in the template.

```text
TABLE WITHOUT ID
	file.link as Scene,
	stage as Stage,
	default(editorial-status, serial-status) as Status
FROM
	#<storyTag>
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
```

**inline comments** (`## inline comments`). Gets the stage list as above and drops the last stage. Reads each scene note at those stages through `app.vault` and extracts every HTML comment. A comment of the form `Name: text` yields `Name` as the author and the rest as the comment; any other comment gets the author `author`. Prints a `Scene` / `Stage` / `Author` / `Comment` table, or `✓ No inline comments.` when there are none.

```js
const { getStagePipeline } = await requireAsync('/.codex/creative/controls/manuscript-pipelines.js');
const [category] = dv.current().category;
const commentStages = getStagePipeline(category).slice(0, -1);
const pages = dv.pages("#<storyTag>")
	.where(p => `${p.class}`.includes("scene"))
	.where(p => commentStages.some((stage) => `${p.stage}`.includes(stage)));

const results = [];
for (const page of pages) {
	const file = app.vault.getAbstractFileByPath(page.file.path);
	if (!file) continue;
	const content = await app.vault.read(file);
	if (!content) continue;
	const matches = [...content.matchAll(/<!--\s*([\s\S]*?)-->/g)];
	for (const match of matches) {
		const raw = match[1].trim();
		const named = raw.match(/^([A-Za-z][\w'-]*)\s*:\s*([\s\S]*)$/);
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
```

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getBody()` | hook | Returns the dashboard and documentation string for this story. Throws the `pipeline` error (§6) when `category[0]` is empty or has no pipeline. | — |
| `buildStoryDashboard({ title, storyTag, pipeline })` | internal | Returns the full body string, interpolating `title`, `storyTag`, and the stage list into the sections above. | — |
| `buildFolderTreeLines(pipeline)` | internal | Returns the stage entries of the folder tree, one per stage: the stage folder, its `<stage>.md` note, and the stage description. The first stage's note also lists the Longform config, story synopsis, character, faction, and glossary tables, and the story outline. | The first stage's folder note carries the story bible, so it gets the expanded comment the other stages do not. |
| `STAGE_DESCRIPTIONS` | internal | Maps the conventional stage names to a one-line description. | A stage with no entry falls back to its own name, so a custom or renamed stage never renders an empty description. |

## 6. Stage Pipeline and Story Tag
---

A story's stage list is fixed by its length/form. `pipeline` resolves it from `category[0]`. The `manuscript-pipelines.js` module holds the table.

| Length/form | Stages, in order |
| --- | --- |
| `short-story` | `shitty-first-draft`, `1st-edit`, `final` |
| `novelette` | `shitty-first-draft`, `1st-edit`, `2nd-edit`, `final` |
| `novella` | `shitty-first-draft`, `1st-edit`, `2nd-edit`, `3rd-edit`, `final` |
| `novel` | Same as `novella` |
| `serial` | `serial-draft`, `reassembly`, `1st-edit`, `2nd-edit`, `3rd-edit`, `final` |

`storyTag` is the story's title with every run of whitespace replaced by `-`, lowercased. It scopes every dashboard query, appears in `tags`, and ends the `sorting-spec`.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `get storyTag()` | getter | Returns `title` with whitespace runs replaced by `-`, lowercased. | Derived from `title`, so no separate tag input is needed at creation. |
| `get pipeline()` | getter | Returns `getStagePipeline(this.category[0])`. Throws when `category` is empty or its first value has no pipeline. | — |
| `getStagePipeline(lengthForm)` | function | Returns the ordered stage list for a length/form. Throws `No stage pipeline defined for length/form "<lengthForm>".` when there is none. | Stage lists live in one table keyed by length/form, so adding a length/form is a data change. |
| `getStageIndex(lengthForm, stage)` | function | Returns the zero-based position of `stage` in the pipeline. Throws `Stage "<stage>" is not part of the "<lengthForm>" pipeline.` when it is absent, and the `getStagePipeline` error when the length/form has no pipeline. | — |
| `getPriorStage(lengthForm, stage)` | function | Returns the stage before `stage`, or `null` for the first stage. Throws what `getStageIndex` throws. | — |
| `STAGE_PIPELINES` | internal | Table mapping each length/form to its stage list. | — |
| `NOVELLA_PIPELINE` | internal | The stage list shared by `novella` and `novel`. | — |

## 7. Modal
---

**Location:** `.codex/creative/modals/StoryModal.js`. Export: `StoryModal`, which extends `BaseModal`.

**Dependencies:** `BaseModal` from `../../core/modals/BaseModal.js`.

**Result object:** `this.result` is initialized by the `BaseModal` constructor, then assigned `titleAbbv: ''`, `category: []`, `cycle: ''`, `affiliations: []`, `gitRepoUrl: ''`, `vaultMembership: []`, `storyStatus: ''`, `editorialStatus: ''`, `tags: []`.

**Field build order**

`StoryModal.onOpen()` does not call `super.onOpen()`. It renders an `h2` reading `New Story`, then, in order:

| Order | Field | Builder | Result key |
| --- | --- | --- | --- |
| 1 | Title Abbreviation | `buildTextSetting` | `titleAbbv` |
| 2 | Category (length/form) | `buildDropdownArraySetting` with `STORY_CATEGORY_OPTIONS` | `category` |
| 3 | Affiliations | `buildListSuggestSetting` (frontmatter key `affiliations`) | `affiliations` |
| 4 | Cycle | `buildTextSuggestSetting` (frontmatter key `cycle`) | `cycle` |
| 5 | Git repo URL | `buildTextSetting` | `gitRepoUrl` |
| 6 | Vault membership | `buildListSuggestSetting` (frontmatter key `vault-membership`) | `vaultMembership` |
| 7 | Story status | `buildDropdownSetting` | `storyStatus` |
| 8 | Editorial status | `buildDropdownSetting` | `editorialStatus` |
| 9 | Tags | `buildListSuggestSetting` (frontmatter key `tags`) | `tags` |

It then calls `buildSubmitButton`.

**Class-specific mechanisms**

- **Required field.** Title Abbreviation is required to scaffold a story, but `BaseModal` has no required-field validation. The command enforces it (§8).
- **Not collected.** `filename` and `title` come from the folder the command runs in, `sort-title` is derived by `Story` (§2), and `stage` is set by `Story` (§1). Manuscript links and the publication fields are left at their defaults.
- **Cycle** is a single value, stored as a plain string.
- **Status options**, fixed in the modal: see §4.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, onSubmit)` | instance | Calls `super(app, onSubmit)` and assigns the result fields above. | — |
| `onOpen()` | hook | Renders the fields in the order above and the submit button. | `stage` is not collected because `Story` sets it to the pipeline's first stage once `category` is known. The Editorial status dropdown mirrors the active stage's `editorial-status`. |

## 8. Command
---

`creative-create-story.js`, in `.commands/`. Command name `Create Story`, ID `creative-create-story`. The command uses `checkCallback()`, which enables the command only when the active file has a parent folder. That folder is the story's own folder: the lean submodule root that holds the story's README and `.github`. The command builds the entire scaffold inside it.

On invocation the command resolves `folder` as the parent path of the active file, then opens a `StoryModal`. On submit it:

1. Takes the last segment of `folder` as `folderName` and constructs the `Story` with `{ folder, filename: folderName, title: folderName, ...result }`. The note is not written yet.
2. Throws when `titleAbbv` is empty, because it names the scene templates.
3. Resolves `story.pipeline`, which throws when `category` has no pipeline (§6).
4. Creates each scene template from `story.buildSceneTemplates()` at `<folder>/<filename>`, and records each template's vault path by suffix (§9).
5. For each stage in the pipeline, creates the folder `<folder>/<stage>`, then creates its `Manuscript` note (§10). Records each note's basename in `story.manuscriptLinks`.
6. Creates `<folder>/ARCHIVE`, `ARCHIVE/DRAFTS`, and `ARCHIVE/CHANGELOG`, writes an empty `.gitkeep` in `DRAFTS` and in `CHANGELOG`, and creates the `StoryArchive` (§11).
7. Creates the story note and opens it in the active leaf.

An error raised while building or opening the modal, or anywhere in the submit handler, is caught and logged once as `Log.error('creative-create-story', error.message, error)`. The command does not rethrow, so a failure partway through the scaffold leaves what was already created in place. Each successful step is logged with `Log.log` under the same ID.

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `buildInvokeCommand(app)` | function | Returns the Obsidian command descriptor. | — |
| `checkCallback(checking)` | internal | Resolves the folder. Returns `false` when there is none. When `checking` is false, starts `runCreateStory`. Returns `true` otherwise. | — |
| `COMMAND_ID` | internal | The command ID, `'creative-create-story'`. Used for the descriptor `id` and as the tag on every log entry. | One constant keeps the descriptor ID and the log tag identical. |
| `runCreateStory(app, folder)` | internal | Opens the `StoryModal` and runs steps 1 to 7 on submit. Catches and logs any error raised while building or opening the modal or in the submit handler. | Scene templates are created before the manuscripts so each manuscript can be wired to the right template path. The story note is written last because its manuscript links exist only after the manuscripts do, so it is written once, with no re-save. |

## 9. Companion Scene Template File
---

`Story` generates the Templater scene templates for the story. They are templates, not live scene notes: most fields are blank, `tags` holds the story tag, `created` holds the Templater expression `<% tp.date.now() %>`, and `modified` is blank. Each is written at the story folder's root, not inside a stage folder, as `<titleAbbv>-<suffix>.md`. A story gets one template, or three when its length/form is `serial`:

| Suffix | Throwaway scene `stage` | Created for |
| --- | --- | --- |
| `scene-serial` | `serial-draft` | `serial` only |
| `scene-reassembly` | `reassembly` | `serial` only |
| `scene-editorial` | `''` | Every length/form. For `serial`, it covers `1st-edit`, `2nd-edit`, `3rd-edit`, and `final`. |

A template's content is a frontmatter block followed by a blank line and the body of a `Scene` (see [[Scene.js Specification]] §2 and §5). The frontmatter is the field set that `Scene.getFrontmatterFields()` returns for the template's stage, so the status key follows `Scene`'s rule (§4 of that spec), with `created` overwritten as above.

The `titleAbbv` is not validated here. An empty value produces the filename `-<suffix>.md`.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `buildSceneTemplates()` | instance | Returns an array of `{ suffix, filename, content }`, one per template above. `filename` is `<titleAbbv>-<suffix>.md`. | Each `suffix` matches what `sceneTemplateSuffixForStage()` returns, so a caller can build a suffix-to-path map and look up a template per stage. |
| `buildSceneTemplateContent(app, storyTag, stage)` | internal | Constructs a throwaway `Scene` with `filename` `scene-template-placeholder`, the given `stage`, blank fields, and `tags` `[storyTag]`. Overwrites `created` with `<% tp.date.now() %>`. Returns the rendered frontmatter block, a blank line, and the scene body. | Reusing `Scene` keeps template output identical to `Scene`'s own field set, order, and status-key rule. The instance is never created, so nothing is written to the vault. |
| `SCENE_TEMPLATE_SUFFIXES` | static | Exported constant: `SERIAL` is `scene-serial`, `REASSEMBLY` is `scene-reassembly`, `EDITORIAL` is `scene-editorial`. | — |
| `sceneTemplateSuffixForStage(stage)` | function | Returns the `SERIAL` suffix for `Scene.SERIAL_STAGE`, the `REASSEMBLY` suffix for `reassembly`, and the `EDITORIAL` suffix for every other stage. | — |

## 10. Companion Manuscript File
---

One `Manuscript` note per pipeline stage, at `<story folder>/<stage>/<stage>.md`. The class is `Manuscript` (`.codex/creative/objects/Manuscript.js`). The fields each note carries are specified in [[Manuscript.js Specification]] §2, and the options the command passes to construct it in [[Manuscript.js Specification]] §7.

The basename of each created note is stored in `story.manuscriptLinks[stage]`, which renders as the story's link for that stage (§2).

## 11. Companion Archive File
---

`<story folder>/ARCHIVE/ARCHIVE.md`, a `StoryArchive` created with category `overview` and `moduleTag` set to the story tag. It is specified in [[StoryArchive.js Specification]]. The command creates its folders and placeholder files (§8 step 6).

## 12. Open Items
---

- **Flash-fiction pipeline.** No stage pipeline is defined for a flash-fiction length/form. `getStagePipeline` throws for it, and `StoryModal` does not offer it.

## Appendix: Member Index
---

| Member | Kind | Section |
| --- | --- | --- |
| `buildFolderTreeLines` | internal | §5 |
| `buildInvokeCommand` | function | §8 |
| `buildSceneTemplateContent` | internal | §9 |
| `buildSceneTemplates` | instance | §9 |
| `buildSortingSpec` | internal | §2 |
| `buildStoryDashboard` | internal | §5 |
| `checkCallback` | internal | §8 |
| `classValue` | hook | §1 |
| `COMMAND_ID` | internal | §8 |
| `constructor` (`Story`) | instance | §1 |
| `constructor` (`StoryModal`) | instance | §7 |
| `getBody` | hook | §5 |
| `getFrontmatterFields` | hook | §2 |
| `getPriorStage` | function | §6 |
| `getStageIndex` | function | §6 |
| `getStagePipeline` | function | §6 |
| `NOVELLA_PIPELINE` | internal | §6 |
| `onOpen` | hook | §7 |
| `pipeline` | getter | §6 |
| `runCreateStory` | internal | §8 |
| `SCENE_TEMPLATE_SUFFIXES` | static | §9 |
| `sceneTemplateSuffixForStage` | function | §9 |
| `sortTitle` | getter | §2 |
| `STAGE_DESCRIPTIONS` | internal | §5 |
| `STAGE_PIPELINES` | internal | §6 |
| `STORY_CATEGORY_OPTIONS` | internal | §3 |
| `storyTag` | getter | §6 |

## Appendix: Specification Change Log
---

| Date | Change |
| --- | --- |
| 2026-11-10 | Initial spec |