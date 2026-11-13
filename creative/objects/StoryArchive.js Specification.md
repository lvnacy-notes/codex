---
class: archive
category: specification
affiliations:
created: 2026-11-08
modified: 2026-11-08
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[Archive.js Specification]]"
tags:
---

Archive note for a story. Supplies the story's integrity and drafts dashboards on top of `Archive`.

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

`StoryArchive` extends `Archive`. It adds no state and no frontmatter fields. It supplies the checks that fill the story's `ARCHIVE` overview note.

`StoryArchive` is not created on its own. `creative-create-story.js` instantiates it as one step of the story scaffold (§7). It has no constructor of its own; construction, including `moduleTag`, is specified in [[Archive.js Specification]] §1.

| Property | Value |
| --- | --- |
| Location | `.codex/creative/objects/StoryArchive.js` |
| Export | `StoryArchive` (named) |
| Extends | `Archive` (`.codex/core/objects/Archive.js`) |
| Module | Creative |
| Accompanying modal | None, see §6 |
| Command | `creative-create-story.js`, see §7 |

Inherited behavior is specified in [[Archive.js Specification]] and [[BaseClass.js Specification]]. Members with Kind `hook` in this spec are `StoryArchive`'s overrides of `Archive` hooks.

**Dependencies**

| Import | Source | Use |
| --- | --- | --- |
| `Archive` | `../../core/objects/Archive.js` | Superclass |

No helper or utility modules.

## 2. Frontmatter Fields
---

**Inherited fields:** every field, unchanged, as specified in [[Archive.js Specification]] §2. **Class-specific fields:** none. The `tags` field carries the story's tag, passed as `moduleTag`.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getFrontmatterFields()` | hook | Returns `super.getFrontmatterFields()` unchanged. | `Archive`'s frontmatter is already sufficient. `StoryArchive` adds no fields of its own. |

## 3. Category Vocabulary
---

None of its own. `StoryArchive` inherits the four-value vocabulary from `Archive` ([[Archive.js Specification]] §3): `specification`, `overview`, `documentation`, `changelog`. The story scaffold creates it with `overview`, the only category that produces a body.

## 4. Status Field
---

None.

## 5. Body Content
---

With category `overview`, `getBody()` is inherited from `Archive` and produces:

| Heading | Source |
| --- | --- |
| `# contents` | `Archive` |
| `# archive integrity` | Default title from `Archive.integritySectionTitle()` |
| `## story` | `storyIntegrityScript` |
| `## manuscript` | `manuscriptIntegrityScript` |
| `## scene` | `sceneIntegrityScript` |
| `# drafts` | `snapshotSectionTitle()` |
| `## snapshot existence` | `snapshotExistenceScript` |
| `## pre-removal validation` | `preRemovalValidationScript` |
| `# changelog` | `Archive` |

Each check is a DataviewJS script built by an internal function. The function takes the story's tag and interpolates it into the query as `dv.pages("#<moduleTag>")`. The scripts below are shown as generated, with `<moduleTag>` standing for the tag.

A field counts as present when it is neither `undefined` nor `null`. The manuscript and pre-removal checks read `serial-status` when the note's `stage` is `serial-draft`, and `editorial-status` otherwise.

**`story`.** Scans notes tagged `<moduleTag>` with `class: story`. Requires `story-status`, `stage`, and `editorial-status`. Prints `**Story**: N complete, M incomplete`, and a `File` / `Missing Fields` table of the incomplete notes.

```js
const storyFiles = dv.pages("#<moduleTag>").where(p => p.class === "story");

let complete = 0;
const incomplete = [];

for (const file of storyFiles) {
	const hasStoryStatus = file["story-status"] !== undefined && file["story-status"] !== null;
	const hasStage = file.stage !== undefined && file.stage !== null;
	const hasEditorialStatus = file["editorial-status"] !== undefined && file["editorial-status"] !== null;

	const missing = [];
	if (!hasStoryStatus) missing.push("story-status");
	if (!hasStage) missing.push("stage");
	if (!hasEditorialStatus) missing.push("editorial-status");

	if (missing.length === 0) {
		complete++;
	} else {
		incomplete.push({ link: file.file.link, missing: missing.join(", ") });
	}
}

dv.paragraph(`**Story**: ${complete} complete, ${incomplete.length} incomplete`);
if (incomplete.length > 0) {
	dv.table(["File", "Missing Fields"], incomplete.map((f) => [f.link, f.missing]));
}
```

