---
class: archive
category:
  - specification
affiliations:
created: 2026-08-25
modified: 2026-08-25
object: Definition.js
modal: DefinitionModal.js
context:
  - "[[Library Module]]"
  - "[[Apparatus Library Property Taxonomy]]"
  - "[[citation]]"
  - "[[Glossary.js Specification]]"
  - "[[Works.js Specification]]"
tags:
---
Spec for `Definition.js`.

## Contents
---

```toc
```

## 1. Scope and Class Shape
---

- Extends `BaseClass` directly — not `Works`. Never touches the citation engine; no `computeCitation()` call anywhere in its constructor.
- Location: `.obsidian/apparatus/library/lib/objects/Definition.js`.
- Represents a single glossary term, scoped to a context library. A term is defined relative to the works being cataloged in that library — `Definition` is deliberately narrower than a general-purpose reference-entity class. It does not cover people, places, organizations, or events; those belong to a separate `Entity` class.
- `Definition.resolveFolder()`: static override, resolves `${libraryFolder}/glossary` via `resolveLibraryFolder`. Same target `Glossary.resolveFolder()` resolves to — a `Definition` note lives in the same folder as the singleton `Glossary` dashboard note that indexes it.
- `categoryOptions()`: closed vocabulary describing what *kind of term* it is, not who/what it refers to: `terminology`, `concept`, `movement`, `technique`, `genre`. `person`/`place`/`event` are excluded from this vocabulary — those are entities, not terms, and belong to `Entity` instead.

## 2. Frontmatter Fields
---

| Field | Type | Kind | Resolution | Notes |
| --- | --- | --- | --- | --- |
| `class` | string | — | — | `definition` |
| `category` | string array | controlled vocabulary | dropdown/multi-select | `terminology`, `concept`, `movement`, `technique`, `genre` |
| `affiliations` | string array | free text | standard via `BaseClass` | no fixed vocabulary |
| `sort-title` | string | free text | derived automatically from `this.filename` — strips a single leading "a/an/the" | not modal-collected, same derivation Work leaves use |
| `aliases` | string array | free text | Obsidian's own special property — no custom resolution | alternate spellings/names for the term |
| `created` / `modified` | date | — | standard via `BaseClass` | — |
| `short-definition` | string | free text | free text | brief by convention (a modal note advises brevity); no enforced length/format |
| `reference-work` | wikilink array | relational | eager, throwing — resolved at construction via `resolveNoteTitles()`, normalized to `[[Basename]]` wikilinks via `toWikilink()` | curator-entered directly — see §5 |
| `related` | wikilink array | relational | eager, lenient — `resolveNoteLinksLenient()` at construction | cross-references other `Definition` notes; unresolved links preserved as raw text rather than thrown |
| `context` | wikilink array | relational | raw-stored by `BaseClass`'s own constructor; `Definition.js`'s constructor layers eager-lenient resolution on top via `resolveNoteLinksLenient()`, same pattern `Works.js` applies to its own `context` field | library-scoped `buildContextSetting()` override expected in `DefinitionModal.js`, matching `WorksModal.js`'s pattern |
| `tags` | string array | — | standard via `BaseClass` | — |

Full field order in generated frontmatter: `class`, `category`, `affiliations`, `sort-title`, `aliases`, `created`, `modified`, `short-definition`, `reference-work`, `related`, `context`, `tags`.

`getFrontmatterFields()` hand-lists every key explicitly rather than spreading `baseFrontmatterFields()` directly into the returned object — required regardless, since custom fields (`sort-title`, `aliases`, `short-definition`, `reference-work`, `related`) are interleaved between `BaseClass`-standard fields rather than appended after them. It does still read its computed values (`created`, `modified`, `context`, etc.) off a single `baseFrontmatterFields()` call rather than recomputing them independently.

## 3. Status Field
---

`Definition.js` carries no status field. `catalog-status` and its variants apply to library records, work indexes, and ingest-oriented notes with a cataloging lifecycle; a glossary term is a reference entry, not a tracked work, and has no analogous lifecycle — the same reasoning `Author.js` uses for carrying no status field of its own.

