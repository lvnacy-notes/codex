---
class: archive
category: specification
affiliations:
created: 2026-11-01
modified: 2026-11-07
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
tags:
---

Abstract base class for every Apparatus object class. Builds a note's frontmatter and body, resolves its path, writes it to the vault, and exposes the hooks subclasses override.

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

`BaseClass` is the root of the object class hierarchy. Every Apparatus object class derives from it. It belongs to no module and defines no category vocabulary of its own.

| Property | Value |
| --- | --- |
| Location | `.codex/core/objects/BaseClass.js` |
| Export | `BaseClass` (named) |
| Module | None |
| Accompanying modal | `BaseModal` (`.codex/core/modals/BaseModal.js`), see §8 |
| Command | None, see §9 |

Members with Kind `hook` throughout this spec are the points subclasses override or set.

**Error handling:** `BaseClass` throws on failure and does not log errors. The command that invokes the class catches each error and logs it once.

**Dependencies**

| Import | Source | Use |
| --- | --- | --- |
| `moment` | `obsidian` | Supplies the `created` date |
| `buildFrontmatterBlock` | `../../frontmatter` (defined in `build-frontmatter-block.js`) | Renders the frontmatter block, see §2 |
| `Log` | `../../utils/logger.js` | Logs successful creation |

**Constructor options**