**`manuscript`.** Scans notes tagged `<moduleTag>` with `class: manuscript`, excluding paths containing `ARCHIVE/DRAFTS`. Requires `stage`, the status field for the stage, `longform.format`, `longform.title`, `longform.draftTitle`, and `longform.workflow`. Prints `**Manuscript**: N complete, M incomplete` and the same table.

```js
const manuscriptFiles = dv.pages("#<moduleTag>")
	.where(p => p.class === "manuscript")
	.where(p => !p.file.path.includes("ARCHIVE/DRAFTS"));

let complete = 0;
const incomplete = [];

for (const file of manuscriptFiles) {
	const longform = file.longform || {};
	const statusField = file.stage === "serial-draft" ? "serial-status" : "editorial-status";
	const hasStage = file.stage !== undefined && file.stage !== null;
	const hasStatus = file[statusField] !== undefined && file[statusField] !== null;
	const hasFormat = longform.format !== undefined && longform.format !== null;
	const hasTitle = longform.title !== undefined && longform.title !== null;
	const hasDraftTitle = longform.draftTitle !== undefined && longform.draftTitle !== null;
	const hasWorkflow = longform.workflow !== undefined && longform.workflow !== null;

	const missing = [];
	if (!hasStage) missing.push("stage");
	if (!hasStatus) missing.push(statusField);
	if (!hasFormat) missing.push("longform.format");
	if (!hasTitle) missing.push("longform.title");
	if (!hasDraftTitle) missing.push("longform.draftTitle");
	if (!hasWorkflow) missing.push("longform.workflow");

	if (missing.length === 0) {
		complete++;
	} else {
		incomplete.push({ link: file.file.link, missing: missing.join(", ") });
	}
}

dv.paragraph(`**Manuscript**: ${complete} complete, ${incomplete.length} incomplete`);
if (incomplete.length > 0) {
	dv.table(["File", "Missing Fields"], incomplete.map((f) => [f.link, f.missing]));
}
```

**`scene`.** Loads `getStagePipeline` with `requireAsync`, takes the first story note tagged `<moduleTag>`, and gets its stage list from the story's `category`. Scans notes with `class: scene` whose `stage` is in that list. Requires `stage`, a status (`editorial-status` or `serial-status`), `chapter`, and `context`. Prints one line per scene with missing fields and prints nothing for complete scenes.

```js
const { getStagePipeline } = await requireAsync('/.codex/creative/controls/manuscript-pipelines.js');
const storyPage = dv.pages("#<moduleTag>").where(p => p.class === "story").array()[0];
const stages = storyPage ? getStagePipeline(storyPage.category) : [];
const statusOf = (p) => p["editorial-status"] ?? p["serial-status"];

const sceneFiles = dv.pages("#<moduleTag>")
	.where(p => p.class === "scene")
	.where(p => stages.includes(p.stage));

for (const scene of sceneFiles) {
	const hasStage = scene.stage !== undefined && scene.stage !== null;
	const hasStatus = statusOf(scene) !== undefined && statusOf(scene) !== null;
	const hasChapter = scene.chapter !== undefined && scene.chapter !== null;
	const hasContext = scene.context !== undefined && scene.context !== null;

	const missing = [];
	if (!hasStage) missing.push("stage");
	if (!hasStatus) missing.push(scene.stage === "serial-draft" ? "serial-status" : "editorial-status");
	if (!hasChapter) missing.push("chapter");
	if (!hasContext) missing.push("context");

	if (missing.length > 0) {
		dv.paragraph(`**Scene**: ${scene.file.link} is missing: ${missing.join(", ")}`);
	}
}
```

**`snapshot existence`.** Gets the story's stage list the same way. For each stage, checks whether `<archive folder>/DRAFTS/<stage>` exists in the vault, where the archive folder is the folder of the note being rendered. Prints a `Stage` / `Snapshot Status` table with `✓` or `⚠️ Missing`.

```js
const { getStagePipeline } = await requireAsync('/.codex/creative/controls/manuscript-pipelines.js');
const storyPage = dv.pages("#<moduleTag>").where(p => p.class === "story").array()[0];
const stages = storyPage ? getStagePipeline(storyPage.category) : [];
const archiveFolder = dv.current().file.folder;
const basePath = `${archiveFolder}/DRAFTS`;

const results = stages.map((stage) => {
	const exists = app.vault.getAbstractFileByPath(`${basePath}/${stage}`) ? "\u2713" : "\u26a0\ufe0f Missing";
	return [stage, exists];
});

dv.table(["Stage", "Snapshot Status"], results);
```