## 4. Body Content
---

`getBody()` renders a single `## definition` section — an empty prose scaffold holding the longer-form definition text. No separate curator-notes section; the definition itself is the entirety of the body.

## 5. Relational Field Resolution
---

- `reference-work` resolves eagerly and strictly in the constructor via `resolveNoteTitles()` (`resolve-titles.js`) plus `toWikilink()` — the plural, throwing counterpart to the pattern `Collection.periodical` uses for a single note. A broken `reference-work` link is treated as an error, not a tolerated cross-reference, since the term's entire reason for existing is to document something arising from a specific, real Work. It is curator-entered directly (a note-list picker in `DefinitionModal.js`, once designed) — never populated by a referencing note's own `postCreate()`. Accession only ever fires from a `Work`/`Collection`'s own `postCreate()`, pushing into notes that already exist at that time; a `Definition` note is created after the Works it references already exist, and `reference-work` lives on the `Definition` note itself, so there is no existing-note `postCreate()` that could reach into it.
- `related` resolves eagerly and leniently via `resolveNoteLinksLenient()` — the same tolerant treatment `Work.cites`/`related` receive. An unresolved link is preserved as raw text, not thrown.
- `context` is raw-stored by `BaseClass`'s own constructor, then resolved eagerly and leniently by `Definition.js`'s own constructor via `resolveNoteLinksLenient()` — identical to the layering `Works.js` performs on top of the same raw value `BaseClass` already set.
- `aliases` is never treated as a relational field — it's Obsidian's own special frontmatter property, left to Obsidian's native handling rather than any custom resolver.

## 6. Modal
---

Location: `.obsidian/apparatus/library/lib/modals/DefinitionModal.js`, extending `BaseModal` directly — `Definition` extends `BaseClass` directly, not `Works`, so there's no shared leaf-modal tier to extend the way `WorksModal`/`AggregateModal` provide one.

Field build order:

1. **Filename** — plain text field. The curator types the term itself; there's no separate suggest control or dropdown.
2. **Category** — `buildCategorySetting()` against `Definition.categoryOptions()`.
3. **Aliases** — list field.
4. **Short definition** — text field.
5. **Reference work** — note-list picker, library-scoped (via `resolveLibraryFolder`, seeded from the active file's parent folder at modal-open time), no `expectedClass` restriction — it can point to any of the 11 Work leaves.
6. **Related** — note-list picker, library-scoped, `expectedClass: 'definition'` — it only ever points to other `Definition` notes.
7. Shared Affiliations/Context/Tags fields, via `super.onOpen()`. `DefinitionModal` overrides `BaseModal`'s `buildContextSetting()` to scope results to the enclosing library (via `resolveLibraryFolder`, same pattern `WorksModal` uses) instead of `BaseModal`'s vault-wide default.

## 7. Command
---

`library-create-definition.js` scaffolds this class. See [[Glossary.js Specification]] §6 for the two commands that only scaffold the `glossary/` folder and its dashboard note — `library-create-definition.js` is the first command that actually populates it with content.

## 8. Open Items
---


## 9. Change Log
---

| Date | Change |
| ---- | ------ |
| 2026-08-25 | Designed `DefinitionModal.js`: field build order, Filename as plain text, library-scoped Reference-work/Related/Context pickers, `expectedClass: 'definition'` on Related. `library-create-definition.js` (already drafted) depends on this. Removed the open item questioning required-field enforcement — resolved to none. |
| 2026-08-25 | Removed the invented Accession section — the class has no Accession participation, and the template omits sections for behavior a class doesn't have rather than documenting the absence. Folded the rationale for reference-work being curator-entered rather than Accession-populated into §5, Relational Field Resolution, where reference-work's resolution mechanism was already documented. Reordered remaining sections to match [[Apparatus Code Module Specification Template]]: Scope, Frontmatter Fields, Status Field, Body Content, Relational Field Resolution, Modal, Command, Open Items, Change Log. |
| 2026-08-25 | Initial spec. Full frontmatter field set and order, resolution semantics for reference-work/related/context, and body content specified. |