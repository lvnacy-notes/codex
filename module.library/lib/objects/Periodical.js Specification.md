---
class: archive
category:
  - specification
affiliations:
created: 2026-08-16
modified: 2026-08-25
object: Periodical.js
modal: PeriodicalModal.js
context:
  - "[[Apparatus Library Property Taxonomy]]"
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[Collection.js Specification]]"
  - "[[citation]]"
  - "[[Library Accession Trigger Map]]"
tags:
---
Spec for `Periodical.js`.

## Contents
---

```toc
```

## 1. Scope and Class Shape
---

> The class-hierarchy statement below restates [[Library Module]] §2, Class Hierarchy, which is authoritative. It is also restated in [[Author.js Specification]] §1, [[Collection.js Specification]] §1, and [[Works.js Specification]] §1. Update all of these, including this section, when the hierarchy changes.

- `Periodical.js` extends `Aggregate.js`. `Aggregate.js` is the shared middle tier for Library classes that aggregate other Work notes under one bibliographic identity; `Collection.js` is its other subclass. See [[Collection.js Specification#1. Scope and Class Shape|Collection.js Specification §1]] for `Aggregate.js`'s shape.
- Never touches the citation engine.
- Tracks an entire periodical's run (title → issue → piece), one level above `Collection`.
- Periodical notes live in `collections/`, alongside the Collection (issue) notes they track. A Periodical is, in essence, a collection of collections.
- `Periodical.resolveFolder()` is inherited from `Aggregate.js`, not overridden — resolves `${libraryFolder}/collections` via `resolveLibraryFolder`, the same target `Collection.resolveFolder()` resolves to. A `Create Library Periodical` command run from anywhere inside the enclosing library resolves to the correct folder.

## 2. Frontmatter Fields
---

### `Periodical.js` — full field set

| Field | Type | Notes  |
| ----- | ---- | ------ |
| `class` | string | `periodical`. |
| `category` | string array   | Closed vocabulary, multiple values allowed — names the *kind* of periodical. Values: `pulp-magazine`, `literary-magazine`, `trade-journal`, `academic-journal`, `opinion-journal`, `fanzine`, `webzine`, `newsletter`, `newspaper`, `digest`, `magazine`. |
| `affiliations` | string array | No fixed vocabulary — see notes below. |
| `catalog-status` | string | Inherited from `Aggregate.js`. Reused as-is from the existing base-tier vocabulary. See §7. |
| `created` / `modified` | date | Standard via `BaseClass`. |
| `issn` | string| Free text. |
| `frequency` | string | Controlled vocabulary: `daily`, `semiweekly`, `weekly`, `fortnightly`, `monthly`, `bimonthly`, `quarterly`, `semiannual`, `annual`, `biennial`, `irregular`. Lives in `library-vocab.js`. |
| `active-years` | string | Free text (founded/ended, or ongoing). |
| `circulation` | string | Controlled vocabulary — `active`/`hiatus`/`ceased`. See §7. |
| `authors` | wikilink array | Inherited from `Aggregate.js`. Aggregate contributor list across all tracked issues. Quick-and-dirty snapshot / dataview surface — not a source of truth. Cascade-only via Accession — see [[Accession Specification]]. No modal field — starts empty. |
| `collections` | wikilink array | Periodical's own field, not shared via `Aggregate.js` (Collection has no analog). Array of Collection (issue) notes belonging to this Periodical. Cascade-only via Accession — see [[Accession Specification]]. No modal field — starts empty. |
| `editors` | wikilink array | Inherited from `Aggregate.js`. Relational, modal field, stored as raw unresolved wikilinks, matching the storage convention used throughout the module (`Work.js`, `Collection.editors`/`translators`). Resolution is deferred to whatever consumes the field later. Never populated via Accession — distinct from aggregate `authors` in this respect. |
| `publisher` | string | Inherited from `Aggregate.js`. Free text. |
| `place-of-publication` | string | Inherited from `Aggregate.js`. Free text. |
| `genres` | string array   | Inherited from `Aggregate.js`. Free text, `ValueSuggest`-backed — mirrors `PulpFictionWork.js`'s own `genres` field. |
| `context` | string array | Standard via `BaseClass`. |
| `tags` | string array   | Standard via `BaseClass`. |

Full field order in generated frontmatter: `class`, `category`, `affiliations`, `catalog-status`, `created`, `modified`, `issn`, `frequency`, `active-years`, `circulation`, `authors`, `collections`, `editors`, `publisher`, `place-of-publication`, `genres`, `context`, `tags`.

Freeform description/notes content is NOT a frontmatter field — it lives in the note body instead (a `## notes` section, mirroring `Collection.js`'s own body), to keep frontmatter scannable rather than risk an unruly free-text block there.

**`affiliations` note:** Distinct in kind from `cites`/`related`/`part-of`, which carry wikilinks to other notes: `affiliations` tracks meaningful *content*-level connections — characters, ideologies, recurring namespaced concepts — that show up across multiple objects within a context library, not links to specific other notes. The vocabulary is expected to arise organically per context library as it receives works, the same way Story's `affiliations` names series/world identity without a fixed enumerated list.

### `Collection.js` (cross-reference)

| Field | Type | Notes |
| --- | --- | --- |
| `periodical` | wikilink | Resolved eagerly in `Collection.js`'s own constructor via `resolve-titles.js` (`resolveNoteTitle()`, throwing), normalized to `[[Basename]]` via `toWikilink()`. Resolved a second time, separately, inside `citation-engine.js`'s Article-specific `resolveCollectionFields()` step for a linked Article's own citation. Set when a Collection (issue) is part of a larger periodical series. |

See [[Collection.js Specification#2. Frontmatter Fields|Collection.js Specification §2]] for `Collection.js`'s full field set — `volume`/`issue` (which describe a Collection's position within its Periodical) also live there.

## 3. Status Field
---

`Periodical.js` uses the existing `catalog-status` property, inherited from `Aggregate.js`. `catalog-status`'s stated scope, "library records, work indexes, ingest-oriented notes", covers an index-of-a-run note like Periodical without stretching the definition. Its vocabulary maps cleanly onto a Periodical's real lifecycle:

- `placeholder`, scaffolded, nothing read yet
- `raw`, minimal data
- `active`, currently being filled out — frontmatter, notes, body
- `processed`, fully filled out, stable, no longer active
- `shelved`, abandoned mid-cataloguing
- `archived` (formally done).

`circulation` is a separate, orthogonal axis describing the real-world publication state—is the actual magazine still being published—independent of `catalog-status`. A periodical can be `circulation: ceased` to denote the magazine folded decades ago while `catalog-status: active` describes you still actively cataloging your back-issues of it.

[[Apparatus Status Taxonomy#6. Mapping by Note Class|Apparatus Status Taxonomy §6]] maps `periodical` → `catalog-status`.

## 4. Body Content
---



## 5. Curator Workflow (source of truth for the Accession design)
---

This workflow drives Accession. For details, see [[#6. Accession]] below, and the [[Accession Specification]].

1. Curator reads an article, decides to catalog it.
2. Is the author already entered? If not, create Author note(s) first.
3. Is the article part of a Collection? If the Collection doesn't exist yet:
   4. Is the Collection part of a Periodical series?
      - Yes: has the Periodical been created yet? If not, create it, then create the Collection.
      - No: create the Collection directly.
5. Once Author, Collection, and (if applicable) Periodical notes exist, create the Work entry (Article, Monograph, etc.).

Everything else trickles upward from new-note creation via Accession — the curator never manually edits an existing note's `authors`/`collections` arrays as part of normal use.

## 6. Accession
---

`Periodical.js` participates in Accession only as a target — it never initiates a push itself. See [[Accession Specification]] for the full mechanism.

- `collections` is populated by a referencing Collection's own `postCreate()` (Accession row 1).
- `authors` is populated by a referencing Work's own `postCreate()`, secondhand via a linked Collection whose own `periodical` field is set (Accession row 6).
- `editors` is never populated via Accession — curator-entered only, same as `Collection.editors`/`translators`.
- Failure behavior follows the shared dedupe/failure model in [[Accession Specification]] §5: a failed push throws and logs rather than failing silently; primary note creation may already have succeeded on disk, requiring manual reconciliation.

## 7. Relational Field Resolution
---

> This section restates resolver semantics. The authoritative source is [[citation]] §2. It is also restated in [[Library Module]] §5 (Object Resolution table), [[Author.js Specification]] §6, [[Collection.js Specification]] §7, and [[Works.js Specification]] §6. Update all of these, including this section, when resolver behavior changes.

All wikilink resolution in this module goes through `resolve-titles.js` (class-agnostic: `resolveNoteTitle`/`resolveNoteTitles`, `resolveNoteLinkLenient`/`resolveNoteLinksLenient`, `toWikilink`) and the shared `TFile` lookup underneath it, `resolve-note-file.js` (`resolveNoteFile`/`resolveNoteFileLenient`).

- `Periodical.editors` is stored as a raw, unresolved wikilink array — no eager resolution in the constructor. Resolution, if this field is ever consumed downstream, is the consumer's responsibility.
- `Collection.periodical` resolves eagerly, in its own constructor, via `resolveNoteTitle()` + `toWikilink()` — throwing on an unresolved link, since it represents a curated relationship asserted at creation time, not a tolerated cross-reference.
- Accession's own pushes resolve `Work.collections` entries, and a resolved Collection's `periodical` field, via `resolveNoteFile()` directly — see [[Accession Specification]] for the full resolution path.
- `Periodical.authors`/`collections` are never resolved as name-parts or titles — both are plain, cascade-populated wikilink arrays with no modal field.

## 8. Modal
---

Location: `.obsidian/apparatus/library/lib/modals/PeriodicalModal.js`, extending `AggregateModal.js`.

Field build order:

1. **Filename**
2. **Category** — `buildCategorySetting()` against `Periodical.categoryOptions()`.
3. **Catalog status** — dropdown, via `AggregateModal.buildCatalogStatusSetting()`.
4. **ISSN** — text field.
5. **Frequency** — dropdown, `FREQUENCY_OPTIONS`.
6. **Active years** — text field.
7. **Circulation** — dropdown, `CIRCULATION_OPTIONS`.
8. **Editors** — via `AggregateModal.buildEditorsSetting()`.
9. **Publisher** / **Place of publication** — via `AggregateModal.buildPublisherFields()`.
10. **Genres** — via `AggregateModal.buildGenresSetting()`.
11. **Filter tag** — text field, placeholder `kebab-case-tag`.
12. Shared affiliations/tags fields, via `super.onOpen()`.

No `authors`/`collections` fields — both cascade-only, per §6.

## 9. Command
---

`library-create-periodical.js` scaffolds this class.

## 10. Companion `.base` File
---

- `library-create-periodical.js` generates `<filename> Issues.base` before creating the Periodical note itself; the note's body embeds it by name.
- Filtered on a curator-entered `filter-tag`, required at submission time.
- `filter-tag` is not a stored property on the Periodical note — it is instantiated in the creation modal, used to build the `.base` file's filter string, then pushed to the `tags` property of the periodical object. The curator is responsible for applying that same tag to each Collection (issue) belonging to the periodical.
- Filter syntax: `file.hasTag("<filter-tag>")` alongside a quoted comparison-expression string, `'class == "collection"'` — `class` is valid shorthand for `note.class` per Obsidian's Bases syntax.

## 11. Open Items
---

- `library-create-periodical.js`'s folder-resolution and companion-`.base`-file generation logic are unverified against the current class hierarchy.
- `issn`/`frequency`/`active-years`/`circulation`'s placement in the field order is an unconfirmed field-by-field mapping, worth a second look during real use.

## 12. Change Log
---

| Date       | Change   |
| ---------- | -------- |
| 2026-08-25 | Added inline cross-reference notes marking duplicated content and where it must also be updated: §1's class-hierarchy statement (restated in Library Module §2 and Author.js/Collection.js/Works.js §1), §7 Relational Field Resolution (restated in Citation Engine Specification §2 and Library Module §5 / Author.js §6 / Collection.js §7 / Works.js §6). No content changed. |
| 2026-08-22 | Renamed §6 from "Cascade Mechanism — `postCreate()`" to "Accession" and trimmed it to a summary of Periodical's own participation, cross-referencing [[Accession Specification]] for the full mechanism. §5 renamed to reference Accession by name in place of the prior generic "cascade mechanism" phrasing. |
| 2026-08-16 | Initial spec: : class shape, folder placement, full frontmatter field set, companion `bibliography.base`, `sorting-spec`. |
| 2026-08-21 | Rearranged content in spec per new [[Apparatus Code Module Specification Template]].                                      |