---
class: archive
category:
  - specification
affiliations:
created: 2026-08-20
modified: 2026-08-25
context:
  - "[[Apparatus Library Property Taxonomy]]"
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[citation]]"
  - "[[Library Accession Trigger Map]]"
tags:
---
Spec for `Collection.js`.

## Contents
---

```toc
```

## 1. Scope and Class Shape
---

> The class-hierarchy statement below restates [[Library Module]] §2, Class Hierarchy, which is authoritative. It is also restated in [[Author.js Specification]] §1, [[Periodical.js Specification]] §1, and [[Works.js Specification]] §1. Update all of these, including this section, when the hierarchy changes.

- `Collection.js` extends `Aggregate.js`. `Aggregate.js` itself extends `BaseClass` directly, sibling to `Work.js`/`Library.js`/`Author.js`.
- `Aggregate.js` is the shared middle tier for Library classes that aggregate other Work notes under one bibliographic identity — currently `Collection` and `Periodical`. It owns the fields genuinely common to both: `authors` (cascade-only), `editors`, `publisher`, `place-of-publication`, `genres`, `catalog-status`, plus `resolveFolder()`.
- Represents a single periodical issue (when `periodical` is set) or a standalone authored/edited volume — anthology, essay collection, festschrift — when it isn't.
- `categoryOptions()`: `anthology`, `essay-collection`, `fiction`, `poetry`, `festschrift`.
- `Collection.resolveFolder()` is inherited from `Aggregate.js`, not overridden — resolves `${libraryFolder}/collections` via `resolveLibraryFolder`, same target `Periodical.resolveFolder()` resolves to. A Collection and the Periodical it belongs to (if any) live side by side in the same folder.

## 2. Frontmatter Fields
---

| Field | Type | Notes |
| ----- | ---- | ----- |
| `class` | string | `collection`. |
| `category` | string array | Closed vocabulary — see §1. |
| `affiliations` | string array | No fixed vocabulary, standard via `BaseClass`. |
| `sort-title` | string | Free text, user-entered. Unlike Work leaves (where `sort-title` is auto-derived from the filename by stripping a leading "a/an/the"), Collection collects this directly in the modal. |
| `short-name` | string | Free text. For at-a-glance identification when working in a `.base` file's card view. |
| `catalog-status` | string | Inherited from `Aggregate.js`. Reused as-is from the existing base-tier vocabulary — no Collection-specific status axis. |
| `created` / `modified` | date | Standard via `BaseClass`. |
| `date-cataloged` | string | Free text, `YYYY-MM-DD`. |
| `year` | string | Free text, e.g. `2019`. |
| `periodical` | wikilink | Resolved eagerly in the constructor via `resolve-titles.js` (`resolveNoteTitle()` + `toWikilink()`, throwing). Set when this Collection is one issue of a larger periodical series; left empty for a standalone volume. |
| `volume` | string | Free text. Only meaningful when `periodical` is set — describes this issue's position within that periodical's run. |
| `issue` | string | Free text. Same scope as `volume`. |
| `authors` | wikilink array | Inherited from `Aggregate.js`. Cascade-only via Accession — see [[Accession Specification]]. No modal field. |
| `editors` | wikilink array | Inherited from `Aggregate.js`. Relational, modal field, stored as raw unresolved wikilinks (resolution deferred to citation time). |
| `translators` | wikilink array | Collection's own field, not shared via `Aggregate.js` (Periodical has no analog). Same raw-wikilink storage as `editors`. |
| `works` | wikilink array | Cascade-only via Accession — see [[Accession Specification]]. No modal field. Holds every Work note that lists this Collection in its own `collections` field. |
| `publisher` | string | Inherited from `Aggregate.js`. Free text. |
| `place-of-publication` | string | Inherited from `Aggregate.js`. Free text. |
| `citation` | string | Generated at creation time — see §3. Empty (key still declared) when `periodical` is set. |
| `source` | string | Free text URL. Replaces the Work-tier `text-source` field, which Collection does not carry. |
| `cover` | string | Free text — either a wikilink to an in-vault image, or a URL if the cover reference is online. Stored as-is, no resolution step. |
| `cover-card` | wikilink | Intended to reference a future `class: image` note (not yet built — see §5). Currently a plain, unrestricted wikilink field. |
| `genres` | string array | Inherited from `Aggregate.js`. Free text, `ValueSuggest`-backed. |
| `themes` | string array | Free text. |
| `keywords` | string array | Free text. |
| `content-warnings` | string array | Advisory-controlled vocabulary, non-blocking validation. |
| `context` | string array | Standard via `BaseClass`. |
| `tags` | string array | Standard via `BaseClass`. |

Full field order in generated frontmatter: `class`, `category`, `affiliations`, `sort-title`, `short-name`, `catalog-status`, `created`, `modified`, `date-cataloged`, `year`, `periodical`, `volume`, `issue`, `authors`, `editors`, `translators`, `works`, `publisher`, `place-of-publication`, `citation`, `source`, `cover`, `cover-card`, `genres`, `themes`, `keywords`, `content-warnings`, `context`, `tags`.

## 3. Status Field
---

`Collection.js` uses `catalog-status`. See [[Apparatus Status Taxonomy]] for details.

## 4. Body Content
---

- `getBody()` renders an `## abstract` section (placeholder comment only — `abstract` is not a stored frontmatter field, so there is no user-entered value to display here) and a `## notes` section for reading notes/reactions/excerpts.

## 5. Citation Generation
---

`Collection.js` calls the citation engine directly.

