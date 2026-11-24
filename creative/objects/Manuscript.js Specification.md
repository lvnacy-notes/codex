---
class: archive
category: specification
affiliations:
created: 2026-11-11
modified: 2026-11-11
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[BaseClass.js Specification]]"
  - "[[Story.js Specification]]"
tags:
---

Manuscript note for one stage of a story. Carries the stage, its status, the Longform project configuration, and a scene sorting specification, and supplies the stage's editorial dashboard in its body.

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

`Manuscript` extends `BaseClass`. It adds a stage, a stage-dependent status, a nested `longform` configuration object, and a scene sorting specification, and supplies a dashboard body scoped to one stage of one story.

`Manuscript` is not created on its own. `creative-create-story.js` creates one per pipeline stage as a step of the story scaffold (§7). It does not know the story's stage pipeline: it knows only its own `stage` and the `priorStage` it is given.

| Property | Value |
| --- | --- |
| Location | `.codex/creative/objects/Manuscript.js` |
| Export | `Manuscript` (named) |
| Extends | `BaseClass` (`.codex/core/objects/BaseClass.js`) |
| Module | Creative |
| Accompanying modal | None, see §6 |
| Command | `creative-create-story.js`, see §7 |

Inherited behavior is specified in [[BaseClass.js Specification]]. Members with Kind `hook` in this spec are `Manuscript`'s overrides of `BaseClass` hooks.

**Error handling:** `Manuscript` adds no throwing and no logging of its own.

**Dependencies**

| Import | Source | Use |
| --- | --- | --- |
| `BaseClass` | `../../core/objects/BaseClass.js` | Superclass |

No helper or utility modules.

**Constructor options**

All `BaseClass` options apply, as specified in [[BaseClass.js Specification]] §1. `Manuscript` adds:

| Option | Default | Stored as |
| --- | --- | --- |
| `options.stage` | `''` | `this.stage` |
| `options.editorialStatus` | `''` | `this.editorialStatus` |
| `options.priorStage` | `null` | `this.priorStage` |
| `options.context` | `[]` | `this.context` |
| `options.storyTag` | `''` | `this.storyTag` |
| `options.format` | `'scenes'` | `this.longform.format` |
| `options.title` | `''` | `this.longform.title` |
| `options.draftTitle` | `this.stage` | `this.longform.draftTitle` |
| `options.workflow` | `'Default Workflow'` | `this.longform.workflow` |
| `options.sceneFolder` | `'/'` | `this.longform.sceneFolder` |
| `options.sceneTemplate` | `''` | `this.longform.sceneTemplate` |
| `options.scenes` | `[]` | `this.longform.scenes` |

