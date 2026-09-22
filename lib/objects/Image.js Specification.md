---
class: archive
category:
  - specification
affiliations:
created: 2026-08-28
modified: 2026-09-13
object: Image.js
modal: ImageModal.js
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[Collection.js Specification]]"
  - "[[The Big TODO]]"
tags:
---
Spec for `Image.js`.

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

- `Image.js` extends `BaseClass` directly. Location: `.obsidian/apparatus/lib/objects/Image.js`.
- Apparatus-level, not scoped to any single module. Provides a generic metadata wrapper around an image file.
- Middle-tier class: not intended for direct folder-scoped instantiation by any one module. A module wanting a dedicated storage location for its own image objects builds a subclass extending `Image.js` (e.g. a Library-scoped `LibraryCoverImage.js` resolving to `<library>/covers-and-illustrations/`) and overrides `resolveFolder()` there.
- `Image.js` itself does not override `resolveFolder()` — inherits `BaseClass`'s default (active file's parent, unscoped).
- `categoryOptions()`: closed vocabulary — `artwork`, `cover`, `diagram`, `illustration`, `map`, `photograph`, `portrait`, `screenshot`.
- Represents a metadata reference to an image, not a container for notes, commentary, or other body content.

## 2. Frontmatter Fields
---

| Field | Type | Notes |
| --- | --- | --- |
| `class` | string | `image`. |
| `category` | string array | Closed vocabulary — see §1. |
| `affiliations` | string array | No fixed vocabulary, standard via `BaseClass`. |
| `created` / `modified` | date | Standard via `BaseClass`. |
| `source` | string | Free text. Describes the image's provenance — where it came from (online, a magazine, an artist, original work) — not its location in the vault. |
| `attribution` | string | Free text. |
| `license` | string | Free text. |
| `alt-text` | string | Free text. |
| `caption` | string | Free text. |
| `context` | wikilink array | Standard via `BaseClass`. Stored raw — `Image.js` performs no eager resolution of its own on top of it. |
| `tags` | string array | Standard via `BaseClass`. |

Full field order in generated frontmatter: `class`, `category`, `affiliations`, `created`, `modified`, `source`, `attribution`, `license`, `alt-text`, `caption`, `context`, `tags`.

**The vault-relative path to the image file is not a stored frontmatter field.** It is collected once, in the modal, and used only to construct the body's embed (see §4) — it has no corresponding key in `getFrontmatterFields()`.

## 3. Status Field
---

`Image.js` carries no status field. `catalog-status` and its variants apply to library records, work indexes, and ingest-oriented notes; an Image note is a reference entity, not a tracked work, and has no analogous lifecycle.

## 4. Body Content
---

`getBody()` returns a single bare image embed: `![[<image-vault-path>]]`, where `<image-vault-path>` is the value collected by the modal at creation time. No heading, no scaffolded notes section, no other content. The note is not designed to hold discussion or commentary at creation — a curator may add content below the embed by hand at any time after creation, but no space is reserved for it.

## 5. Modal
---

Location: `.obsidian/apparatus/lib/modals/ImageModal.js`, extending `BaseModal` directly.

Field build order:

1. **Filename**
2. **Category** — `buildCategorySetting()` against `Image.categoryOptions()`.
3. **Vault path to image** (`image-vault-path`) — text field backed by a new file-suggest control (see below). Collected but not stored as a frontmatter field — used only to build the body's embed at creation time.
4. **Source** — text field.
5. **Attribution** — text field.
6. **License** — text field.
7. **Alt text** — text field.
8. **Caption** — text field.
9. Shared affiliations/context/tags fields, via `super.onOpen()`.

### New shared control: `FileSuggest.js`

`NoteSuggest.js` filters `app.vault.getMarkdownFiles()` by frontmatter `class`, which doesn't apply to an arbitrary non-Markdown file. The "Vault path to image" field requires a new, general-purpose "locate a file" control, distinct from `NoteSuggest`.

- Location: `.obsidian/apparatus/lib/controls/FileSuggest.js`, sibling to `FolderSuggest.js`/`NoteSuggest.js`/`ValueSuggest.js`.
- Not scoped to image file types — a general-purpose file picker for the vault.
- Excludes `.md` files, since `NoteSuggest.js` already serves that case.
- Same attach-to-text-input, `onSelectCb`-driven shape as `FolderSuggest`/`NoteSuggest`.

## 6. Command
---

Location: `.obsidian/commands/apparatus-create-image.js`. Command ID: `apparatus-create-image`.

- Follows the established plain-`callback()` pattern (not `checkCallback`), matching `library-create-collection.js`/`library-create-periodical.js`/`library-create-article.js`: no availability pre-check — `Image.resolveFolder(app)` is called and any resolution failure surfaces at invocation.
- Opens `ImageModal`; on submit, throws (via `Log.error`) if both `image-vault-path` and `source` are empty — at least one of the two is required for the note to be meaningful. Neither field is otherwise required.
- Resolves the target folder via `Image.resolveFolder(app)` (`BaseClass`'s inherited default).
- Creates the `Image` note, then opens it in the active leaf.

## 7. Open Items
---


## 8. Change Log
---

| Date | Change |
| --- | --- |
| 2026-09-13 | Closed all remaining open items from §7: `FileSuggest.js` implemented (confirmed — see `.obsidian/apparatus/lib/controls/FileSuggest.js`), `LibraryCoverImage.js`/module-specific `Image` subclass addressed, and `Collection.cover-card`'s `expectedClass: 'image'` scoping applied. No open items remain. |
| 2026-08-28 | Initial specification. |