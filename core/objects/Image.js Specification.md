---
class: archive
category:
  - specification
affiliations:
created: 2026-08-28
modified: 2026-11-07
object: Image.js
modal: ImageModal.js
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[Collection.js Specification]]"
  - "[[The Big TODO]]"
tags:
---

Generic Apparatus-level metadata wrapper around an image file. Builds a note whose frontmatter records the image's provenance and whose body embeds the image.

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

`Image` extends `BaseClass` directly. It belongs to no module. It is a metadata reference to an image file, not a container for notes, commentary, or other body content.

A module that wants a dedicated storage location for its own image objects extends `Image` and overrides `resolveFolder()`. `Image` does not override `resolveFolder()`; it inherits the `BaseClass` default.

Inherited behavior (frontmatter rendering, `create()`, `path`, `resolveFolder()`) is specified in [[BaseClass.js Specification]]. Members with Kind `hook` in this spec are `Image`'s overrides of `BaseClass` hooks.

| Property | Value |
| --- | --- |
| Location | `.codex/core/objects/Image.js` |
| Export | `Image` (named) |
| Extends | `BaseClass` (`.codex/core/objects/BaseClass.js`) |
| Module | None |
| Accompanying modal | `ImageModal` (`.codex/core/modals/ImageModal.js`), see §6 |
| Command | `core-create-image.js`, see §7 |

**Dependencies**

| Import | Source | Use |
| --- | --- | --- |
| `BaseClass` | `./BaseClass.js` | Superclass |

No helper or utility modules.

**Constructor options**

`Image` accepts every `BaseClass` option (`filename` required; `folder`, `category`, `affiliations`, `context`, `tags` optional), handled by `super`, plus:

| Option | Required | Default | Stored as |
| --- | --- | --- | --- |
| `options.imageVaultPath` | No | `''` | `this.imageVaultPath` |
| `options.source` | No | `''` | `this.source` |
| `options.attribution` | No | `''` | `this.attribution` |
| `options.license` | No | `''` | `this.license` |
| `options.altText` | No | `''` | `this.altText` |
| `options.caption` | No | `''` | `this.caption` |

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, options = {})` | instance | Calls `super(app, options)`, then stores the class-specific options above. Errors thrown by `BaseClass` for a missing `app` or `filename` propagate unchanged. | — |
| `static classValue` | hook | Value written to the `class` frontmatter field. `'image'`. | — |

## 2. Frontmatter Fields
---

**Inherited fields:** `class`, `category`, `affiliations`, `created`, `modified`, `context`, `tags`, supplied by `baseFrontmatterFields()`.

**Class-specific fields:** `source`, `attribution`, `license`, `alt-text`, `caption`.

**Fields**, in render order, as returned by `getFrontmatterFields()`:

| Order | Key | Origin | Value |
| --- | --- | --- | --- |
| 1 | `class` | inherited | `'image'` (`Image.classValue`) |
| 2 | `category` | inherited | `this.category`. Closed vocabulary, see §3. |
| 3 | `affiliations` | inherited | `this.affiliations` |
| 4 | `created` | inherited | `moment().format('YYYY-MM-DD')` |
| 5 | `modified` | inherited | `''` |
| 6 | `source` | class-specific | `this.source`. Free text. The image's provenance: where it came from (online, a magazine, an artist, original work). Not its location in the vault. |
| 7 | `attribution` | class-specific | `this.attribution`. Free text. |
| 8 | `license` | class-specific | `this.license`. Free text. |
| 9 | `alt-text` | class-specific | `this.altText`. Free text. |
| 10 | `caption` | class-specific | `this.caption`. Free text. |
| 11 | `context` | inherited | `this.context`. Wikilink array, stored raw. |
| 12 | `tags` | inherited | `this.tags` |

Values render according to the rendering rules in [[BaseClass.js Specification]] §2. An empty string renders as `key:`.

**The vault path to the image file is not a frontmatter field.** It is held as `this.imageVaultPath` and used only to build the body embed (see §5).

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getFrontmatterFields()` | hook | Returns the fields above in render order. Inherited keys come from `baseFrontmatterFields()`; class-specific keys come from the instance properties. `this.altText` renders under the key `alt-text`. | — |

## 3. Category Vocabulary
---

Closed vocabulary. Valid values, cross-referenced with [[Apparatus Module Taxonomy]]:

`artwork`, `cover`, `diagram`, `illustration`, `map`, `photograph`, `portrait`, `screenshot`

`ImageModal` reads the vocabulary through `buildCategorySetting(contentEl, Image)`, which renders one multi-select toggle per value (see [[BaseClass.js Specification]] §3).

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `static categoryOptions()` | hook | Returns the eight valid category strings listed above. | — |

## 4. Status Field
---

None. `Image` defines no status field and registers no status domain in [[Apparatus Status Taxonomy]].

## 5. Body Content
---