| Option | Required | Default | Stored as |
| --- | --- | --- | --- |
| `app` (first argument) | Yes | None | `this.app` |
| `options.filename` | Yes | None | `this.filename` |
| `options.folder` | No | `''` | `this.folder` |
| `options.category` | No | `[]` | `this.category` |
| `options.affiliations` | No | `[]` | `this.affiliations` |
| `options.context` | No | `[]` | `this.context` |
| `options.tags` | No | `[]` | `this.tags` |

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, options = {})` | instance | Stores `app` and the options above. Throws `BaseClass requires an Obsidian app instance.` when `app` is missing and `BaseClass requires a filename.` when `options.filename` is missing. | `context` is stored raw because `BaseClass` has no resolver access. Subclasses that can resolve links layer resolution on top of the raw value. |
| `static classValue` | hook | Value written to the `class` frontmatter field. `null` by default; each subclass sets its own. | — |
| `get path()` | getter | Returns `<folder>/<filename>.md`. The `<folder>/` prefix is omitted when `folder` is empty. | — |

## 2. Frontmatter Fields
---

`BaseClass` defines every field inherited by all object classes. It defines no class-specific fields.

**Inherited fields**, in render order, as returned by `baseFrontmatterFields()`:

| Order | Key | Value | Rendered when empty |
| --- | --- | --- | --- |
| 1 | `class` | `this.constructor.classValue` | `class:` |
| 2 | `category` | `this.category` | `category:` |
| 3 | `affiliations` | `this.affiliations` | `affiliations:` |
| 4 | `created` | `moment().format('YYYY-MM-DD')`, evaluated each time `baseFrontmatterFields()` is called | n/a |
| 5 | `modified` | `''` | `modified:` |
| 6 | `context` | `this.context` | `context:` |
| 7 | `tags` | `this.tags` | `tags:` |

`context` is a wikilink array: a catch-all cross-reference to any object relevant to the note that fits no existing relational field.

**Class-specific fields**: none. A subclass overrides `getFrontmatterFields()`, calls `baseFrontmatterFields()`, and adds its own keys around the returned fields in whatever order the frontmatter should render.

**Rendering rules**

`buildFrontmatterBlock(fields)` renders a standalone `---`-delimited block from any fields object. Keys render in the object's insertion order, one entry per key.

| Value | Rendered as |
| --- | --- |
| `undefined`, `null`, `''` | `key:` |
| Empty array | `key:` |
| Non-empty array | `key:` followed by one `  - <value>` line per element |
| Plain object | `key:` followed by an indented YAML mapping, two spaces deeper per nesting level. An empty object renders as `key:`. |
| String containing `\n` | YAML block scalar: `key: \|-` followed by each line indented two spaces deeper than the key |
| Any other scalar | `key: <value>` |

Array elements and scalar values pass through `formatScalarValue()`.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `baseFrontmatterFields()` | instance | Returns the shared fields listed above. Subclasses call it from `getFrontmatterFields()` and splice their own keys around the result instead of overriding it. | — |
| `getFrontmatterFields()` | hook | Returns `baseFrontmatterFields()`. Subclasses override it to add class-specific fields in their render order. | — |
| `buildFrontmatter()` | instance | Returns `buildFrontmatterBlock(this.getFrontmatterFields())`. | — |
| `buildFrontmatterBlock(fields)` | function | Builds a `---`-delimited frontmatter block from a fields object using the rendering rules above. | Takes a plain fields object instead of a `BaseClass` instance, so anything that needs the same formatting rules can render a block without going through `create()`. |
| `formatFrontmatterLine(key, value, indent = 0)` | internal | Formats one key and value as one or more frontmatter lines, applying the rendering rules above and recursing into plain objects with `indent + 1`. | Multi-line strings render as block scalars because embedded raw newlines in a plain scalar are invalid YAML. |
| `formatScalarValue(value)` | internal | Returns a string beginning with `[` wrapped in double quotes, with embedded double quotes escaped as `\"`. Returns every other value unchanged. | A bare string beginning with `[` parses as a YAML flow sequence. An unquoted wikilink such as `[[name]]` would parse as a nested array. Quoting keeps it a plain string. |

## 3. Category Vocabulary
---

A class declares a fixed category vocabulary by overriding `categoryOptions()` to return an array of valid category strings. `BaseModal.buildCategorySetting(containerEl, ObjectClass)` reads it and builds the Category input:

| `categoryOptions()` returns | Category input |
| --- | --- |
| Non-empty array | Multi-select toggles, one per option |
| `null` or empty array | Comma-separated text input with value suggestions drawn from the `category` frontmatter key |

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `static categoryOptions()` | hook | Returns the class's valid category strings. Returns `null` by default, meaning no fixed vocabulary. | Returning `null` by default, instead of requiring every subclass to implement it, means a class that omits the override still gets a usable category input rather than none. |

## 4. Status Field
---

None. `BaseClass` defines no status field and registers no status domain in [[Apparatus Status Taxonomy]].

## 5. Body Content
---

`getBody()` returns `''`. `BaseClass` defines no sections and no Dataview queries.

`buildContent()` returns the frontmatter block, followed by two newline characters, followed by the return value of `getBody()`.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getBody()` | hook | Returns `''`. Subclasses override it to return the markdown body that follows the frontmatter. | — |
| `buildContent()` | instance | Returns the output of `buildFrontmatter()`, two newline characters, then the output of `getBody()`. | — |

## 6. Creation Workflow
---

`create()` is async and returns the created `TFile`. It runs in this order:

1. **Collision check.** If `app.vault.getAbstractFileByPath(this.path)` returns an entry, `create()` throws `A file already exists at <path>`.
2. **Write.** `app.vault.create(this.path, this.buildContent())`. On success it logs `Created <path>` through `Log.log`. On failure the original error propagates unchanged.
3. **Post-create hook.** `await this.postCreate(file)`. An error thrown by `postCreate` propagates out of `create()` unmodified.
4. **Return.** Returns the `TFile`.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `create()` | instance | Writes the note to the vault following the workflow above. | `postCreate` runs only after the file is confirmed on disk, so when it throws the note already exists and only the follow-on work needs manual reconciliation. `create()` throws without logging, so the invoking command logs each failure exactly once. |
| `postCreate(file)` | hook | Runs additional work after the note is written. Receives the new `TFile`. No-op by default. | Overrides call `super.postCreate(file)` first, then add their own behavior, so the hook composes through the inheritance chain the same way `getFrontmatterFields()` does. |

## 7. Static Helpers
---

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `static resolveFolder(app)` | hook | Resolves the destination folder: the parent folder path of the active file, or `''` when there is none. Subclasses override it to use a different strategy, such as one driven by a folder-suggest modal. | — |
| `static findIdentityAffiliation(app, file, prefixes)` | static | Returns the first entry in the file's `affiliations` frontmatter, read from `app.metadataCache`, that starts with any string in `prefixes`. Returns `undefined` when no entry matches. | A referencing note copies the returned value verbatim instead of re-typing it, since a mismatch silently breaks the graph connection. `prefixes` has no default because there is no Apparatus-wide affiliation namespace, only per-taxonomy conventions; callers supply their own. |

## 8. Modal
---

**Location:** `.codex/core/modals/BaseModal.js`. Export: `BaseModal`, which extends Obsidian's `Modal`.

**Dependencies:** `Modal`, `Notice`, `Setting` from `obsidian`; `FileSuggest`, `FolderSuggest`, `NoteSuggest`, `ValueSuggest` from `../../controls` (see Controls below).

**Result object:** `this.result` is initialized to `{ affiliations: [], context: [], tags: [] }`. Each builder writes to `this.result[resultKey]`. `buildSubmitButton` passes the object to `onSubmit`.

**Field build order**

`BaseModal.onOpen()` renders, in order:

| Order | Field | Builder | Result key |
| --- | --- | --- | --- |
| 1 | Affiliations | `buildListSuggestSetting` (frontmatter key `affiliations`) | `affiliations` |
| 2 | Context | `buildContextSetting` | `context` |
| 3 | Tags | `buildListSuggestSetting` (frontmatter key `tags`) | `tags` |

`onOpen()` does not render Category and does not render the submit button. Category is rendered by calling `buildCategorySetting(containerEl, ObjectClass)` (see §3).

**Lifecycle and structural members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, onSubmit)` | instance | Stores `onSubmit` and initializes `this.result`. | — |
| `onOpen()` | hook | Renders the Affiliations, Context, and Tags fields in the order above. Subclasses override it, call `super.onOpen()`, and call `buildSubmitButton()` last. | — |
| `onClose()` | instance | Empties `contentEl`. | — |
| `buildCategorySetting(containerEl, ObjectClass)` | instance | Builds the Category input from `ObjectClass.categoryOptions()`: multi-select toggles for a non-empty array, otherwise a comma-separated suggest list on the `category` key. | The text-list fallback means a class with no declared vocabulary still has a category input. |
| `buildContextSetting(containerEl)` | hook | Builds Context as a vault-wide, unrestricted note-list picker through `buildNoteListSetting`. | Subclasses whose objects belong to a scoped context (e.g. a library) override it to restrict results, without duplicating the surrounding Affiliations and Tags fields in `onOpen()`. |
| `buildSubmitButton(containerEl)` | instance | Adds a `Create` call-to-action button. Clicking it closes the modal, then calls `onSubmit(this.result)`. | — |

**Field builders**

`options` for the three note builders is `{ folderPath, resolveFolderPath, expectedClass, placeholder = '' }`. All but `placeholder` are passed to the `NoteSuggest` constructor (see Controls below).

| Member | Kind | Control | Stored in `result[resultKey]` | Purpose | Rationale |
| --- | --- | --- | --- | --- | --- |
| `buildTextSetting(containerEl, label, resultKey, placeholder = '')` | instance | Text input | String | Plain text field. | — |
| `buildTextSuggestSetting(containerEl, label, resultKey, frontmatterKey, placeholder = '')` | instance | Text input with `ValueSuggest` (`single` mode) on `frontmatterKey` | String | Text field that suggests existing values of a frontmatter key. A selection replaces the stored value. | — |
| `buildListSetting(containerEl, label, resultKey, placeholder = '', defaultValue = '', vocabulary = null)` | instance | Comma-separated text input | Array of trimmed, non-empty strings | `defaultValue` seeds the result. When `vocabulary` is given, entries outside it are still stored and a `Notice` names them. | Vocabulary validation is advisory, not enforced. |
| `buildListSuggestSetting(containerEl, label, resultKey, frontmatterKey, placeholder = '', defaultValue = '')` | instance | Comma-separated text input with `ValueSuggest` (`list` mode) on `frontmatterKey` | Array of trimmed, non-empty strings | `defaultValue` seeds the result. Selecting a suggestion replaces the array with the selected value split on commas. | — |
| `buildDropdownSetting(containerEl, label, resultKey, options)` | instance | Dropdown with a leading `—` empty option | String | Pick-one field. The initial value is `result[resultKey]`, or `''`. | — |
| `buildDropdownArraySetting(containerEl, label, resultKey, options)` | instance | Dropdown with a leading `—` empty option | `[]` when empty, `[value]` otherwise | Pick-one field whose selection is stored as a string array. | For fields that hold exactly one value but are typed as a string array across every class (e.g. a length or form category). |
| `buildMultiSelectSetting(containerEl, label, resultKey, options)` | instance | Heading plus one toggle per option, all starting off | Array of selected options | Pick-many field. Initializes the result to `[]` when unset. | — |
| `buildToggleSetting(containerEl, label, resultKey, defaultValue = false)` | instance | Single toggle | Boolean | Sets the result to `defaultValue` immediately on build. | Stores one boolean directly, unlike the per-array-value toggles of `buildMultiSelectSetting`. |
| `buildFileSuggestSetting(containerEl, label, resultKey, placeholder = '')` | instance | Text input with `FileSuggest` | Typed text, replaced by `file.path` on selection | File picker. | — |
| `buildFolderSuggestSetting(containerEl, label, resultKey, placeholder = '')` | instance | Text input with `FolderSuggest` | Typed text, replaced by the selected path on selection | Folder picker. | — |
| `buildNoteSuggestSetting(containerEl, label, resultKey, options)` | instance | Text input with `NoteSuggest` | Typed text, replaced by the bare `file.basename` on selection | Single linked-note picker that stores a basename with no brackets. | — |
| `buildNoteLinkSetting(containerEl, label, resultKey, options)` | instance | Text input with `NoteSuggest` | Typed text, replaced by `[[<basename>]]` on selection | Single-value counterpart to `buildNoteListSetting`. | Stores a real wikilink so the frontmatter field renders as an Obsidian link, unlike `buildNoteSuggestSetting`. |
| `buildNoteListSetting(containerEl, label, resultKey, options)` | instance | Heading, one `NoteSuggest` text row per entry with a remove button, and an add button | Array of strings. Entries chosen from suggestions are `[[<basename>]]`. | Repeatable note-reference picker. Initializes the result to `[]` when unset. | Stores real wikilink strings so they render as Obsidian links. |

**Controls**

The field builders attach four input controls. Each extends Obsidian's `AbstractInputSuggest`, attaches to a text input, and calls `onSelectCb` when a suggestion is selected. `onSelectCb` is a callback the caller assigns after constructing the control. All four, and the shared validator described below, live in `.codex/controls/`. `BaseModal` imports the controls from `../../controls`.

**`FileSuggest`** suggests vault files other than Markdown notes. Used by `buildFileSuggestSetting`. `onSelectCb` receives the selected `TFile`.

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getSuggestions(query)` | instance | Returns vault files whose extension is not `md` and whose path contains the query (case-insensitive), sorted by path. | Markdown files are excluded because `NoteSuggest` serves them. No class filtering applies because arbitrary vault files carry no frontmatter. |
| `renderSuggestion(file, el)` | instance | Renders the file path. | — |
| `selectSuggestion(file)` | instance | Fills the input with `file.path`, closes the suggestion list, and calls `onSelectCb(file)`. | — |

**`FolderSuggest`** suggests vault folder paths. Used by `buildFolderSuggestSetting`. `onSelectCb` receives the selected path string.

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getSuggestions(query)` | instance | Returns the paths of all vault folders that contain the query (case-insensitive). Calls `getAllFolders(true)`, so the vault root is included. Results are not sorted. | — |
| `renderSuggestion(path, el)` | instance | Renders the path, or `/` when the path is empty. | — |
| `selectSuggestion(path)` | instance | Fills the input with the path, closes the suggestion list, and calls `onSelectCb(path)`. | — |

**`NoteSuggest`** suggests Markdown notes, optionally restricted to a folder and to a set of frontmatter `class` values. Used by `buildNoteLinkSetting`, `buildNoteListSetting`, and `buildNoteSuggestSetting`. `onSelectCb` receives the selected `TFile`.

Constructor options:

| Option | Type | Meaning |
| --- | --- | --- |
| `folderPath` | `string` | Vault-root-relative folder to restrict results to, matched as a path prefix. Omit to search the whole vault. When `resolveFolderPath` is given, `folderPath` is passed to it as a seed instead of being used directly. |
| `resolveFolderPath` | `(app, folderPath) => string` | Computes the restriction folder from `folderPath`. |
| `expectedClass` | `string[]` | Accepted frontmatter `class` values. A candidate note must carry a `class` in the array. Omit it or pass an empty array to accept any class. |

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, inputEl, { folderPath, resolveFolderPath, expectedClass } = {})` | instance | Validates `expectedClass` with `validateExpectedClass`, then stores `folderPath` (the result of `resolveFolderPath(app, folderPath)` when that is given, otherwise `folderPath`) and `expectedClass`. | `resolveFolderPath` lets a caller scope results to something derived from the given folder without `NoteSuggest` knowing anything about the derivation. |
| `getSuggestions(query)` | instance | Returns Markdown files that satisfy every active restriction, sorted by basename. A set `folderPath` requires the path to start with `<folderPath>/`. A non-empty `expectedClass` requires the note's frontmatter `class`, read from `app.metadataCache`, to be in the array. The query must be a case-insensitive substring of the basename. | — |
| `renderSuggestion(file, el)` | instance | Renders the note basename. | — |
| `selectSuggestion(file)` | instance | Fills the input with `file.basename`, closes the suggestion list, and calls `onSelectCb(file)`. | — |

**`ValueSuggest`** suggests values already used for a frontmatter key across the vault, instead of a fixed vocabulary. Used by `buildListSuggestSetting` (`list` mode) and `buildTextSuggestSetting` (`single` mode), and it backs the Category fallback in `buildCategorySetting`. `onSelectCb` receives the resulting input value: the selected value in `single` mode, the full new input text in `list` mode.

Constructor options:

| Option | Type | Meaning |
| --- | --- | --- |
| `mode` | `'single'` or `'list'` | `single` (default) completes the whole field. `list` completes only the fragment after the last comma and leaves the text before it untouched. |
| `expectedClass` | `string[]` | Accepted frontmatter `class` values. A scanned note must carry a `class` in the array. Omit it or pass an empty array to scan every class. |

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, inputEl, frontmatterKey, { mode = 'single', expectedClass } = {})` | instance | Validates `expectedClass` with `validateExpectedClass`, then stores `frontmatterKey`, `mode`, `expectedClass`, and `inputEl`. | `expectedClass` is unset by default because a value such as a genre or tag is usually meant to stay consistent across every class that uses it. |
| `collectKnownValues()` | instance | Scans the frontmatter of every Markdown file, read from `app.metadataCache`, and returns the unique values of `frontmatterKey`, converted to strings and sorted. Files without frontmatter are skipped, as are files whose `class` is not in `expectedClass` when that is non-empty. Each non-empty array element and each non-empty scalar contributes a value. | Suggesting values already in use keeps spelling consistent across notes, so `dark-fantasy` does not drift into `dark fantasy`. This serves fields that have no fixed vocabulary. |
| `currentFragment(query)` | instance | Returns the active query. In `list` mode, the text after the last comma, trimmed, or the whole trimmed query when there is no comma. In `single` mode, the query unchanged. | In `list` mode everything before the last comma is already-committed input and is left untouched. |
| `getSuggestions(query)` | instance | Returns the known values that contain the active fragment (case-insensitive). | — |
| `renderSuggestion(value, el)` | instance | Renders the value. | — |
| `selectSuggestion(value)` | instance | In `single` mode, fills the input with `value`, closes the suggestion list, and calls `onSelectCb(value)`. In `list` mode, builds the new input text from the existing text through the last comma, a single space, then `value` and `, `; fills the input with it, closes the suggestion list, and calls `onSelectCb` with it. | — |