`priorStage` is the stage before this one in the story's pipeline, or `null` for the first stage. `storyTag` is the vault tag scoping the story's notes. Neither is written to frontmatter as its own field. `priorStage` feeds the body (§5), and `storyTag` feeds the body and is merged into `tags` (§2). `this.editorialStatus` holds the status value for either status key (§4).

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, options = {})` | instance | Calls `super(app, options)`, then stores the options above. `longform` is built as one object from the `longform` options. Throws what the `BaseClass` constructor throws. | `priorStage` is supplied by the caller because the class has no knowledge of a story's stage pipeline. |
| `static classValue` | hook | Set to `'manuscript'`. Written to the `class` frontmatter field. | — |

## 2. Frontmatter Fields
---

**Inherited fields:** `class`, `category`, `affiliations`, `created`, `modified`, `context`, and `tags`, as specified in [[BaseClass.js Specification]] §2. `context` renders after `longform`. `tags` always includes the story tag when `storyTag` is set. **Class-specific fields:** `stage`, the status field, `longform`, and `sorting-spec`.

**Fields**, in render order, as returned by `getFrontmatterFields()`:

| Order | Key | Value | Rendered when empty |
| --- | --- | --- | --- |
| 1 | `class` | `base.class` | `class:` |
| 2 | `category` | `base.category` | `category:` |
| 3 | `affiliations` | `base.affiliations` | `affiliations:` |
| 4 | `created` | `base.created` | n/a |
| 5 | `modified` | `base.modified` | `modified:` |
| 6 | `stage` | `this.stage` | `stage:` |
| 7 | `editorial-status` or `serial-status` | `this.editorialStatus`. The key is the result of `statusFieldFor(this.stage)` (§4). | `<key>:` |
| 8 | `longform` | `this.longform` | n/a |
| 9 | `context` | `this.context` | `context:` |
| 10 | `sorting-spec` | `SCENE_SORTING_SPEC` | n/a |
| 11 | `tags` | The story tag first, then `base.tags`, with duplicates removed. `base.tags` alone when `storyTag` is empty. | `tags:` |

`base` is the object returned by `baseFrontmatterFields()`. `stage` is written as supplied, with no validation. `longform` renders as an indented mapping with the keys below, in this order. An empty `scenes` array renders as `scenes:`. `sorting-spec` is a fixed string that ends in a newline, so it renders as a block scalar: `sorting-spec: |-`, the indented specification line, and a whitespace-only line. It parses to the string without the newline.

**Class-specific field meanings**

| Key | Meaning |
| --- | --- |
| `stage` | The pipeline stage this note represents. Selects the status key (§4). |
| `editorial-status` or `serial-status` | Status of the stage as a whole (§4). |
| `longform` | Longform project configuration, with the keys below. |
| `sorting-spec` | Custom File Explorer sorting specification for the stage folder. It orders the scenes in the folder by their `chapter` property. |

**`longform` keys**

| Key | Default | Meaning |
| --- | --- | --- |
| `format` | `scenes` | Stored as supplied. |
| `title` | `''` | Stored as supplied. |
| `draftTitle` | The stage name | Stored as supplied. |
| `workflow` | `Default Workflow` | Stored as supplied. |
| `sceneFolder` | `/` | Stored as supplied. |
| `sceneTemplate` | `''` | Vault-relative path, with the `.md` extension, of the scene template for this stage. Empty when none is supplied. |
| `scenes` | `[]` | The ordered list of scene filenames for the stage. |

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getFrontmatterFields()` | hook | Returns the fields above in the order above. The status key is computed at call time from `this.stage`. | The status key comes from the same resolver the dashboard uses to query this stage's scenes, so the key the note carries and the key it queries cannot differ. The story tag is always merged into `tags`, because the `StoryArchive` manuscript checks find manuscripts by that tag. |
| `SCENE_SORTING_SPEC` | internal | The `sorting-spec` value: `'< a-z by-metadata: chapter
'`. | Scenes sort by `chapter`, the Arabic-numeral property, because Roman numerals do not sort natively. The trailing newline makes the value render as a block scalar, since the plain one-line form is not valid YAML. |

## 3. Category Vocabulary
---

None. `Manuscript` does not override `categoryOptions()` and has no modal.

## 4. Status Field
---

A manuscript carries one status field. It describes the stage as a whole, independent of the status of any individual scene, and it uses the same key a scene at that stage uses. Both keys are domain-scoped properties registered in [[Apparatus Status Taxonomy]]:

| Condition | Frontmatter key |
| --- | --- |
| `stage` equals `'serial-draft'` | `serial-status` |
| Any other `stage`, including `''` | `editorial-status` |

`Manuscript` declares no value list and does not validate `editorialStatus`. The dashboard (§5) counts whatever values the stage's scenes carry.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `statusFieldFor(stage)` | internal | Returns `'serial-status'` when `stage` is `'serial-draft'`, otherwise `'editorial-status'`. Used for the note's own status key and for the key the dashboard queries. | `serial-draft` sits in a separate publication pipeline from every other stage, so it gets its own status domain, not another value in the editorial one. |

## 5. Body Content
---

`getBody()` returns the editorial dashboard for the manuscript's stage, generated by `buildManuscriptDashboard` from `stage`, `priorStage`, and `storyTag`.

**Sections**, in order. `<stage>`, `<priorStage>`, `<storyTag>`, and `<statusField>` stand for the values interpolated at generation:

| Heading | Content |
| --- | --- |
| `# contents` | Table of contents. |
| `# <stage> editorial dashboard` | A one-line description of what the dashboard tracks. |
| `## inline comments` | The comment scan below. |
| `## scene metadata management` | A line naming the required fields (`stage`, `<statusField>`, `chapter`, `context`), then `### incomplete metadata` and `### <stage> scene metadata completeness`. |
| `## status distribution` | A line describing the breakdown, then the status distribution script. |
| `## scene lineage` | A line describing lineage tracking, then `### lineage completeness`, then `### cross-stage lineage: <priorStage> → <stage>`. |

