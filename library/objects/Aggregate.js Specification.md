---
class: archive
category:
  - specification
affiliations:
created: 2026-08-28
modified: 2026-08-28
object: Aggregate.js
modal: AggregateModal.js
context:
  - "[[Apparatus Library Property Taxonomy]]"
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[Accession Specification]]"
  - "[[Collection.js Specification]]"
  - "[[Periodical.js Specification]]"
tags:
---
Spec for `Aggregate.js`.

## Contents
---

```toc
```

## 1. Scope and Class Shape
---

> The class-hierarchy statement below restates [[Library Module]] §2, Class Hierarchy, which is authoritative. It is also restated in [[Author.js Specification]] §1, [[Collection.js Specification]] §1, [[Periodical.js Specification]] §1, and [[Works.js Specification]] §1. Update all of these, including this section, when the hierarchy changes.

- `Aggregate.js` extends `BaseClass` directly, sibling to `Works.js`/`Library.js`/`Author.js`.
- Abstract middle tier shared by the Library classes that aggregate other Works notes under one bibliographic identity: `Collection.js` and `Periodical.js`. No object is ever instantiated from `Aggregate.js` directly.
- Owns the fields and folder-resolution logic common to both subclasses; leaf-specific fields, category vocabularies, citation behavior, and body content are defined per subclass.
- Carries no static `classValue` of its own — each subclass sets its own.
- `categoryOptions()` is not overridden — inherits `BaseClass`'s `null` default. Not meaningful in practice, since `Aggregate.js` is never instantiated directly; each subclass defines its own closed category vocabulary.
- `Aggregate.resolveFolder(app)` is a static override: resolves the enclosing library's fixed `collections/` folder via `resolveLibraryFolder`, from the active file's location. Throws if the active file isn't inside a library. Inherited unchanged by both `Collection.js` and `Periodical.js` — a Collection and the Periodical it belongs to (if any) live side by side in the same folder.
- Carries no citation field and no citation-generation logic. Citation behavior is entirely subclass-determined: `Collection.js` computes its own citation directly via `citation-engine.js`'s standalone `computeCitation()`; `Periodical.js` never computes one.

## 2. Frontmatter Fields
---

**Fields contributed by `Aggregate.js`** (returned by `aggregateFrontmatterFields()`; spliced by each subclass into its own `getFrontmatterFields()` output — see [[Collection.js Specification]] §2 and [[Periodical.js Specification]] §2 for each subclass's full field order):

| Field | Type | Notes |
| --- | --- | --- |
| `authors` | wikilink array | Cascade-only via Accession — populated after creation by a contained Works note's own `postCreate()` hook. No modal field on either subclass. |
| `editors` | wikilink array | Relational, modal field on both subclasses via `AggregateModal.buildEditorsSetting()`. Stored raw; resolution, where it happens at all, is deferred to the consuming subclass. |
| `publisher` | string | Free text. |
| `place-of-publication` | string | Free text. |
| `genres` | string array | Free text, `ValueSuggest`-backed. |
| `catalog-status` | string | Controlled vocabulary — see §3. |

`aggregateFrontmatterFields()` returns the six fields above in this fixed order. It is not, by itself, the full frontmatter field order for either subclass — `Collection.js` and `Periodical.js` each splice `baseFrontmatterFields()`, `aggregateFrontmatterFields()`, and their own subclass-specific fields together via their own `getFrontmatterFields()` overrides, in whatever key order each subclass's schema calls for.

`class`, `category`, `affiliations`, `created`, `modified`, `context`, `tags` are standard on every Apparatus note/object via `BaseClass` and apply unchanged. `context` is passed through raw and unresolved — `Aggregate.js` layers no resolution on top of `BaseClass`'s default, unlike `Works.js`, which resolves it eagerly and leniently on its own tier.

## 3. Status Field
---

`Aggregate.js` uses `catalog-status`. Canonical values, per [[Apparatus Status Taxonomy]]: `raw`, `active`, `processed`, `archived`, `placeholder`, `shelved`. `catalog-status`'s stated scope — "library records, work indexes, ingest-oriented notes" — covers the Aggregate tier directly.

## 4. Body Content
---

`Aggregate.js` defines no `getBody()` override — inherits `BaseClass`'s empty-string default. Each subclass implements its own body content independently.

## 5. Modal
---

Location: `.obsidian/apparatus/library/lib/modals/AggregateModal.js`, extending `BaseModal` directly. `AggregateModal` is never instantiated on its own — it is a shared builder-method tier. Each subclass's own modal (`CollectionModal.js`, `PeriodicalModal.js`) extends `AggregateModal` and calls its builder methods individually, interleaved with that subclass's own fields, since each orders its frontmatter differently.

Constructor seeds shared result defaults: `editors: []`, `publisher: ''`, `placeOfPublication: ''`, `genres: []`, `catalogStatus: ''`. No default for `authors` — cascade-only on every subclass, with no modal field anywhere.

Builder methods, called individually by each subclass in whatever order its own schema calls for:

- **`buildCatalogStatusSetting(containerEl)`** — dropdown, `CATALOG_STATUS_OPTIONS`.
- **`buildEditorsSetting(containerEl, folderPath, resolveFolderPath)`** — note-list picker, `expectedClass: 'author'`.
- **`buildPublisherFields(containerEl)`** — two text fields: Publisher, Place of publication.
- **`buildGenresSetting(containerEl)`** — list field.

No builder for `authors` — cascade-only on every subclass, per §2.

## 6. Command
---

No command scaffolds `Aggregate.js` directly — `Aggregate.js` is never instantiated on its own (§1). Each subclass has its own `library-create-<class>.js` command, covered by that subclass's own spec.

## 7. Open Items
---

No open items at this time.

## 8. Change Log
---

| Date | Change |
| ---- | ------ |
| 2026-08-28 | Initial spec. Documents `Aggregate.js`'s six shared frontmatter fields, `resolveFolder()`'s targeting of the library's fixed `collections/` folder, and `AggregateModal.js`'s four builder methods — consolidating shape previously restated only piecemeal in [[Collection.js Specification]], [[Periodical.js Specification]], and [[Apparatus Library Property Taxonomy]] §9. Reflects `context` now passing through both subclasses' frontmatter output as of this session's retrofit. |