**`validateExpectedClass`** is the validator shared by `NoteSuggest` and `ValueSuggest`. It lives in `.codex/controls/validate-expected-class.js` and imports `Log` from `../utils/logger.js`.

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `validateExpectedClass(expectedClass, controlName)` | function | Throws `<controlName> expectedClass must be an array of strings, received: <JSON>` when `expectedClass` is defined but is not an array of strings. The error is logged through `Log.error`, tagged with `controlName`, before it is thrown. `undefined` and `[]` are valid and mean no class restriction. | One validator keeps the accepted shape and the error identical across every control that takes `expectedClass`. |

## 9. Command
---

None. `BaseClass` is abstract and has no scaffolding command.

## 10. Additional Companion Files
---

None. `BaseClass` ships no companion files or objects.

## 11. Open Items
---

None.

## Appendix: Member Index
---

| Member | Kind | Section |
| --- | --- | --- |
| `baseFrontmatterFields` | instance | §2 |
| `buildCategorySetting` | instance | §8 |
| `buildContent` | instance | §5 |
| `buildContextSetting` | hook | §8 |
| `buildDropdownArraySetting` | instance | §8 |
| `buildDropdownSetting` | instance | §8 |
| `buildFileSuggestSetting` | instance | §8 |
| `buildFolderSuggestSetting` | instance | §8 |
| `buildFrontmatter` | instance | §2 |
| `buildFrontmatterBlock` | function | §2 |
| `buildListSetting` | instance | §8 |
| `buildListSuggestSetting` | instance | §8 |
| `buildMultiSelectSetting` | instance | §8 |
| `buildNoteLinkSetting` | instance | §8 |
| `buildNoteListSetting` | instance | §8 |
| `buildNoteSuggestSetting` | instance | §8 |
| `buildSubmitButton` | instance | §8 |
| `buildTextSetting` | instance | §8 |
| `buildTextSuggestSetting` | instance | §8 |
| `buildToggleSetting` | instance | §8 |
| `categoryOptions` | hook | §3 |
| `classValue` | hook | §1 |
| `collectKnownValues` | instance | §8 |
| `constructor` (`BaseClass`) | instance | §1 |
| `constructor` (`BaseModal`) | instance | §8 |
| `constructor` (`NoteSuggest`) | instance | §8 |
| `constructor` (`ValueSuggest`) | instance | §8 |
| `create` | instance | §6 |
| `currentFragment` | instance | §8 |
| `findIdentityAffiliation` | static | §7 |
| `formatFrontmatterLine` | internal | §2 |
| `formatScalarValue` | internal | §2 |
| `getBody` | hook | §5 |
| `getFrontmatterFields` | hook | §2 |
| `getSuggestions` (`FileSuggest`) | instance | §8 |
| `getSuggestions` (`FolderSuggest`) | instance | §8 |
| `getSuggestions` (`NoteSuggest`) | instance | §8 |
| `getSuggestions` (`ValueSuggest`) | instance | §8 |
| `onClose` | instance | §8 |
| `onOpen` | hook | §8 |
| `path` | getter | §1 |
| `postCreate` | hook | §6 |
| `renderSuggestion` (`FileSuggest`) | instance | §8 |
| `renderSuggestion` (`FolderSuggest`) | instance | §8 |
| `renderSuggestion` (`NoteSuggest`) | instance | §8 |
| `renderSuggestion` (`ValueSuggest`) | instance | §8 |
| `resolveFolder` | hook | §7 |
| `selectSuggestion` (`FileSuggest`) | instance | §8 |
| `selectSuggestion` (`FolderSuggest`) | instance | §8 |
| `selectSuggestion` (`NoteSuggest`) | instance | §8 |
| `selectSuggestion` (`ValueSuggest`) | instance | §8 |
| `validateExpectedClass` | function | §8 |

## Appendix: Specification Change Log
---

| Date       | Change       |
| ---------- | ------------ |
| 2026-11-07 | Removed `Log.error` and `Log.fatal` calls from the constructor and `create()`; `BaseClass` throws and the invoking command logs |
| 2026-11-06 | Unified `expectedClass` across `NoteSuggest` and `ValueSuggest` as `string[]`; added the shared `validateExpectedClass` |
| 2026-11-04 | Added the input controls (`FileSuggest`, `FolderSuggest`, `NoteSuggest`, `ValueSuggest`) to §8 |
| 2026-11-01 | Initial spec |