The cross-stage lineage section is present only when `priorStage` is truthy. For a manuscript with no prior stage the body ends after `### lineage completeness`.

**Queries.** Each is shown as generated. The comment scan selects scenes by substring match on `class` and `stage`. Every other script selects them by exact equality, `class === "scene"` and `stage === "<stage>"`. A field counts as present when it is neither `undefined` nor `null`.

**inline comments** (`## inline comments`). Reads each scene note at the stage through `app.vault` and extracts every HTML comment. A comment of the form `Name: text` yields `Name` as the author and the rest as the comment; any other comment gets the author `author`. Prints a `Scene` / `Author` / `Comment` table, or `✓ No inline comments.` when there are none.

```js
const pages = dv.pages("#<storyTag>")
	.where(p => `${p.class}`.includes("scene"))
	.where(p => `${p.stage}`.includes("<stage>"));

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
		results.push([page.file.link, author, comment]);
	}
}

if (results.length === 0) {
	dv.paragraph("✓ No inline comments.");
} else {
	dv.table(["Scene", "Author", "Comment"], results);
}
```

**incomplete metadata** (`### incomplete metadata`). Lists the stage's scenes that lack any of `stage`, `<statusField>`, `chapter`, or `context`, with the missing fields named. Prints `All <stage> scenes have complete metadata.` when none are incomplete.

```js
const stageScenes = dv.pages('#<storyTag>')
	.where(p => p.class === "scene")
	.where(p => p.stage === "<stage>");

const statusField = "<statusField>";
	const stageIncomplete = [];

for (const scene of stageScenes) {
	const hasStage = scene.stage !== undefined && scene.stage !== null;
	const hasStatus = scene[statusField] !== undefined && scene[statusField] !== null;
	const hasChapter = scene.chapter !== undefined && scene.chapter !== null;
	const hasContext = scene.context !== undefined && scene.context !== null;

	if (!(hasStage && hasStatus && hasChapter && hasContext)) {
		const missing = [];
		if (!hasStage) missing.push("stage");
		if (!hasStatus) missing.push(statusField);
		if (!hasChapter) missing.push("chapter");
		if (!hasContext) missing.push("context");

		stageIncomplete.push({
			link: scene.file.link,
			missing: missing.join(", ")
		});
	}
}

if (stageIncomplete.length === 0) {
	dv.paragraph("All <stage> scenes have complete metadata.");
} else {
	dv.table(
		["Scene", "Missing Fields"],
		stageIncomplete.map(s => [s.link, s.missing])
	);
}
```

**metadata completeness** (`### <stage> scene metadata completeness`). Counts complete and incomplete scenes against the same four fields. Draws a Mermaid pie of the two counts and prints a line of complete, incomplete, and total. Prints `No <stage> scenes found.` and no chart when there are no scenes.

```js
const stageScenes = dv.pages('#<storyTag>')
	.where(p => p.class === "scene")
	.where(p => p.stage === "<stage>");

let complete = 0;
let incomplete = 0;

for (const scene of stageScenes) {
	const hasStage = scene.stage !== undefined && scene.stage !== null;
	const hasStatus = scene[statusField] !== undefined && scene[statusField] !== null;
	const hasChapter = scene.chapter !== undefined && scene.chapter !== null;
	const hasContext = scene.context !== undefined && scene.context !== null;

	if (hasStage && hasStatus && hasChapter && hasContext) {
		complete++;
	} else {
		incomplete++;
	}
}

if (complete === 0 && incomplete === 0) {
	dv.paragraph("No <stage> scenes found.");
} else {
	let mermaidCode = "pie title <stage> scene metadata completeness\n";
	mermaidCode += `    "complete" : ${complete}\n`;
	mermaidCode += `    "incomplete" : ${incomplete}\n`;
	dv.paragraph("```mermaid\n" + mermaidCode + "```");
}

dv.paragraph(`**Complete**: ${complete} | **Incomplete**: ${incomplete} | **Total**: ${complete + incomplete}`);
```

**status distribution** (`## status distribution`). Counts the stage's scenes by the value of `<statusField>`, counting a scene with no value as `unset`. Draws a Mermaid pie of the counts. Prints `No <stage> scenes found.` when there are none.

