---
class: archive
category: specification
affiliations:
created: 2026-11-10
modified: 2026-11-10
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[BaseClass.js Specification]]"
tags:
---
Scene note for a story. Carries a manuscript stage, a stage-dependent status, and a chapter, and supplies the comment-scanning dashboard in its body.

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

`Scene` extends `BaseClass`. It adds three frontmatter fields (`stage`, a status field whose key depends on `stage`, and `chapter`), replaces the stored type of `context`, and supplies a body made of a comment-scanning Dataview script, an empty text area, and a status reference.

| Property | Value |
| --- | --- |
| Location | `.codex/creative/objects/Scene.js` |
| Export | `Scene` (named) |
| Extends | `BaseClass` (`.codex/core/objects/BaseClass.js`) |
| Module | Creative |
| Accompanying modal | `SceneModal`, see §6 |
| Command | `creative-create-scene.js`, see §7 |

Inherited behavior is specified in [[BaseClass.js Specification]]. Members with Kind `hook` in this spec are `Scene`'s overrides of `BaseClass` hooks.

**Error handling:** `Scene` adds no throwing and no logging of its own.

**Dependencies**

| Import | Source | Use |
| --- | --- | --- |
| `BaseClass` | `../../core/objects/BaseClass.js` | Superclass |

No helper or utility modules.

**Constructor options**

All `BaseClass` options apply, as specified in [[BaseClass.js Specification]] §1. `Scene` adds:

| Option | Required | Default | Stored as |
| --- | --- | --- | --- |
| `options.stage` | No | `''` | `this.stage` |
| `options.editorialStatus` | No | `''` | `this.editorialStatus` |
| `options.chapter` | No | `''` | `this.chapter` |
| `options.context` | No | `''` | `this.context` |

`options.context` is stored as a string and replaces the `[]` default that `BaseClass` assigns. `this.editorialStatus` holds the status value for either status key (§4).

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, options = {})` | instance | Calls `super(app, options)`, then stores `stage`, `editorialStatus`, `chapter`, and `context` from the options above. Throws whatever the `BaseClass` constructor throws. | — |
| `static classValue` | hook | Set to `'scene'`. Written to the `class` frontmatter field. | — |

## 2. Frontmatter Fields
---

**Inherited fields:** `class`, `category`, `affiliations`, `created`, `modified`, `context`, `tags`, as specified in [[BaseClass.js Specification]] §2. `context` is re-stored as a string (§1) and renders after `chapter`. **Class-specific fields:** `stage`, the status field, and `chapter`.

**Fields**, in render order, as returned by `getFrontmatterFields()`:

| Order | Key | Value | Rendered when empty |
| --- | --- | --- | --- |
| 1 | `class` | `base.class` | `class:` |
| 2 | `category` | `base.category` | `category:` |
| 3 | `affiliations` | `base.affiliations` | `affiliations:` |
| 4 | `created` | `base.created` | n/a |
| 5 | `modified` | `base.modified` | `modified:` |
| 6 | `stage` | `this.stage` | `stage:` |
| 7 | `editorial-status` or `serial-status` | `this.editorialStatus`. The key is `statusFieldKey` (§4). | `<key>:` |
| 8 | `chapter` | `this.chapter` | `chapter:` |
| 9 | `context` | `this.context` | `context:` |
| 10 | `tags` | `base.tags` | `tags:` |

`base` is the object returned by `baseFrontmatterFields()`. `stage` and `chapter` are written as supplied, with no validation.

**Class-specific field meanings**

| Key | Meaning |
| --- | --- |
| `stage` | The manuscript pipeline stage the scene belongs to. Selects the status key (§4). |
| `editorial-status` or `serial-status` | The scene's status within its stage (§4). |
| `chapter` | The chapter number as an Arabic numeral. Serial chapter headings are written as Roman numerals, so this property carries the sortable number; the Custom File Explorer Sorting plugin orders scene notes by it. |
| `context` | Catch-all cross-reference. In a revision stage it links to the chapters in the prior stage that make up this stage's chapter. |

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getFrontmatterFields()` | hook | Returns the fields above in the order above. The status key is computed at call time from `statusFieldKey`. | — |

## 3. Category Vocabulary
---

