---
class: archive
category:
  - specification
affiliations:
created: 2026-08-25
modified: 2026-08-25
object: Glossary.js
modal: GlossaryModal.js
context:
  - "[[Library Module]]"
  - "[[Apparatus Library Property Taxonomy]]"
  - "[[Library.js Specification]]"
  - "[[Definition.js Specification]]"
tags:
---
Spec for `Glossary.js`.

## Contents
---

```toc
```

## 1. Scope and Class Shape
---

- Extends `BaseClass` directly — sibling to `Library.js`/`Works.js`/`Aggregate.js`/`Author.js`, not a subclass of `Library.js`.
- Location: `.obsidian/apparatus/library/lib/objects/Glossary.js`.
- Singleton per context library — the "folder note" for `glossary/`, playing the same at-a-glance/dashboard role for the glossary that `Library.js` plays for the catalog as a whole, scoped specifically to the glossary.
- Lives inside `glossary/` itself, coexisting in the same folder as the individual `Definition` notes it indexes. This differs from `Library.js`'s own pattern (root note with children living in separate subfolders).
- Filename is always the fixed literal `Glossary` — never curator-chosen. There is exactly one Glossary note per library, auto-created, so there's no naming ambiguity for a curator to resolve.
- `Glossary.resolveFolder()`: static override, resolves `${libraryFolder}/glossary` via `resolveLibraryFolder`. Same target `Definition.resolveFolder()` resolves to.
- `categoryOptions()`: `null` (free text), matching `Library.js`. No fixed vocabulary — a singleton dashboard note has no meaningful "kind" to categorize.

## 2. Frontmatter Fields
---

No custom fields. Only the standard set every Apparatus note/object carries via `BaseClass`: `class`, `category`, `affiliations`, `created`, `modified`, `context`, `tags`.

`libraryName`/`libraryTag` are constructor options, not frontmatter fields — they generate body content (the embedded companion `.base` filename and the Dataview scope tag) and are never written to the note's own frontmatter.

## 3. Status Field
---

`Glossary.js` carries no status field. It is a dashboard/index note, not a tracked work or library record — there is no lifecycle for `catalog-status` or any status variant to describe.

## 4. Body Content
---

`getBody()` renders:

- **Contents** — a `toc` code block.
- **Guidelines** — empty prose scaffold, the same role `Library.js`'s own Guidelines section plays: space for the curator to document glossary-specific conventions for this library.
- **All Terms** — an embed of `<library-name> Glossary.base`, the companion `.base` file (see §7) generated at the same time as the Glossary note itself.
- **By Category** — a Dataview table grouping `Definition` notes by their `category` value, scoped to `#<library-tag>` and filtered to `class = "definition"` — the same tag-based scoping convention used throughout the module (`Library.js`'s own dashboard, `Works.js`'s `getBodyDashboard()`), not a folder-based scope.
- **Change Log** — empty section at the bottom, following the same convention every other library-tier/aggregate-tier note uses: whenever `modified` is updated, the change log records a description of that change.

## 5. Modal
---

`GlossaryModal.js` is not consulted at note-creation time in either creation path (see §6). The Glossary note's fields — none beyond the `BaseClass` standard set — require no modal input: `libraryName`/`libraryTag` come directly from the `LibraryModal` submission when created via `library-create-library.js`, or directly off the existing Library note's frontmatter when backfilled via `library-create-glossary.js`. Whether `GlossaryModal.js` exists at all as a code module is open — see §8.

## 6. Command
---

Two commands create a Glossary note, depending on whether the library is new or already exists:

- **`library-create-library.js`** (`.obsidian/commands/library-create-library.js`) — for new libraries. Auto-scaffolds the Glossary note, its folder, and its companion `.base` file at the same moment it creates the five standard subfolders and `<library-name> Bibliography.base`. See [[Library.js Specification]] §6 for the full command sequence this extends.
- **`library-create-glossary.js`** (`.obsidian/commands/library-create-glossary.js`) — for existing libraries missing one or more of the three pieces (predating this feature, or otherwise incomplete). Only enabled from inside an existing library, resolved via `resolveLibraryFolder()`/`resolveLibraryNote()`. Reads `library-name`/`library-tag` directly off the existing Library note's frontmatter rather than from any modal. Creates the `glossary/` folder, the companion `.base` file, and the Glossary note independently, each only if not already present — it does not overwrite or refuse to run against a partially-scaffolded `glossary/`.

`resolveLibraryFolder()` throws (via `Log.error`) when it can't find an enclosing library. `library-create-glossary.js`'s `checkCallback` calls it to decide command availability, which means a Notice fires on every availability check made outside a library folder, not only on actual invocation.

Both commands share one implementation for the companion `.base` file's content: `buildGlossaryBaseContent(libraryTag)`, exported from `Glossary.js` itself alongside the class — the same pattern `BaseClass.js` uses, exporting both the class and a related standalone content-builder (`buildFrontmatterBlock`).

The `glossary/` folder remains otherwise empty — containing only the Glossary note and its companion `.base` file — until the curator creates their first `Definition` note via `library-create-definition.js`.

## 7. Companion `.base` File
---

- Generated as `<library-name> Glossary.base`, automatically, in both creation paths described in §6 — no curator-entered filter configuration (unlike `Periodical.js`'s `filter-tag`, which the curator must supply).
- Filtered to notes carrying both the library's own tag and `class == "definition"` — the `class` comparison excludes the Glossary note itself (`class: glossary`, not `class: definition`) automatically, without needing any additional exclusion logic.
- Single table view (`Glossary`); columns: file name, category, short-definition.
- Naming mirrors `<library-name> Bibliography.base`'s convention (library name, not filename-per-item the way `Periodical`'s `<filename> Issues.base` is named, since Glossary is a singleton per library rather than one-of-several like Periodicals).

## 8. Open Items
---

- Whether `GlossaryModal.js` needs to exist at all, given the Glossary note has no curator-entered fields in either creation path.
- `library-create-definition.js` — the command that will actually populate `glossary/` with `Definition` notes — is undesigned. See [[Definition.js Specification]] §7.
- The Dataview query syntax in §4's "By Category" section and the `.base` file structure in §7 are drafted against the documented conventions used elsewhere in the module (tag-based scoping, the `class ==` comparison syntax `Periodical.js`'s Issues `.base` uses) but have not been verified against a real, working Dataview query or `.base` file from this vault.

## 9. Change Log
---

| Date | Change |
| ---- | ------ |
| 2026-08-25 | Removed the invented Accession section — the class has no relational fields and no Accession participation of any kind, and the template omits sections for behavior a class doesn't have rather than documenting the absence. Reordered remaining sections to match [[Apparatus Code Module Specification Template]]: Scope, Frontmatter Fields, Status Field, Body Content, Modal, Command, Companion `.base` File, Open Items, Change Log. Added `library-create-glossary.js`, a backfill command for existing libraries missing part of the Glossary scaffold; factored `buildGlossaryBaseContent()` out of `library-create-library.js` into a shared export in `Glossary.js` itself, used by both commands. |
| 2026-08-25 | Initial spec. Class shape, folder placement (shared with Definition in glossary/), fixed "Glossary" filename, empty frontmatter beyond BaseClass standard fields, dashboard body content, companion .base file, and auto-creation via library-create-library.js all specified. |