```js
const stageScenes = dv.pages('#<storyTag>')
	.where(p => p.class === "scene")
	.where(p => p.stage === "<stage>");

const statusField = "<statusField>";
	const statusCounts = {};
for (const scene of stageScenes) {
	const status = scene[statusField] || "unset";
	statusCounts[status] = (statusCounts[status] || 0) + 1;
}

const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

if (total === 0) {
	dv.paragraph("No <stage> scenes found.");
} else {
	let mermaidCode = "pie title <stage> status distribution\n";
	for (const [status, count] of Object.entries(statusCounts)) {
		mermaidCode += `    "${status}" : ${count}\n`;
	}
	dv.paragraph("```mermaid\n" + mermaidCode + "```");
}
```

**lineage completeness** (`### lineage completeness`). Counts the stage's scenes whose `context` is set, and for an array is non-empty. Prints `✓ All <stage> scenes have documented lineage.` when every scene qualifies or there are no scenes, and otherwise prints the documented and pending counts.

```js
const stageScenes = dv.pages('#<storyTag>')
	.where(p => p.class === "scene")
	.where(p => p.stage === "<stage>");

const scenesByLineage = { documented: [], undocumented: [] };

for (const scene of stageScenes) {
	if (scene.context && (Array.isArray(scene.context) ? scene.context.length > 0 : true)) {
		scenesByLineage.documented.push(scene.file.link);
	} else {
		scenesByLineage.undocumented.push(scene.file.link);
	}
}

if (scenesByLineage.undocumented.length === 0) {
	dv.paragraph("✓ All <stage> scenes have documented lineage.");
} else {
	dv.paragraph(`**Lineage Documented**: ${scenesByLineage.documented.length} scenes | **Lineage Pending**: ${scenesByLineage.undocumented.length} scenes`);
}
```

**cross-stage lineage** (`### cross-stage lineage: <priorStage> → <stage>`). Lists the stage's scenes grouped by each link in their `context`, so each prior-stage scene shows the scenes that descend from it. Rows are sorted by the prior-stage scene.

```text
TABLE WITHOUT ID
	source as "<priorStage> Scene",
	rows.file.link as "<stage> Scenes"
FROM
	#<storyTag>
WHERE
	contains(class, "scene") AND
	contains(stage, "<stage>") AND
	context
FLATTEN
	context as source
GROUP BY
	source
SORT
	source ASC
```

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getBody()` | hook | Returns the dashboard string for this manuscript's `stage`, `priorStage`, and `storyTag`. | — |
| `buildManuscriptDashboard({ stage, priorStage, storyTag })` | internal | Returns the full body string, interpolating the three values into the sections above. Includes the cross-stage lineage section only when `priorStage` is truthy. | — |

## 6. Modal
---

None. `Manuscript` has no modal. The story command supplies every option (§7).

## 7. Command
---

None of its own. `creative-create-story.js` creates one `Manuscript` per pipeline stage as a step of the story scaffold, after the scene templates and before the archive ([[Story.js Specification]] §8). Each note is written at `<story folder>/<stage>/<stage>.md`, in a folder the command creates first.

The command constructs each `Manuscript` with:

| Option | Value |
| --- | --- |
| `folder` | `<story folder>/<stage>` |
| `filename` | The stage name |
| `category` | `['draft']` |
| `affiliations` | The story's `affiliations` |
| `stage` | The stage name |
| `editorialStatus` | `''` |
| `priorStage` | `getPriorStage(story.category, stage)` |
| `context` | `[]` |
| `storyTag` | `story.storyTag` |
| `title` | `story.title` |
| `sceneTemplate` | The vault path of the template whose suffix `sceneTemplateSuffixForStage(stage)` returns, or `''` when there is none |

Every other option takes its default (§1): `format` is `scenes`, `draftTitle` is the stage name, `workflow` is `Default Workflow`, `sceneFolder` is `/`, and `scenes` is `[]`.

## 8. Additional Companion Files
---

None.

## 9. Open Items
---

None.

## Appendix: Member Index
---

| Member | Kind | Section |
| --- | --- | --- |
| `buildManuscriptDashboard` | internal | §5 |
| `classValue` | hook | §1 |
| `constructor` | instance | §1 |
| `getBody` | hook | §5 |
| `getFrontmatterFields` | hook | §2 |
| `SCENE_SORTING_SPEC` | internal | §2 |
| `statusFieldFor` | internal | §4 |

## Appendix: Specification Change Log
---

| Date | Change |
| --- | --- |
| 2026-11-11 | Initial spec |