**`pre-removal validation`.** Scans notes tagged `<moduleTag>` with `class: manuscript` whose path contains `ARCHIVE/DRAFTS`. Requires `stage`, the status field for the stage, and a non-empty `longform.scenes` array. Prints `**Draft Snapshots**: N complete, M incomplete`. When any are incomplete it adds a warning and a `Draft` / `Missing Fields` table. When none are incomplete and at least one is complete it prints that all snapshots are eligible for archival.

```js
const draftFiles = dv.pages("#<moduleTag>")
	.where(p => p.class === "manuscript")
	.where(p => p.file.path.includes("ARCHIVE/DRAFTS"));

let complete = 0;
const incomplete = [];

for (const file of draftFiles) {
	const longform = file.longform || {};
	const statusField = file.stage === "serial-draft" ? "serial-status" : "editorial-status";
	const hasStage = file.stage !== undefined && file.stage !== null;
	const hasStatus = file[statusField] !== undefined && file[statusField] !== null;
	const hasScenes = longform.scenes && Array.isArray(longform.scenes) && longform.scenes.length > 0;

	const missing = [];
	if (!hasStage) missing.push("stage");
	if (!hasStatus) missing.push(statusField);
	if (!hasScenes) missing.push("longform.scenes");

	if (missing.length === 0) {
		complete++;
	} else {
		incomplete.push({ link: file.file.link, missing: missing.join(", ") });
	}
}

dv.paragraph(`**Draft Snapshots**: ${complete} complete, ${incomplete.length} incomplete (\u26a0\ufe0f *pre-removal validation*)`);
if (incomplete.length > 0) {
	dv.paragraph("\u26a0\ufe0f These drafts are incomplete and should not be removed from the workflow:");
	dv.table(["Draft", "Missing Fields"], incomplete.map((f) => [f.link, f.missing]));
} else if (complete > 0) {
	dv.paragraph("\u2713 All draft snapshots are complete and eligible for archival.");
}
```

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `integrityChecks()` | hook | Returns the `story`, `manuscript`, and `scene` checks, each built from `this.moduleTag`. | — |
| `snapshotSectionTitle()` | hook | Returns `'drafts'`. | — |
| `snapshotChecks()` | hook | Returns the `snapshot existence` and `pre-removal validation` checks, each built from `this.moduleTag`. | — |
| `storyIntegrityScript(tag)` | internal | Returns the `story` script. | — |
| `manuscriptIntegrityScript(tag)` | internal | Returns the `manuscript` script. | — |
| `sceneIntegrityScript(tag)` | internal | Returns the `scene` script. | — |
| `snapshotExistenceScript(tag)` | internal | Returns the `snapshot existence` script. | — |
| `preRemovalValidationScript(tag)` | internal | Returns the `pre-removal validation` script. | — |

## 6. Modal
---

None. `StoryArchive` has no modal.

## 7. Command
---

`creative-create-story.js` creates the `StoryArchive` as one step of the story scaffold. The command, not the class, creates the folders and placeholder files:

1. Creates `<story folder>/ARCHIVE`, `ARCHIVE/DRAFTS`, and `ARCHIVE/CHANGELOG`.
2. Writes an empty `.gitkeep` in `DRAFTS` and in `CHANGELOG`.
3. Constructs a `StoryArchive` with `folder` set to the archive folder, `filename` `'ARCHIVE'`, category `overview`, and `moduleTag` set to the story tag, then calls `create()`.

The Story note is written after the `StoryArchive`. `StoryArchive` creates only its own note.

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
| `getFrontmatterFields` | hook | §2 |
| `integrityChecks` | hook | §5 |
| `manuscriptIntegrityScript` | internal | §5 |
| `preRemovalValidationScript` | internal | §5 |
| `sceneIntegrityScript` | internal | §5 |
| `snapshotChecks` | hook | §5 |
| `snapshotExistenceScript` | internal | §5 |
| `snapshotSectionTitle` | hook | §5 |
| `storyIntegrityScript` | internal | §5 |

## Appendix: Specification Change Log
---

| Date | Change |
| --- | --- |
| 2026-11-08 | Initial spec |