`getBody()` returns a single bare image embed: `![[<imageVaultPath>]]`, where `<imageVaultPath>` is `this.imageVaultPath`, the value the modal collects at creation time. When `imageVaultPath` is empty, `getBody()` returns `''`. There is no heading, no scaffolded section, and no Dataview query. `buildContent()` places the body after the frontmatter block and two newline characters.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getBody()` | hook | Returns `![[<imageVaultPath>]]`, or `''` when `imageVaultPath` is empty. | An embed with an empty path renders as nothing outside source mode, so an empty path produces no embed. |

## 6. Modal
---

**Location:** `.codex/core/modals/ImageModal.js`. Export: `ImageModal`, which extends `BaseModal` directly.

**Dependencies:** `BaseModal` from `./BaseModal.js`; `Image` from `../objects/Image.js`.

**Result object:** `BaseModal` initializes `this.result` to `{ affiliations: [], context: [], tags: [] }`. `ImageModal` adds the keys below. Every key matches the `Image` constructor option of the same name, so the result is passed to `new Image()` unchanged apart from `folder`.

| Key | Initial value |
| --- | --- |
| `filename` | `''` |
| `category` | `[]` |
| `imageVaultPath` | `''` |
| `source` | `''` |
| `attribution` | `''` |
| `license` | `''` |
| `altText` | `''` |
| `caption` | `''` |

**Field build order**

`ImageModal.onOpen()` renders an `h2` heading, `New Image`, then:

| Order | Field | Builder | Result key |
| --- | --- | --- | --- |
| 1 | Filename | `buildTextSetting` | `filename` |
| 2 | Category | `buildCategorySetting(contentEl, Image)` | `category` |
| 3 | Vault path to image | `buildFileSuggestSetting` | `imageVaultPath` |
| 4 | Source | `buildTextSetting` | `source` |
| 5 | Attribution | `buildTextSetting` | `attribution` |
| 6 | License | `buildTextSetting` | `license` |
| 7 | Alt text | `buildTextSetting` | `altText` |
| 8 | Caption | `buildTextSetting` | `caption` |
| 9 | Affiliations | `super.onOpen()` | `affiliations` |
| 10 | Context | `super.onOpen()` | `context` |
| 11 | Tags | `super.onOpen()` | `tags` |
| 12 | Submit button | `buildSubmitButton` | None |

The Vault path to image field uses `FileSuggest`, a general-purpose file picker that excludes Markdown files. `FileSuggest` and `buildFileSuggestSetting` are specified in [[BaseClass.js Specification]] §8.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, onSubmit)` | instance | Calls `super(app, onSubmit)`, then adds the keys above to `this.result`. | — |
| `onOpen()` | hook | Renders the heading and fields 1 through 8, calls `super.onOpen()` for fields 9 through 11, then calls `buildSubmitButton(contentEl)`. | — |

## 7. Command
---

**Location:** `.commands/core-create-image.js`. Export: `buildInvokeCommand` (named, async). Command name: `Create Image`. Command ID: `core-create-image`.

**Dependencies:** `Image` from `../.codex/core/objects/Image.js`; `ImageModal` from `../.codex/core/modals/ImageModal.js`; `Log` from `../.codex/utils/logger.js`.

The command uses a plain `callback()` with no availability check.

**Submit flow**

`callback()` constructs and opens `ImageModal` inside a `try`/`catch`. An error thrown while the modal is built or opened is logged once through `Log.error`, tagged `core-create-image`, using the error's message, and is not rethrown. On submit the handler runs, in order:

1. **Required-field check.** If both `imageVaultPath` and `source` are empty, throws `Image requires either a vault path or a source to be meaningful.` Neither field is otherwise required by the command. An empty `filename` is not checked here; the `BaseClass` constructor rejects it.
2. **Folder.** `await Image.resolveFolder(app)`, the inherited `BaseClass` default.
3. **Instantiate.** `new Image(app, { ...result, folder })`.
4. **Create.** `await image.create()`.
5. **Open.** `app.workspace.getLeaf(false).openFile(file)`.

An error thrown anywhere in steps 1 through 5 is caught and logged once through `Log.error`, tagged `core-create-image`, using the error's message. The handler does not rethrow.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `buildInvokeCommand(app)` | function | Returns the command definition `{ name, id, callback }`. | — |
| `callback()` | internal | Opens `ImageModal` and runs the submit flow above. | `BaseModal` performs no required-field validation, so the check on the modal's fields lives in the command. `BaseModal` does not await `onSubmit`, and modal construction runs outside the submit handler, so each has its own `try`/`catch` that logs and does not rethrow. |

## 8. Additional Companion Files
---

None. `Image` ships no companion files or objects.

## 9. Open Items
---

None.

## Appendix: Member Index
---

| Member | Kind | Section |
| --- | --- | --- |
| `buildInvokeCommand` | function | §7 |
| `callback` | internal | §7 |
| `categoryOptions` | hook | §3 |
| `classValue` | hook | §1 |
| `constructor` (`Image`) | instance | §1 |
| `constructor` (`ImageModal`) | instance | §6 |
| `getBody` | hook | §5 |
| `getFrontmatterFields` | hook | §2 |
| `onOpen` | hook | §6 |

## Appendix: Specification Change Log
---

| Date | Change |
| --- | --- |
| 2026-11-07 | Retrofitted to the current template: added member tables, Category Vocabulary section, Member Index, and the Specification Change Log appendix. `getBody()` returns `''` when `imageVaultPath` is empty. The command logs each error once at its catch and does not rethrow, and `callback()` wraps modal construction and `.open()` in a `try`/`catch` that logs once. |
| 2026-09-13 | Closed all remaining open items from §7: `FileSuggest.js` implemented (confirmed — see `.codex/controls/FileSuggest.js`), `LibraryCoverImage.js`/module-specific `Image` subclass addressed, and `Collection.cover-card`'s `expectedClass: 'image'` scoping applied. No open items remain. |
| 2026-08-28 | Initial specification. |