None. `Scene` does not override `categoryOptions()` and inherits the `null` default ([[BaseClass.js Specification]] §3). `SceneModal` therefore renders Category as a comma-separated text input with value suggestions drawn from the `category` frontmatter key.

## 4. Status Field
---

A scene carries one status field. Both keys are domain-scoped properties registered in [[Apparatus Status Taxonomy]]: `editorial-status` for a scene at any stage except `serial-draft`, and `serial-status` for a scene at `serial-draft`. Which key is written depends on `stage`. Valid values:

| Condition | Frontmatter key | Valid values |
| --- | --- | --- |
| `stage` equals `Scene.SERIAL_STAGE` (`serial-draft`) | `serial-status` | `backlog`, `active`, `ready`, `published` |
| Any other `stage`, including `''` | `editorial-status` | `not-started`, `in-progress`, `revision`, `complete` |

The class does not check `editorialStatus` against the valid values. The valid values are used only by the body's reference block (§5).

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `static SERIAL_STAGE` | static | The stage name `'serial-draft'`. A scene at this stage uses `serial-status`. | A serial's first-draft stage is tracked on its own publication lifecycle, so its status key differs from every other stage. |
| `static EDITORIAL_STATUS_VALUES` | static | `['not-started', 'in-progress', 'revision', 'complete']`. | The two status vocabularies are distinct sets. `editorial-status` tracks draft and edit progress. |
| `static SERIAL_STATUS_VALUES` | static | `['backlog', 'active', 'ready', 'published']`. | `serial-status` tracks a serialized post's own publication lifecycle. |
| `get statusFieldKey()` | getter | Returns `'serial-status'` when `this.stage` equals `Scene.SERIAL_STAGE`, otherwise `'editorial-status'`. | Derived from `stage` instead of stored, so it cannot drift out of sync with it. |
| `get statusValues()` | getter | Returns `Scene.SERIAL_STATUS_VALUES` when `this.stage` equals `Scene.SERIAL_STAGE`, otherwise `Scene.EDITORIAL_STATUS_VALUES`. | — |

## 5. Body Content
---

`getBody()` returns three sections in this order:

| Heading | Content |
| --- | --- |
| `## comments` | A DataviewJS script that lists the HTML comments in the note. Identical for every stage. |
| `## text` | Empty. The writing area. |
| `## reference` | A code block listing the status key and its valid values: the key, a rule line of 16 hyphens, then the values joined by ` | `. The key and values come from `statusFieldKey` and `statusValues`. |

Each heading is followed by a `---` line.

**`comments` script.** Reads the rendering note through `app.vault`. It finds the first ` ```dataviewjs ` fence and its closing fence, and scans only the text after that closing fence, so the script never matches comment delimiters inside itself. For each HTML comment found it prints a row of the note line number (1-based, whole note), the nearest preceding heading within the scanned text (`—` when none precedes it), and the trimmed comment text. When there are no comments it prints `✓ No comments found.` The comment delimiters are assembled from concatenated strings. The script is shown as generated.

````js
const file = app.vault.getAbstractFileByPath(dv.current().file.path);
const content = await app.vault.read(file);

const openFence = content.indexOf("```dataviewjs");
const closeFence = content.indexOf("```", openFence + 13);
const scanned = content.slice(closeFence + 3);

const lineOffset = content.substring(0, closeFence + 3).split("\n").length - 1;
const lines = scanned.split("\n");

function lineOf(str, index) {
	return str.substring(0, index).split("\n").length;
}

