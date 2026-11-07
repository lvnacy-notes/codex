---
class: archive
category:
  - specification
affiliations:
created: 2026-08-08
modified: 2026-08-22
tags:
---
This document is the authoritative reference for the Library module's `Work`-tier, `Aggregate`-tier, and `Library`-tier property vocabulary: the shared fields on the base `works` template (programmatically, `Work.js`), the distinguishing fields on each of the eleven middle-tier leaf classes, the shared fields on the `Aggregate` tier (`Collection.js`/`Periodical.js`'s common base), the fields on a context library's own root/dashboard note (`Library.js`), the fields on a Collection note (`Collection.js`), and the fields on a Periodical note (`Periodical.js`). It defines each property's type, its resolution mechanism (relational vs. free text), and — where one exists — its controlled vocabulary.

This document is paired with [[Apparatus Module Taxonomy]] and [[Apparatus Status Taxonomy]]. Those documents remain authoritative for `class`, `category`, `affiliations`, and all domain-scoped status properties. This is reiterated in §1. This document does not restate those frameworks.

Relevant code is listed in §13, [[#13. Implementation Mapping|Implementation Mapping]]. Base and middle-tier library code modules will be found in `.obsidian/apparatus/library/lib`. The citation engine is found in `.obsidian/apparatus/library/citation`. All foundational Apparatus code modules will be found in `.obsidian/apparatus/lib`. Paths are provided for specific modules.

## Contents
---

```toc
```

## 1. Purpose and Authority
---

This document ties together active note creation and management within a vault, and the development and use of accompanying programmatic elements. Any code being written to support catalog creation and curation, or in-vault catalog management should refer to this document first.

This document is the normative source for:

- the shared `Work`-tier property model,
- the leaf-specific additions on each Work leaf class,
- the `Aggregate`-tier property model (the shared base for `Collection` and `Periodical`),
- the `Library`-tier property model (the context library's own root/dashboard note),
- the `Collection`-tier property model (a single periodical issue or standalone volume, per `Collection.js`),
- the `Periodical`-tier property model (the standalone note tracking a periodical's run, per `Periodical.js`),
- the classification of each field as relational, controlled vocabulary, or free text,
- the canonical source for controlled vocabularies that are shared across modals.

When a property question arises, the answer should be resolved here before any modal, resolver, or schema-specific implementation is modified.

This document is *not* the normative source for:
- `class`/`category`/`affiliations`; see [[Apparatus Module Taxonomy]] 
- domain status fields; see [[Apparatus Status Taxonomy]] 
- note-level editorial metadata

## 2. Core Rule: How to Classify a Property
---

Every property in this taxonomy falls into exactly one of three kinds:

- Relational: a wikilink or wikilink array pointing to another note. The value is the identity of another note, not a string from a set.
- Controlled vocabulary: a closed, enumerable set of values presented as a dropdown or multi-select in the UI.
- Free text: an open-ended value with no fixed set.

A field is only promoted from free text to controlled vocabulary when the set of values is demonstrably closed. Do not invent vocabulary speculatively.

### Decision rule

1. If the value points to another note, it is relational.
2. If the real-world set is genuinely closed and enumerable, it is a controlled vocabulary.
3. Otherwise it is free text.
4. If the field is an array of repeated values but not a closed set (for example `themes` or `keywords`), it remains free text and should be backed by `ValueSuggest` autocomplete, not a vocabulary.

### Normative interpretation

- Relational fields split into two resolution patterns. A minority (`Work.cites`/`related`/`part-of`, `Collection.periodical`) are resolved eagerly in the object's own constructor via `resolve-titles.js`, so the stored frontmatter value itself is a normalized wikilink. The majority (`authors`/`editors`/`translators` on both `Work.js` and `Aggregate.js`, `Collection.translators`, `Work.collections`, and leaf-specific Work-to-Work/Work-to-Author reference fields such as `parent-work`/`subject-work`/`commissioning-body`) are stored raw and resolved only centrally, inside `citation-engine.js`, at citation-computation time — via `resolve-titles.js` for note-to-note links or `resolve-authors.js` for author name-parts — and that resolution is never written back to the field. A field does not need to be included in a citation to make use of resolver utilities.
- A third pattern applies to relational fields on classes that never touch the citation engine at all: `Periodical.authors`/`editors`/`collections` are stored raw and never resolved anywhere in the module, since `Periodical.js` never calls `computeCitation()`.
- Controlled-vocabulary fields are defined in a single shared source (`library-vocab.js`) and consumed by the relevant modal.
- Free-text fields may still use `ValueSuggest` to improve consistency without forcing a closed list.

## 3. Field Behavior Model
---

Every property in this taxonomy should be interpreted using this model.

| Column | Meaning |
| --- | --- |
| Property | Field name as it appears in the schema |
| Tier | Base Work tier, Aggregate tier, Library tier, Collection tier, Periodical tier, or leaf-tier extension |
| Kind | relational / controlled vocabulary / free text |
| Type | JavaScript or metadata type |
| Resolution | How the value is interpreted or resolved |
| Vocabulary | Canonical values if controlled |
| Required | Whether it is expected to be present |
| Derived | Whether it is generated by the system |

This document follows that model for every defined field.

## 4. Base Work Properties
---

These are the shared properties on the base `works` template, implemented in `Work.js`. `Collection.js` does not extend `Work.js` and does not carry these properties — see §10, Collection-Tier Properties, for Collection's own field set.

| Property | Type | Kind | Resolution | Vocabulary | Required | Derived |
| --- | --- | --- | --- | --- | --- | --- |
| `sort-title` | string | free text | free text; derived automatically from the filename (a leading "a/an/the" stripped) rather than collected in the modal | — | optional | no |
| `authors` | wikilink array | relational | stored raw; resolved to name-parts only inside `citation-engine.js` at citation time via `resolve-authors.js` → Author notes | — | optional | no |
| `editors` | wikilink array | relational | stored raw; resolved to name-parts only inside `citation-engine.js` at citation time via `resolve-authors.js` → Author notes | — | optional | no |
| `translators` | wikilink array | relational | stored raw; resolved to name-parts only inside `citation-engine.js` at citation time via `resolve-authors.js` → Author notes | — | optional | no |
| `year` | string | free text | free text | — | optional | no |
| `collections` | wikilink array | relational | stored raw; resolved unconditionally via `resolveNoteTitles()` (`resolve-titles.js`) inside `citation-engine.js` at citation time, and separately via `resolve-note-file.js` (throwing) inside `Work.js`'s `postCreate()` cascade | — | optional | no |
| `edition` | string | free text | free text | — | optional | no |
| `publisher` | string | free text | free text | — | optional | no |
| `place-of-publication` | string | free text | free text | — | optional | no |
| `citation` | string | derived | generated by citation engine at creation time | n/a | derived | yes |
| `text-source` | string (URL) | free text | free text | — | optional | no |
| `abstract` | string | free text | free text | — | optional | no |
| `catalog-status` | string | controlled vocabulary | dropdown | canonical values in Apparatus Status Taxonomy.md: `raw`, `active`, `processed`, `archived`, `placeholder`, `shelved` | optional | no |
| `date-consumed` | date | free text | free text | — | optional | no |
| `date-cataloged` | date | free text | free text | — | optional | no |
| `date-reviewed` | date | free text | free text | — | optional | no |
| `word-count` | number | free text | free text | — | optional | no |
| `themes` | string array | free text | `ValueSuggest`-backed | open — no fixed list | optional | no |
| `keywords` | string array | free text | `ValueSuggest`-backed | open — no fixed list | optional | no |
| `content-warnings` | string array | controlled vocabulary | multi-select | controlled — see §5 | optional | no |
| `cites` | wikilink array | relational | `resolve-titles.js` (`resolveNoteLinksLenient()`) — resolved eagerly in the constructor to normalized `[[Basename]]` wikilinks; tolerates an unresolvable link by falling back to the raw wikilink text instead of throwing | — | optional | no |
| `related` | wikilink array | relational | `resolve-titles.js` (`resolveNoteLinksLenient()`) — same lenient eager resolution as `cites` | — | optional | no |
| `part-of` | wikilink | relational | `resolve-titles.js` (`resolveNoteLinkLenient()`) — same lenient eager resolution as `cites`/`related`, singular rather than array | — | optional | no |

### Notes

- `citation` is system-generated and should never be authored manually.
- `content-warnings` applies to any `Work` leaf, and a note with no applicable warnings remains an empty array.
- `content-warnings` is never required.
- `cites`/`related`/`part-of` are the only base-tier relational fields resolved eagerly, in `Work.js`'s own constructor — deliberately lenient (never throw) since they're tolerated organizational cross-references, not citation-critical data. Every other relational field on this tier (`authors`/`editors`/`translators`/`collections`) is stored raw and only resolved transiently, inside `citation-engine.js`, when a citation is computed.

## 5. Controlled Vocabulary: `content-warnings`
---

`content-warnings` is the only base-tier controlled vocabulary defined directly in this document. It is grouped by category rather than presented as a flat list, to keep large multi-select choices readable.

This vocabulary is maintained in `library-vocab.js` and wired into `WorksModal.js`.

| Group | Values |
| --- | --- |
| Violence | `violence`, `graphic-violence`, `torture`, `war` |
| Sexual content | `sexual-content`, `sexual-assault` |
| Self-harm | `self-harm`, `suicide` |
| Substance use | `substance-use`, `addiction` |
| Abuse | `domestic-abuse`, `child-abuse` |
| Death and grief | `death`, `grief`, `terminal-illness` |
| Discrimination and hate | `racism`, `homophobia`, `transphobia`, `misogyny`, `antisemitism`, `ableism` |
| Medical and psychological | `medical-content`, `mental-illness`, `eating-disorders` |
| Other disturbing content | `body-horror`, `animal-harm`, `disturbing-imagery` |

### Notes

- This is a controlled vocabulary because the real-world set is intentionally closed and enumerated.
- It is not a generic "tags" field; it is a specific warning taxonomy.
- Empty array is the correct value when no warnings apply.

## 6. Leaf-Tier Controlled Vocabularies (Authoritative)
---

The following leaf-specific vocabularies were previously defined inline in their modal files. This document is now the authoritative source for these values, and the canonical shared definitions should live in `library-vocab.js`.

| Property | Leaf | Values |
| --- | --- | --- |
| `format` | `Record` | `CD`, `vinyl`, `cassette`, `digital file`, `streaming audio`, `streaming video`, `DVD`, `Blu-ray`, `podcast episode`, `radio broadcast`, `television broadcast`, `film` |
| `degree` | `Thesis` | `Doctoral`, `Master's` |

### Rule

The shared vocabulary file should remain synchronized with this taxonomy document so that future changes to allowed values do not drift across modal implementations.

### Notes

This information is duplicated in the [[Works.js Specification]] for ease of references. Updates here should be ported there as well.

## 7. Middle-Tier Leaf Properties
---

Each of the eleven `Work` leaves inherits all `Work`-tier properties from §4. This section covers only the distinguishing properties added by each leaf class. `Collection` is not a `Work` leaf and does not appear here — see §10, Collection-Tier Properties.

| Leaf | Property | Type | Kind | Resolution | Vocabulary |
| --- | --- | --- | --- | --- | --- |
| `Article` | `page-range` | string | free text | free text | — |
| `Chapter` | `parent-work` | wikilink | relational | stored raw; resolved via `resolveNoteTitle()` (`resolve-titles.js`, throwing) inside `citation-engine.js` at citation time, conditionally (only when present) | — |
| `Chapter` | `page-range` | string | free text | free text | — |
| `Entry` | `reference-work` | wikilink | relational | stored raw; resolved via `resolveNoteTitle()` (`resolve-titles.js`, throwing) inside `citation-engine.js` at citation time, conditionally (only when present) | — |
| `Entry` | `entry-term` | string | free text | free text | — |
| `Essay` | *(none)* | — | — | — | — |
| `Interview` | `interviewer` | wikilink array | relational | `resolve-authors.js` → Author notes | — |
| `Interview` | `interviewee` | wikilink array | relational | `resolve-authors.js` → Author notes | — |
| `Lecture` | `event` | wikilink or string | relational or free text | relational when bracketed via `resolveOptionalNoteTitle()`; otherwise free text | — |
| `Lecture` | `delivery-date` | date | free text | free text | — |
| `Monograph` | `isbn` | string | free text | free text | — |
| `Record` | `format` | string | controlled vocabulary | dropdown | controlled — see §6 |
| `Record` | `duration` | string | free text | free text | — |
| `Report` | `commissioning-body` | wikilink | relational | stored raw; resolved via `resolveNoteTitle()` (`resolve-titles.js`, throwing) inside `citation-engine.js` at citation time, conditionally (only when present) | — |
| `Report` | `report-number` | string | free text | free text | — |
| `Review` | `subject-work` | wikilink | relational | stored raw; resolved via `resolveNoteTitle()` (`resolve-titles.js`, throwing) inside `citation-engine.js` at citation time, conditionally (only when present) | — |
| `Thesis` | `institution` | wikilink | relational | stored raw; resolved via `resolveNoteTitle()` (`resolve-titles.js`, throwing) inside `citation-engine.js` at citation time, conditionally (only when present) | — |
| `Thesis` | `degree` | string | controlled vocabulary | dropdown | controlled — see §6 |
| `Thesis` | `advisor` | wikilink | relational | stored raw; **never resolved** — deliberately excluded from the `fields` object passed to `computeCitation()`, since no style manual prints an advisor's name in a thesis citation. Captured for reference only. | — |

### Notes

- `Lecture.event` is a mixed case: if the field contains a bracketed title that resolves to a work, it is treated relationally; otherwise it remains free text.
- The leaf-specific vocabulary values are not repeated across separate modal files; they should be pulled from the central vocabulary source.
- `Article` carries no `volume`/`issue`/`periodical` fields of its own. When `citation-engine.js` computes an Article's citation, it resolves `volume`/`issue`/`periodical` from the Article's linked Collection note via `resolveCollectionFields()` — see §13.2. This avoids re-entering identical issue data on every Article drawn from the same issue.
- Confirmed directly against `citation-engine.js`: `parent-work`/`reference-work`/`commissioning-body`/`subject-work`/`institution` each resolve via the singular, throwing `resolveNoteTitle()`, wrapped in a presence check (`...(fields.x ? {...} : {})`) so an absent field doesn't throw; `collections` resolves via `resolveNoteTitles()` unconditionally, relying on that function's own `?? []` fallback for an absent/empty array rather than a presence check.
- Distinguishing leaves properties and their resolution is duplicated in [[Works.js Specification#9. Leaves|§9]]  of the [[Works.js Specification]] for ease of references. Updates here should be ported there as well.

## 8. Library-Tier Properties
---

These are the properties on a context library's own root/dashboard note, implemented in `Library.js`. Unlike `Work`-tier properties, these describe the library itself, not an individual cataloged work — there is exactly one `Library` note per context library.

| Property | Kind | Type | Resolution | Vocabulary | Required | Derived |
| --- | --- | --- | --- | --- | --- | --- |
| `library-name` | free text | string | free text | — | optional | no |
| `library-tag` | free text | string | free text; auto-stamped into every new note's `tags` array by `library-create-*` commands, not just this note's own | — | optional | no |
| `library-status` | controlled vocabulary | string | dropdown | canonical values in Apparatus Status Taxonomy.md: `unbound`, `active`, `dormant`, `musty`, `archived` | optional | no |
| `citation-style` | controlled vocabulary | string | dropdown, options derived from `citation-engine.js`'s exported `FORMATTERS` keys | `mla`, `apa`, `chicago-author-date` | required | no |
| `works-folder-name` | free text | string | free text; falls back to `works` when blank | — | optional | no |
| `sorting-spec` | derived | string (multi-line) | generated by `library-create-library.js` after note creation, pushed via `processFrontMatter` | n/a | derived | yes |
| `domain` | free text | string | free text | — | optional | no |
| `genres` | free text | string array | free text | — | optional | no |
| `tone` | free text | string array | free text | — | optional | no |
| `period` | free text | string | free text | — | optional | no |

### Notes

- `citation-style` is required: `Work.resolveCitationStyle()` throws if the enclosing library's root note lacks it.
- `sorting-spec` should never be authored manually — it is pushed into frontmatter by `library-create-library.js` after the note is created, not collected via the modal.
- `library-tag` matters beyond the Library note itself: it is the value every `library-create-*` command stamps into new notes' `tags`, and the value `bibliography.base` filters on.
- `library-status`'s `dormant` value is reachable only from `active`, never directly from `unbound` — see Apparatus Status Taxonomy.md.
- `class`, `category`, `affiliations`, `created`, `modified` are standard on every Apparatus note/object via `BaseClass` and apply unchanged; `categoryOptions()` is `null` (free text) for `Library.js` — the Domain & Vibe fields (`domain`/`genres`/`tone`/`period`) cover library-specific categorization instead.

## 9. Aggregate-Tier Properties
---

`Aggregate.js` is the shared middle tier for Library classes that aggregate other Work notes under one bibliographic identity — `Collection.js` and `Periodical.js` are its two subclasses. It extends `BaseClass` directly, a sibling of `Work.js`/`Library.js`/`Author.js`. Its `resolveFolder()` targets the library's fixed `collections/` folder, inherited unchanged by both subclasses.

| Property | Kind | Type | Resolution | Vocabulary | Required | Derived |
| --- | --- | --- | --- | --- | --- | --- |
| `authors` | relational | wikilink array | stored raw; cascade-only — populated after creation by a contained Work's own `postCreate()` hook, never entered directly in either subclass's modal. Resolved to name-parts via `resolve-authors.js` only when the owning note computes a citation (`Collection`, when not a periodical issue) — never resolved on `Periodical`, which never computes a citation. | — | optional | no |
| `editors` | relational | wikilink array | stored raw. Resolved the same way `authors` is: only when the owning note (`Collection`) computes a citation; never resolved on `Periodical`. | — | optional | no |
| `publisher` | free text | string | free text | — | optional | no |
| `place-of-publication` | free text | string | free text | — | optional | no |
| `genres` | free text | string array | `ValueSuggest`-backed | open — no fixed list | optional | no |
| `catalog-status` | controlled vocabulary | string | dropdown | canonical values in Apparatus Status Taxonomy.md: `raw`, `active`, `processed`, `archived`, `placeholder`, `shelved` | optional | no |

### Notes

- No `authors` field exists in `AggregateModal.js` — the shared modal tier for `Collection`/`Periodical` — since the field is cascade-only on every subclass.
- `AggregateModal.js` provides per-field builder methods (`buildCatalogStatusSetting`, `buildEditorsSetting`, `buildPublisherFields`, `buildGenresSetting`) that `CollectionModal.js`/`PeriodicalModal.js` call individually, interleaved with each subclass's own leaf-specific fields, since the two order their frontmatter differently.
- `Aggregate.js` carries no `citation` field and no citation-generation logic. `Collection.js` computes its own citation directly via `citation-engine.js`'s standalone `computeCitation()` export; `Periodical.js` never computes one.

## 10. Collection-Tier Properties
---

These are the properties on a Collection note, implemented in `Collection.js`. `Collection.js` extends `Aggregate.js` (see §9), not `Work.js` — it does not carry any Work-tier property from §4. A Collection represents either a single periodical issue (when `periodical` is set) or a standalone authored/edited volume — anthology, essay collection, festschrift. Collection notes live in the library's fixed `collections/` folder, alongside the Periodical notes that may track them.

| Property | Kind | Type | Resolution | Vocabulary | Required | Derived |
| --- | --- | --- | --- | --- | --- | --- |
| `sort-title` | free text | string | free text; collected directly in the modal, not auto-derived from the filename | — | optional | no |
| `short-name` | free text | string | free text | — | optional | no |
| `catalog-status` | controlled vocabulary | string | inherited from `Aggregate.js` — see §9 | canonical values in Apparatus Status Taxonomy.md | optional | no |
| `date-cataloged` | free text | date | free text | — | optional | no |
| `year` | free text | string | free text | — | optional | no |
| `periodical` | relational | wikilink | `resolve-titles.js` (`resolveNoteTitle()`, throwing) — resolved eagerly in the constructor, normalized to `[[Basename]]` via `toWikilink()`. Resolved again, separately, inside `citation-engine.js`'s `generateCitation()` for Collection's own citation, and a third time inside `resolveCollectionFields()` when a linked Article computes its own citation. | — | optional | no |
| `volume` | free text | string | free text; meaningful only when `periodical` is set | — | optional | no |
| `issue` | free text | string | free text; meaningful only when `periodical` is set | — | optional | no |
| `authors` | relational | wikilink array | inherited from `Aggregate.js` — see §9 | — | optional | no |
| `editors` | relational | wikilink array | inherited from `Aggregate.js` — see §9 | — | optional | no |
| `translators` | relational | wikilink array | stored raw; resolved to name-parts via `resolve-authors.js` only when Collection computes a citation (i.e. `periodical` unset) | — | optional | no |
| `works` | relational | wikilink array | stored raw; cascade-only via Accession — see [[Accession Specification]]. Holds every Work note that lists this Collection in its own `collections` field. No modal field. | — | optional | no |
| `publisher` | free text | string | inherited from `Aggregate.js` — see §9 | — | optional | no |
| `place-of-publication` | free text | string | inherited from `Aggregate.js` — see §9 | — | optional | no |
| `citation` | derived | string | generated at creation time via `citation-engine.js`'s standalone `computeCitation()`, called directly from `Collection.js`'s constructor. Empty when `periodical` is set — a periodical issue is not an independently citable unit in MLA, APA, or Chicago; only the article within it is. The key is always declared, even when empty, so every Collection note's frontmatter shape stays uniform. | n/a | derived | yes |
| `source` | free text | string (URL) | free text | — | optional | no |
| `cover` | free text | string | free text — a wikilink to an in-vault image, or a URL, stored as entered; never resolved as a wikilink | — | optional | no |
| `cover-card` | relational | wikilink | stored raw; no `expectedClass` restriction and no resolution — intended to reference a future `class: image` note, which does not yet exist | — | optional | no |
| `genres` | free text | string array | inherited from `Aggregate.js` — see §9 | — | optional | no |
| `themes` | free text | string array | `ValueSuggest`-backed | open — no fixed list | optional | no |
| `keywords` | free text | string array | `ValueSuggest`-backed | open — no fixed list | optional | no |
| `content-warnings` | controlled vocabulary | string array | multi-select | controlled — see §5 | optional | no |

### Notes

- `categoryOptions()` returns a closed vocabulary: `anthology`, `essay-collection`, `fiction`, `poetry`, `festschrift`.
- Collection carries no `edition`, `abstract`, `text-source`, `word-count`, `date-reviewed`, `cites`, `related`, or `part-of` — these are Work-tier fields Collection does not inherit. `contained-works` is not a stored field either; a Collection's contents are surfaced via a Dataview query in the note body.
- `class`, `category`, `affiliations`, `created`, `modified`, `tags` are standard via `BaseClass`.
- Full field order in generated frontmatter: `class`, `category`, `affiliations`, `sort-title`, `short-name`, `catalog-status`, `created`, `modified`, `date-cataloged`, `year`, `periodical`, `volume`, `issue`, `authors`, `editors`, `translators`, `works`, `publisher`, `place-of-publication`, `citation`, `source`, `cover`, `cover-card`, `genres`, `themes`, `keywords`, `content-warnings`, `tags`.

## 11. Periodical-Tier Properties
---

These are the properties on a Periodical note, implemented in `Periodical.js`. `Periodical.js` extends `Aggregate.js` (see §9) — a sibling of `Work.js`/`Library.js`/`Author.js` by way of `Aggregate.js`, not a `Work` leaf — and never touches the citation engine, so it carries no `citation` field. A Periodical tracks an entire periodical's run (title → issue → piece), one level above `Collection`; its notes live in the library's fixed `collections/` folder, not a dedicated `periodicals/` folder.

| Property | Kind | Type | Resolution | Vocabulary | Required | Derived |
| --- | --- | --- | --- | --- | --- | --- |
| `catalog-status` | controlled vocabulary | string | inherited from `Aggregate.js` — see §9 | canonical values in Apparatus Status Taxonomy.md | optional | no |
| `issn` | free text | string | free text | — | optional | no |
| `frequency` | controlled vocabulary | string | dropdown | `daily`, `semiweekly`, `weekly`, `fortnightly`, `monthly`, `bimonthly`, `quarterly`, `semiannual`, `annual`, `biennial`, `irregular` | optional | no |
| `active-years` | free text | string | free text | — | optional | no |
| `circulation` | controlled vocabulary | string | dropdown | `active`, `hiatus`, `ceased` | optional | no |
| `authors` | relational | wikilink array | inherited from `Aggregate.js` — see §9. Never resolved — Periodical never computes a citation. | — | optional | no |
| `collections` | relational | wikilink array | stored raw; not resolved or collected at creation — populated after creation by `Collection.js`'s own `postCreate()`. Never resolved elsewhere. | — | optional | no |
| `editors` | relational | wikilink array | inherited from `Aggregate.js` — see §9. Never resolved — Periodical never computes a citation. | — | optional | no |
| `publisher` | free text | string | inherited from `Aggregate.js` — see §9 | — | optional | no |
| `place-of-publication` | free text | string | inherited from `Aggregate.js` — see §9 | — | optional | no |
| `genres` | free text | string array | inherited from `Aggregate.js` — see §9 | — | optional | no |

### Notes

- `authors`/`collections` are the only cascade-only fields unique to Periodical among the properties above — `PeriodicalModal.js` has no fields for either, since both start empty at creation time per the curator workflow (a Periodical is created before the Collection/Work notes that will populate it).
- `catalog-status` is reused as-is from the base-tier vocabulary rather than a new domain-scoped status; see Apparatus Status Taxonomy.md §6, which maps `periodical` → `catalog-status`.
- `circulation` is orthogonal to `catalog-status`: `circulation` tracks the real-world publication's own state (still running, on hiatus, folded), while `catalog-status` tracks the curator's own cataloging progress on it. The two can diverge freely — a `circulation: ceased` periodical can still be `catalog-status: active` while its back issues are being cataloged.
- `class`, `category`, `affiliations`, `created`, `modified`, `tags` are standard via `BaseClass`; `categoryOptions()` returns a closed vocabulary: `pulp-magazine`, `literary-magazine`, `trade-journal`, `academic-journal`, `opinion-journal`, `fanzine`, `webzine`, `newsletter`, `newspaper`, `digest`, `magazine`.
- A companion `.base` file (`<filename> Issues.base`) is generated at creation by `library-create-periodical.js`, filtered on a curator-entered `filter-tag`. Unlike `Library.js`'s `library-tag`, `filter-tag` is explicitly not a stored property on the Periodical note — it exists only in the creation modal, used once to build the `.base` file's filter string.
- Full field order in generated frontmatter: `class, category, affiliations, catalog-status, created, modified, issn, frequency, active-years, circulation, authors, collections, editors, publisher, place-of-publication, genres, tags`.

## 12. Master Property Index
---

This index provides a single reference to all categories of library metadata.

### Base-tier properties

- `sort-title`
- `authors`
- `editors`
- `translators`
- `year`
- `collections`
- `edition`
- `publisher`
- `place-of-publication`
- `citation`
- `text-source`
- `abstract`
- `catalog-status`
- `date-consumed`
- `date-cataloged`
- `date-reviewed`
- `word-count`
- `themes`
- `keywords`
- `content-warnings`

### Aggregate-tier properties

- `authors`
- `editors`
- `publisher`
- `place-of-publication`
- `genres`
- `catalog-status`

### Library-tier properties

- `library-name`
- `library-tag`
- `library-status`
- `citation-style`
- `works-folder-name`
- `sorting-spec`
- `domain`
- `genres`
- `tone`
- `period`

### Collection-tier properties

- `sort-title`
- `short-name`
- `catalog-status` *(inherited from Aggregate)*
- `date-cataloged`
- `year`
- `periodical`
- `volume`
- `issue`
- `authors` *(inherited from Aggregate)*
- `editors` *(inherited from Aggregate)*
- `translators`
- `works`
- `publisher` *(inherited from Aggregate)*
- `place-of-publication` *(inherited from Aggregate)*
- `citation`
- `source`
- `cover`
- `cover-card`
- `genres` *(inherited from Aggregate)*
- `themes`
- `keywords`
- `content-warnings`

### Periodical-tier properties

- `catalog-status` *(inherited from Aggregate)*
- `issn`
- `frequency`
- `active-years`
- `circulation`
- `authors` *(inherited from Aggregate)*
- `collections`
- `editors` *(inherited from Aggregate)*
- `publisher` *(inherited from Aggregate)*
- `place-of-publication` *(inherited from Aggregate)*
- `genres` *(inherited from Aggregate)*

### Middle-tier leaf additions

- `Article`: `page-range`
- `Chapter`: `parent-work`, `page-range`
- `Entry`: `reference-work`, `entry-term`
- `Essay`: none
- `Interview`: `interviewer`, `interviewee`
- `Lecture`: `event`, `delivery-date`
- `Monograph`: `isbn`
- `Record`: `format`, `duration`
- `Report`: `commissioning-body`, `report-number`
- `Review`: `subject-work`
- `Thesis`: `institution`, `degree`, `advisor`

### Canonical controlled vocabularies

- `catalog-status` — defined in [[Apparatus Status Taxonomy]]
- `library-status` — defined in [[Apparatus Status Taxonomy]]
- `citation-style` — defined here in §8, derived from `citation-engine.js`'s `FORMATTERS` keys
- `content-warnings` — defined here in §5
- `Record.format` — defined here in §6
- `Thesis.degree` — defined here in §6
- `Periodical.frequency` — defined here in §11, canonical source `library-vocab.js` (`FREQUENCY_OPTIONS`)
- `Periodical.circulation` — defined here in §11, canonical source `library-vocab.js` (`CIRCULATION_OPTIONS`)

## 13. Implementation Mapping
---

This section is the implementation map: it tells you where each part of the taxonomy is defined in code, and where the relevant logic lives in the working Library module.

### 13.1 Base schema and object model

| Taxonomy area | Code module | Location | Purpose |
| --- | --- | --- | --- |
| Base `Work` schema | `Work.js` | `.obsidian/apparatus/library/lib/objects/Work.js` | Defines the shared `Work`-tier fields and default behaviors for all Library notes. |
| Base `Author` schema | `Author.js` | `.obsidian/apparatus/library/lib/objects/Author.js` | Represents author notes resolved via `resolve-authors.js`. |
| Base `Aggregate` schema | `Aggregate.js` | `.obsidian/apparatus/library/lib/objects/Aggregate.js` | Shared middle tier for `Collection`/`Periodical` — see §9. |
| Leaf model classes | `Article.js`, `Chapter.js`, `Entry.js`, `Essay.js`, `Interview.js`, `Lecture.js`, `Monograph.js`, `Record.js`, `Report.js`, `Review.js`, `Thesis.js` | `.obsidian/apparatus/library/lib/objects/` | Define each leaf's distinguishing property set and inheritance from `Work`. |

### 13.2 Relationship resolution and citation logic

| Taxonomy area | Code module | Location | Purpose |
| --- | --- | --- | --- |
| Author resolution | `resolve-authors.js` | `.obsidian/apparatus/library/lib/controls/resolve-authors.js` | Resolves `authors`, `editors`, `translators`, and related author-link fields to name-parts, at citation time — for both `Work`-tier and `Aggregate`-tier (Collection) fields. |
| Title/link resolution | `resolve-titles.js` | `.obsidian/apparatus/library/lib/controls/resolve-titles.js` | Class-agnostic wikilink resolution (`resolveNoteTitle`/`resolveNoteTitles`, `resolveNoteLinkLenient`/`resolveNoteLinksLenient`, `resolveOptionalNoteTitle`, `toWikilink`). Resolves `Work.cites`/`related`/`part-of` and `Collection.periodical`; also used inside `resolveCollectionFields()` to resolve the nested periodical link it reads off a Collection note. |
| Collection-field resolution | `resolve-collection-fields.js` | `.obsidian/apparatus/library/lib/controls/resolve-collection-fields.js` | Resolves a linked Collection note's `periodical`/`volume`/`issue` fields for an Article's own citation. Used by `citation-engine.js`, keyed on `leafClass === 'article'`. |
| Note-file lookup | `resolve-note-file.js` | `.obsidian/apparatus/library/lib/controls/resolve-note-file.js` | Shared `resolveNoteFile`/`resolveNoteFileLenient` core underneath every resolver in this directory, and the cascade's own `postCreate()` lookups. |
| Citation engine | `citation-engine.js` | `.obsidian/apparatus/library/citation/citation-engine.js` | Generates `citation` for a note and coordinates the resolution logic used by the Library module. Exports `FORMATTERS` (the source of truth for `citation-style` options), plus standalone `resolveCitationStyle()` and `computeCitation()` functions callable independently of any class hierarchy — `Work.js`'s own `computeCitation()` instance method delegates to the latter; `Collection.js` calls it directly. |

### 13.3 Shared UI controls and free-text input behavior

| Taxonomy area | Code module | Location | Purpose |
| --- | --- | --- | --- |
| Autocomplete control | `ValueSuggest.js` | `.obsidian/apparatus/lib/controls/ValueSuggest.js` | Backing control for free-text arrays such as `themes` and `keywords` when they use vault-backed suggestions rather than a closed vocabulary. |
| Controls export index | `index.js` | `.obsidian/apparatus/lib/controls/index.js` | Re-exports `ValueSuggest` and other shared control modules. |
| Shared modal base | `BaseModal.js` | `.obsidian/apparatus/lib/modals/BaseModal.js` | Common modal primitives used by the Library module. |

### 13.4 Shared vocabulary definitions

| Taxonomy area | Code module | Location | Purpose |
| --- | --- | --- | --- |
| Base and leaf vocabularies | `library-vocab.js` | `.obsidian/apparatus/library/lib/controls/library-vocab.js` | Canonical source for controlled-vocabulary options such as `content-warnings`, `Record.format`, `Thesis.degree`, `CITATION_STYLE_OPTIONS`, `LIBRARY_STATUS_OPTIONS`, `FREQUENCY_OPTIONS`, and `CIRCULATION_OPTIONS`. |
| Work modal wiring | `WorksModal.js` | `.obsidian/apparatus/library/lib/modals/WorksModal.js` | Defines shared modal behavior for all `Work`-tier fields and binds the shared controlled vocabularies. |
| Record modal | `RecordModal.js` | `.obsidian/apparatus/library/lib/modals/RecordModal.js` | Pulls `RECORD_FORMAT_OPTIONS` from `library-vocab.js` and renders the `format` field. |
| Thesis modal | `ThesisModal.js` | `.obsidian/apparatus/library/lib/modals/ThesisModal.js` | Pulls `THESIS_DEGREE_OPTIONS` from `library-vocab.js` and renders the `degree` field. |

### 13.5 Leaf modal coverage

| Leaf | Modal file | Location |
| --- | --- | --- |
| `Article` | `ArticleModal.js` | `.obsidian/apparatus/library/lib/modals/ArticleModal.js` |
| `Chapter` | `ChapterModal.js` | `.obsidian/apparatus/library/lib/modals/ChapterModal.js` |
| `Entry` | `EntryModal.js` | `.obsidian/apparatus/library/lib/modals/EntryModal.js` |
| `Essay` | `EssayModal.js` | `.obsidian/apparatus/library/lib/modals/EssayModal.js` |
| `Interview` | `InterviewModal.js` | `.obsidian/apparatus/library/lib/modals/InterviewModal.js` |
| `Lecture` | `LectureModal.js` | `.obsidian/apparatus/library/lib/modals/LectureModal.js` |
| `Monograph` | `MonographModal.js` | `.obsidian/apparatus/library/lib/modals/MonographModal.js` |
| `Record` | `RecordModal.js` | `.obsidian/apparatus/library/lib/modals/RecordModal.js` |
| `Report` | `ReportModal.js` | `.obsidian/apparatus/library/lib/modals/ReportModal.js` |
| `Review` | `ReviewModal.js` | `.obsidian/apparatus/library/lib/modals/ReviewModal.js` |
| `Thesis` | `ThesisModal.js` | `.obsidian/apparatus/library/lib/modals/ThesisModal.js` |

### 13.6 Implementation rule

The code locations above are intended to be read as the authoritative implementation map for this taxonomy. When a property definition, vocabulary, or resolution behavior is questioned, the place to verify it is:

1. the schema object in `.obsidian/apparatus/library/lib/objects/`,
2. the modal in `.obsidian/apparatus/library/lib/modals/`,
3. the shared vocabulary source in `.obsidian/apparatus/library/lib/controls/library-vocab.js`,
4. the resolver in `.obsidian/apparatus/library/citation/` or `.obsidian/apparatus/library/lib/controls/`,
5. the shared UI control in `.obsidian/apparatus/lib/controls/ValueSuggest.js`.

This structure keeps the taxonomy document normative while still grounding each rule in the exact code modules that implement it.

### 13.7 Aggregate-tier implementation

| Taxonomy area | Code module | Location | Purpose |
| --- | --- | --- | --- |
| Aggregate modal | `AggregateModal.js` | `.obsidian/apparatus/library/lib/modals/AggregateModal.js` | Shared modal field builders for `Collection`/`Periodical`'s inherited fields (`buildCatalogStatusSetting`, `buildEditorsSetting`, `buildPublisherFields`, `buildGenresSetting`). No builder for `authors` — cascade-only on every subclass. |

### 13.8 Library-tier implementation

| Taxonomy area | Code module | Location | Purpose |
| --- | --- | --- | --- |
| Library schema | `Library.js` | `.obsidian/apparatus/library/lib/objects/Library.js` | Defines the Library root/dashboard note's property set and body generation. |
| Library modal | `LibraryModal.js` | `.obsidian/apparatus/library/lib/modals/LibraryModal.js` | Renders the Library-tier property fields at creation time. |
| Library creation command | `library-create-library.js` | `.obsidian/commands/library-create-library.js` | Scaffolds folder structure, generates `bibliography.base` scoped to `library-tag`, and pushes `sorting-spec` after the Library note is created. |

### 13.9 Collection-tier implementation

| Taxonomy area | Code module | Location | Purpose |
| --- | --- | --- | --- |
| Collection schema | `Collection.js` | `.obsidian/apparatus/library/lib/objects/Collection.js` | Extends `Aggregate.js`. Defines Collection's own fields and computes its own citation directly via `citation-engine.js`'s `computeCitation()`. |
| Collection modal | `CollectionModal.js` | `.obsidian/apparatus/library/lib/modals/CollectionModal.js` | Extends `AggregateModal.js`. Renders Collection's full field set at creation time. |
| Collection creation command | `library-create-collection.js` | `.obsidian/commands/library-create-collection.js` | Resolves the target folder via `Collection.resolveFolder()` (inherited from `Aggregate.js`), validates `year` is present, then creates the Collection note. |

### 13.10 Periodical-tier implementation

| Taxonomy area | Code module | Location | Purpose |
| --- | --- | --- | --- |
| Periodical schema | `Periodical.js` | `.obsidian/apparatus/library/lib/objects/Periodical.js` | Extends `Aggregate.js`. Defines Periodical's own fields (`collections`, `issn`, `frequency`, `active-years`, `circulation`) on top of the inherited Aggregate fields. Never touches the citation engine. |
| Periodical modal | `PeriodicalModal.js` | `.obsidian/apparatus/library/lib/modals/PeriodicalModal.js` | Extends `AggregateModal.js`. `authors`/`collections` have no modal fields — both are cascade-populated. |
| Periodical creation command | `library-create-periodical.js` | `.obsidian/commands/library-create-periodical.js` | Resolves the target folder via `Periodical.resolveFolder()` (inherited from `Aggregate.js`), generates `<filename> Issues.base` from the modal's `filter-tag`, then creates the Periodical note. |
| Cascade helper | `append-to-frontmatter-array.js` | `.obsidian/apparatus/library/lib/controls/append-to-frontmatter-array.js` | Shared string-diff append used by `Work.js`'s and `Collection.js`'s `postCreate()` overrides to populate `authors` on Collection/Periodical notes, and `collections` on Periodical notes. |

## 14. Cross-Reference Summary
---

The complete Library metadata grammar is assembled from three sources:

- [Apparatus Module Taxonomy.md](Apparatus%20Module%20Taxonomy.md): class, category, and affiliations
- [Apparatus Status Taxonomy.md](Apparatus%20Status%20Taxonomy.md): canonical status values
- this document: all other Work-tier, Aggregate-tier, Library-tier, Collection-tier, Periodical-tier, and leaf-tier metadata properties, their resolution model, and their vocabularies

Together these define the complete metadata language for the Library module.

## 15. Change Log
---

| Date | Change |
| --- | --- |
| 2026-08-22 | Added `works` (Collection-tier) to §10's field table and field-order note, and to the Master Property Index, per the Accession augmentation defined in [[Accession Specification]]. |
| 2026-08-20 | Realigned to the Collection Hierarchy Correction: removed `Collection` from §4/§7 (no longer a `Work` leaf) and from the eleven-leaf count throughout; added §9 Aggregate-Tier Properties (new shared tier for Collection/Periodical) and §10 Collection-Tier Properties (Collection's own full field set, previously undocumented as a standalone tier); renumbered Periodical-Tier Properties to §11 and updated it to reflect Periodical's `Aggregate.js` inheritance (`authors`/`editors`/`publisher`/`place-of-publication`/`genres`/`catalog-status` now inherited, not independently implemented; `editors` no longer eagerly resolved — stored raw, matching module convention); updated Article's leaf-tier row to remove `volume`/`issue` (moved to Collection) and note the `resolveCollectionFields()` sourcing; added `resolve-collection-fields.js` to §13.2 and updated the citation-engine.js row for its new standalone `resolveCitationStyle()`/`computeCitation()` exports; added §13.7 Aggregate-tier implementation and §13.9 Collection-tier implementation; renumbered Library-tier implementation to §13.8 and Periodical-tier implementation to §13.10, both updated for the `Aggregate.js`/`AggregateModal.js` inheritance; updated Master Property Index and Cross-Reference Summary for the new tiers throughout. |
| 2026-08-18 | Verified §7's resolver citations directly against `citation-engine.js`, `Chapter.js`, `Entry.js`, `Review.js`, `Thesis.js`, `Report.js` (previous pass had inferred these from `resolve-titles.js`'s own header comment and the resolver-handoff doc, not from the files themselves). Corrected one inference that didn't hold: `Thesis.advisor` is never resolved at all — deliberately excluded from `computeCitation()`'s `fields` object — not resolved via `resolve-titles.js` at citation time the way `institution` is. Confirmed the other five leaf-tier reference fields resolve exactly as previously written, and added the conditional-vs-unconditional distinction between `resolveNoteTitle()`/`resolveNoteTitles()`'s presence-checked leaf fields and `collections`'s unconditional resolution. |
| 2026-08-18 | Patched drift predating the Periodical work: removed every stale `resolve-works.js` citation (§2, §4, §7, §11.1, §11.2 — the module was deleted) in favor of `resolve-titles.js`/citation-engine.js's centralized resolution pattern; corrected §4's `authors`/`editors`/`translators`/`collections` rows to reflect that they're stored raw and resolved only transiently at citation time, not eagerly; added the previously-missing `cites`/`related`/`part-of` rows to §4 (added to `Work.js` in an earlier session, never reflected here); renamed `resolveOptionalWorkTitle()` to `resolveOptionalNoteTitle()` in §11.2. The exact current import names inside `citation-engine.js` itself were not directly verified against that file — see the caveat note at the end of §7. |
| 2026-08-18 | Added §9, Periodical-Tier Properties, documenting `Periodical.js`'s eleven fields (`authors`/`collections` cascade-only, `editors` eagerly resolved via `resolve-titles.js`). Added `Collection.periodical` to §7. Renumbered Master Property Index, Implementation Mapping, Cross-Reference Summary, and Change Log accordingly (§9→10, §10→11, §11→12, §12→13). Added §11.8, Periodical-tier implementation mapping, and a `resolve-titles.js`/`resolve-note-file.js` row to §11.2. Widened the document's stated scope (intro paragraph, §1) to include the Periodical tier. |
| 2026-08-16 | Added §8, Library-Tier Properties, documenting `Library.js`'s ten fields. Renumbered Master Property Index, Implementation Mapping, Cross-Reference Summary, and Change Log accordingly (§8→9, §9→10, §10→11, §11→12). Widened the document's stated scope (intro paragraph, §1) to include the Library tier. Added §10.7, Library-tier implementation mapping. |
| 2026-08-14 | Revised draft of the taxonomy document. Reorganized the structure to emphasize classification rules, canonical property model, master index, and implementation mapping. Preserved content while reducing drift risk and improving maintainability. |
| 2026-08-08 | Initial draft. Documented all `Work.js` base-tier and twelve-leaf distinguishing properties. Promoted `Record.format` and `Thesis.degree` from inline modal vocabularies to the authority document. Proposed a `content-warnings` controlled vocabulary. |