- `Collection.js`'s constructor calls the standalone `computeCitation(app, path, folder, classValue, fields)` export from `citation-engine.js` (see the Citation Engine Specification's "Citation computation" section), passing its own `this.app`/`this.path`/`this.folder`/`Collection.classValue` — not an inherited instance method, since Collection does not extend `Work`.
- Fields passed: `title` (the note's filename), `authors`, `editors`, `translators`, `year`, `periodical` (the raw, unresolved wikilink — resolved downstream by the engine), `publisher`, `place-of-publication`. Notably absent: `collections` and `edition` — Collection carries neither field, so `formatCollection`'s delegation to `formatEssay` always renders an empty container-title and edition segment.
- `formatCollection` (all three styles) branches on `periodical`: unset → delegates to `formatEssay`, producing a standard authored/edited-volume citation; set → returns `''`. No style guide (MLA/APA/Chicago) treats a periodical issue as an independently citable unit — only the article within it is.
- The `citation` frontmatter key is always declared, even when its value is empty, so every Collection note's frontmatter shape stays consistent regardless of category.

## 6. Accession
---

`Collection.js` participates in Accession as both an initiator and a target. See [[Accession Specification]] for the full mechanism.

- As an initiator: `Collection.postCreate()` overrides `Aggregate.js`'s no-op, calling `super.postCreate()` first, then — if `this.periodical` is set — pushes this Collection's own wikilink into that Periodical's `collections` array (Accession row 1).
- As a target: `authors` and `works` are populated by a referencing Work's own `postCreate()` (Accession rows 4–5). `editors`/`translators` are never populated this way — both remain curator-entered only.
- Failure behavior follows the shared dedupe/failure model in [[Accession Specification]] §5: a failed push throws and logs rather than failing silently; primary note creation may already have succeeded on disk, requiring manual reconciliation.

## 7. Relational Field Resolution
---

> This section restates resolver semantics. The authoritative source is [[citation]] §2. It is also restated in [[Library Module]] §5 (Object Resolution table), [[Author.js Specification]] §6, [[Periodical.js Specification]] §7, and [[Works.js Specification]] §6. Update all of these, including this section, when resolver behavior changes.

- `periodical` resolves eagerly in the constructor via `resolveNoteTitle()` + `toWikilink()` (throwing) — a curated relationship asserted at creation time, same treatment `Periodical.editors` gets.
- `editors`/`translators` are stored as raw, unresolved wikilinks — resolution is deferred to citation time (via `resolveAuthors()` in `citation-engine.js`), not performed eagerly.
- `works` is stored raw — a plain, cascade-populated wikilink array holding each pushed value as-written, never resolved anywhere in the module.
- `cover-card` is a plain wikilink field with no `expectedClass` restriction and no eager resolution — because the `Image` class it's meant to reference doesn't exist yet. Once `Image.js` is built, this field should gain `expectedClass: 'image'` scoping in `CollectionModal.js`.
- `cover` is never treated as a wikilink at all — it may hold either a wikilink or a bare URL, and is stored exactly as entered.

## 8. Modal
---

Location: `.obsidian/apparatus/library/lib/modals/CollectionModal.js`, extending `AggregateModal.js`.

Field build order:

1. **Filename**
2. **Category** — `buildCategorySetting()` against `Collection.categoryOptions()`.
3. **Sort title** — text field.
4. **Short name** — text field.
5. **Catalog status** — dropdown, via `AggregateModal.buildCatalogStatusSetting()`.
6. **Date cataloged** — text field, placeholder `YYYY-MM-DD`.
7. **Year** — text field.
8. **Periodical** — single-wikilink picker (`buildNoteLinkSetting`), `expectedClass: 'periodical'`, scoped via `resolveLibraryFolder`.
9. **Volume** — text field.
10. **Issue** — text field.
11. **Editors** — via `AggregateModal.buildEditorsSetting()`.
12. **Translators** — note-list picker, `expectedClass: 'author'`.
13. **Publisher** / **Place of publication** — via `AggregateModal.buildPublisherFields()`.
14. **Source** — text field.
15. **Cover** — text field, no note-picker (free text, may be a URL).
16. **Cover card** — single-wikilink picker, no `expectedClass`/`folderPath` restriction (see §5).
17. **Genres** — via `AggregateModal.buildGenresSetting()`.
18. **Themes** / **Keywords** — list fields.
19. **Content warnings** — list field, advisory vocabulary.
20. Shared affiliations/tags fields, via `super.onOpen()`.

No `works` field — cascade-only, per §6.

## 9. Command
---

`library-create-collection.js` scaffolds this class.

## 10. Open Items
---

- `cover-card`'s `expectedClass` scoping is blocked on `Image.js`, which does not exist yet.
- The Dataview query replacing `contained-works` in the body has not been written.

## 11. Change Log
---

| Date       | Change |
| ---------- | ------ |
| 2026-08-25 | Added inline cross-reference notes marking duplicated content and where it must also be updated: §1's class-hierarchy statement (restated in Library Module §2 and Author.js/Periodical.js/Works.js §1), §7 Relational Field Resolution (restated in Citation Engine Specification §2 and Library Module §5 / Author.js §6 / Periodical.js §7 / Works.js §6). No content changed. |
| 2026-08-22 | Added `works` field (§2, cascade-only via Accession, sits after `translators` in field order). Renamed §6 from "Cascade Mechanism — `postCreate()`" to "Accession" and trimmed it to a summary of Collection's own participation, cross-referencing [[Accession Specification]] for the full mechanism. |
| 2026-08-20 | Initial spec, reflecting `Collection.js` as rebuilt on `Aggregate.js` during the Collection Hierarchy Correction. |