function nearestHeading(lines, fromLine) {
	for (let i = fromLine; i >= 0; i--) {
		if (/^#{1,6}\s/.test(lines[i])) {
			return lines[i].replace(/^#+\s*/, "").trim();
		}
	}
	return "—";
}

const open = "<" + "!--";
const close = "--" + ">";
const commentRegex = new RegExp(open + "([\\s\\S]*?)" + close, "g");

const results = [];
for (const match of scanned.matchAll(commentRegex)) {
	const line = lineOf(scanned, match.index) - 1;
	results.push([
		line + 1 + lineOffset,
	    nearestHeading(lines, line),
	    match[1].trim()
	]);
}

if (results.length === 0) {
	dv.paragraph("✓ No comments found.");
} else {
	dv.table(["Line", "Section", "Comment"], results);
}
````

**`reference` block.** For a stage other than `serial-draft`:

```
editorial-status
----------------
not-started | in-progress | revision | complete
```

For `serial-draft`:

```
serial-status
----------------
backlog | active | ready | published
```

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getBody()` | hook | Returns the three sections above as a string. | — |

## 6. Modal
---

**Location:** `.codex/creative/modals/SceneModal.js`. Export: `SceneModal`, which extends `BaseModal`.

**Dependencies:** `BaseModal` from `../../core/modals/BaseModal.js`; `Scene` from `../objects/Scene.js`, passed to `buildCategorySetting` (§3).

**Result object:** `this.result` is initialized by the `BaseModal` constructor, then assigned `filename: ''`, `category: []`, `affiliations: []`, `tags: []`, `stage: ''`, `editorialStatus: ''`, `chapter: ''`, `context: ''`. `context` is a string, replacing the `[]` that `BaseModal` initializes.

**Field build order**

`SceneModal.onOpen()` does not call `super.onOpen()`. It renders an `h2` reading `New Scene`, then, in order:

| Order | Field | Builder | Result key |
| --- | --- | --- | --- |
| 1 | Filename | `buildTextSetting` | `filename` |
| 2 | Category | `buildCategorySetting(contentEl, Scene)` | `category` |
| 3 | Affiliations | `buildListSuggestSetting` (frontmatter key `affiliations`) | `affiliations` |
| 4 | Stage | `buildDropdownSetting` | `stage` |
| 5 | Editorial / Serial status | `buildDropdownSetting` | `editorialStatus` |
| 6 | Chapter | `buildTextSetting` | `chapter` |
| 7 | Context | `buildTextSetting` | `context` |
| 8 | Tags | `buildListSuggestSetting` (frontmatter key `tags`) | `tags` |

It then calls `buildSubmitButton`.

**Class-specific mechanisms**

- **Stage options**, fixed in the modal, in order: `shitty-first-draft`, `serial-draft`, `reassembly`, `1st-edit`, `2nd-edit`, `3rd-edit`, `final`.
- **Status options**, fixed in the modal, for every stage: `not-started`, `in-progress`, `revision`, `complete`. The dropdown does not change with the selected stage.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, onSubmit)` | instance | Calls `super(app, onSubmit)` and assigns the result fields above. | — |
| `onOpen()` | hook | Renders the fields in the order above and the submit button. | The `serial-draft` stage option must equal `Scene.SERIAL_STAGE` exactly, because `statusFieldKey` selects the status key by exact string match. The status label names both keys because `Scene` derives the key from the stage, so the modal has no separate switch to keep in sync. |

## 7. Command
---

`creative-create-scene.js`, in `.commands/`. Command name `Create Creative Scene`, ID `creative-create-scene`. The command uses `callback()`.

On invocation the command:

1. Opens a `SceneModal`.
2. On submit, separates `filename` from the rest of the result.
3. Resolves `folder` as the parent path of the active file, or `''` when there is none. The command resolves it inline.
4. Constructs a `Scene` with `{ folder, filename, ...rest }` and calls `create()`.
5. Opens the created file in the active leaf.

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `buildInvokeCommand(app)` | function | Returns the Obsidian command descriptor. | — |
| `callback()` | internal | Constructs and opens the `SceneModal` with the submit handler above. | — |

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
| `buildInvokeCommand` | function | §7 |
| `callback` | internal | §7 |
| `classValue` | hook | §1 |
| `constructor` (`Scene`) | instance | §1 |
| `constructor` (`SceneModal`) | instance | §6 |
| `EDITORIAL_STATUS_VALUES` | static | §4 |
| `getBody` | hook | §5 |
| `getFrontmatterFields` | hook | §2 |
| `onOpen` | hook | §6 |
| `SERIAL_STAGE` | static | §4 |
| `SERIAL_STATUS_VALUES` | static | §4 |
| `statusFieldKey` | getter | §4 |
| `statusValues` | getter | §4 |

## Appendix: Specification Change Log
---

| Date | Change |
| --- | --- |
| 2026-11-10 | Initial spec |