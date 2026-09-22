---
class: archive
category:
  - specification
affiliations:
created: 2026-08-23
modified: 2026-08-25
object: Works.js
modal: WorksModal.js
context:
  - "[[Apparatus Library Property Taxonomy]]"
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[citation]]"
  - "[[Collection.js Specification]]"
  - "[[Author.js Specification]]"
  - "[[Library Accession Trigger Map]]"
tags:
---
Spec for `Works.js`.

## Contents
---

```toc
```

## 1. Scope and Class Shape
---

> The class-hierarchy statement below restates [[Library Module]] §2, Class Hierarchy, which is authoritative. It is also restated in [[Author.js Specification]] §1, [[Periodical.js Specification]] §1, and [[Collection.js Specification]] §1. Update all of these, including this section, when the hierarchy changes.

- `Works.js` extends `BaseClass` directly, sibling to `Aggregate.js`/`Library.js`/`Author.js`.
- Abstract middle tier shared by the eleven Library "works" leaf classes: `Article`, `Chapter`, `Entry`, `Essay`, `Interview`, `Lecture`, `Monograph`, `Record`, `Report`, `Review`, `Thesis`. No object is ever instantiated from `Works.js` directly — a use case not served by an existing leaf is served by adding a new leaf, not by instantiating `Works` itself.
- Owns the fields and folder-resolution logic common to all eleven leaves; leaf-specific fields, category vocabularies, and body content are defined per leaf — see §9, Leaves.
- Carries no static `classValue` of its own — each leaf sets its own.
- `categoryOptions()` is not overridden — inherits `BaseClass`'s `null` default. Each leaf defines its own closed category vocabulary; see [[Apparatus Module Taxonomy]]'s Library `category` values by class.
- Does not generate its own citation. `computeCitation(fields)` is an instance method that delegates to `citation-engine.js`'s standalone `computeCitation()` export, supplying `this.app`/`this.path`/`this.folder`/`this.constructor.classValue`. Each leaf's own constructor calls this after `super()`, once that leaf's own citation-relevant fields are assigned — `fields` is leaf-specific and not assembled here.
- `Works.resolveFolder()` is a static override (not inherited from `BaseClass`'s default): resolves `<libraryFolder>/<works-folder-name>` via `resolveLibraryNote()` against the active file's parent folder, reading `works-folder-name` off the library note's frontmatter and falling back to `works` when blank or missing. Throws if the active file isn't inside a library (propagated from `resolveLibraryNote()`).

## 2. Frontmatter Fields
---

**Fields contributed by `Works.js`** (returned by `worksFrontmatterFields()`; see §9 for how each leaf splices this together with its own fields):

| Field | Type | Notes |
| --- | --- | --- |
| `sort-title` | string | Derived automatically from `this.filename` — strips a single leading "a/an/the". Not modal-collected. |
| `authors` | wikilink array | Stored raw. Resolved only transiently, inside `citation-engine.js`, at citation-computation time. |
| `editors` | wikilink array | Same storage/resolution pattern as `authors`. |
| `translators` | wikilink array | Same storage/resolution pattern as `authors`. |
| `year` | string | Free text. |
| `collections` | wikilink array | Stored raw. Resolved unconditionally at citation time via `resolveNoteTitles()`; resolved separately and strictly via `resolveNoteFile()` inside `postCreate()` for Accession pushes. |
| `edition` | string | Free text. |
| `publisher` | string | Free text. |
| `place-of-publication` | string | Free text. |
| `citation` | string | Derived — populated by the leaf's own call to `computeCitation()`; empty string at `Works` construction time. |
| `text-source` | string (URL) | Free text. |
| `abstract` | string | Free text. |
| `catalog-status` | string | Controlled vocabulary — see §3. |
| `date-consumed` | string | Free text, `YYYY-MM-DD`. |
| `date-cataloged` | string | Free text, `YYYY-MM-DD`. |
| `date-reviewed` | string | Free text, `YYYY-MM-DD`. |
| `word-count` | string | Free text. |
| `themes` | string array | Free text, `ValueSuggest`-backed. |
| `keywords` | string array | Free text, `ValueSuggest`-backed. |
| `content-warnings` | string array | Controlled vocabulary, advisory — see [[Apparatus Library Property Taxonomy]] §5. |
| `cites` | wikilink array | Resolved eagerly at construction via `resolveNoteLinksLenient()` — tolerates an unresolvable link by falling back to the raw text instead of throwing. |
| `related` | wikilink array | Same eager, lenient resolution as `cites`. |
| `part-of` | wikilink | Same eager, lenient resolution as `cites`/`related`, singular rather than array (`resolveNoteLinkLenient()`). |

`worksFrontmatterFields()` returns the above in this fixed order. It is not, by itself, the full frontmatter field order for any leaf note — each leaf splices `baseFrontmatterFields()`, `worksFrontmatterFields()`, and its own leaf-specific fields together via its own `getFrontmatterFields()` override; see §9 for the full per-leaf breakdown.

`class`, `category`, `affiliations`, `created`, `modified`, `context`, `tags` are standard on every Apparatus note/object via `BaseClass` and apply unchanged. `context` — a wikilink array, catch-all cross-reference to any other object relevant to the note — is stored raw by `BaseClass` itself (no resolver access there), then resolved eagerly and leniently by `Works.js`'s own constructor via `resolveNoteLinksLenient()`, the same treatment `cites`/`related` get. This resolution is specific to `Works.js`; any other module's classes using the bare `BaseClass` default get `context` raw and unresolved.

## 3. Status Field
---

`Works.js` uses `catalog-status`. Canonical values, per [[Apparatus Status Taxonomy]]: `raw`, `active`, `processed`, `archived`, `placeholder`, `shelved`. `catalog-status`'s stated scope — "library records, work indexes, ingest-oriented notes" — covers the Works tier directly.

## 4. Body Content
---

`getBody()` composes four sub-methods, in fixed order, joined with a blank line and filtered to drop any that return an empty string:

```
getBody() {
	return [
		this.getBodyIntroduction(),
		this.getBodyDashboard(),
		this.getBodyAccessory(),
		this.getBodyFreeform(),
	].filter(Boolean).join('\n\n');
}
```

None of the eleven leaves override `getBody()` or any of its four sub-methods — every leaf inherits this composition and all four default implementations unchanged.

- **`getBodyIntroduction()`** — a fixed `## Summary` heading with a blank prose area beneath it. No leaf varies this.
- **`getBodyDashboard()`** — six Dataview query tables under `## catalog queries`: *cited by this work*, *what cites this work*, *unread placeholders generated by this work*, *works by the same author(s)*, *related works*, and *terms*. The first five are scoped to `#<library-tag> AND #catalog-works`; `library-tag` is resolved once at construction time (`this.libraryTag`, read off the enclosing Library note's frontmatter via `resolveLibraryNote()`) and interpolated into each query — the same scoping pattern `Library.js`'s own dashboard queries use, not a folder-based or otherwise invented scope. The *terms* query is scoped to `#<library-tag>` alone (no `#catalog-works`) and filters on `class = "definition"` with `contains(reference-work, this.file.link)` — `definition` is not yet a class implemented anywhere in this system; the glossary/definition mechanism this query anticipates is out of scope for this document and not otherwise specified here.
- **`getBodyAccessory()`** — no-op (`return ''`), positioned between Dashboard and Freeform. A leaf overrides this when it needs a structured section surfaced immediately after the computed cross-references, before the open curator space.
- **`getBodyFreeform()`** — a fixed `## notes` heading with a blank prose area beneath it. Open-ended: a leaf may add further headings here with no specific positional need, though none currently do.

`---` is placed directly under each top-level heading (`## Summary`, `## catalog queries`, `## notes`), not between sections.

## 5. Accession
---

`Works.js` is Accession's initiator for trigger rows 2–6. See [[Accession Specification]] for the full mechanism; the table below is a local summary of only the rows `Works.js` participates in, for readability — if the Accession Specification's own §3 trigger map changes, this table needs a matching update. The trigger map is also restated in prose in [[Library Module]] §3, Data Flow — update that paragraph too when this table changes.

| Row | Resolves | Pushes into | Target field | Source value |
| --- | --- | --- | --- | --- |
| 2 | Every wikilink across `authors`, `editors`, `translators`, `interviewer`, `interviewee` | Each resolved `Author` | `works` | This note's own wikilink |
| 3 | Same wikilinks as row 2 | Each resolved `Author` | `collections` | Every `Collection` linked in this note's own `collections` field |
| 4 | Every `Collection` linked in this note's own `collections` field | Each resolved `Collection` | `works` | This note's own wikilink |
| 5 | Same `Collection`s as row 4 | Each resolved `Collection` | `authors` | This note's own `authors` field only |
| 6 | The linked `Periodical`, reached via a resolved `Collection` whose own `periodical` field is set | The resolved `Periodical` | `authors` | This note's own `authors` field only, same source as row 5 |

- `postCreate(file)` calls `super.postCreate(file)` first, per `BaseClass`'s documented composition pattern, then performs the pushes above.
- Resolves every wikilink present across `authors`, `editors`, `translators`, `interviewer`, `interviewee` via `resolveNoteFile()` (strict, throwing). `interviewer`/`interviewee` are not `Works`-tier fields — they exist on `this` only when the instantiated leaf is `Interview.js`, which sets them as instance properties after `super()`; `postCreate()` reaches for them via `?? []`, tolerating their absence on every other leaf.
- Row 2: for each resolved Author, pushes this note's own wikilink into that Author's `works`.
- Row 3: for each resolved Author, pushes the wikilink of every Collection listed in this note's own `collections` into that Author's `collections`.
- Row 4: for each Collection resolved from this note's own `collections` field, pushes this note's own wikilink into that Collection's `works`.
- Row 5: for the same Collections, pushes every wikilink in this note's own `authors` field — `editors`/`translators` are never pushed here — into that Collection's `authors`.
- Row 6: for each Collection from rows 4–5, reads its `periodical` field directly off `app.metadataCache.getFileCache(collectionFile)?.frontmatter` (not via a `Periodical` object); when set, resolves it via `resolveNoteFile()` and pushes this note's own `authors` into the resolved Periodical's `authors`.
- Every push goes through `appendToFrontmatterArray()`: string-diff dedupe against the target field's current raw values, throw-and-log on failure. See [[Accession Specification]] §5 for the shared failure model.

## 6. Relational Field Resolution
---

> This section restates resolver semantics. The authoritative source is [[citation]] §2. It is also restated in [[Library Module]] §5 (Object Resolution table), [[Author.js Specification]] §6, [[Collection.js Specification]] §7, and [[Periodical.js Specification]] §7. Update all of these, including this section, when resolver behavior changes.

- `authors`/`editors`/`translators`/`collections` are stored raw at construction and resolved twice, independently, for two different purposes: transiently inside `citation-engine.js` at citation-computation time (via `resolve-authors.js`/`resolve-titles.js`), and strictly inside `postCreate()` via `resolveNoteFile()` for Accession pushes. Neither resolution is written back to the field.
- `cites`/`related`/`part-of`/`context` resolve eagerly and leniently in the constructor via `resolve-titles.js` (`resolveNoteLinksLenient()`/`resolveNoteLinkLenient()`) — normalized to `[[Basename]]` wikilinks when resolvable, left as raw text when not. None route through `Log.error()`; all four are tolerated cross-references, not citation-critical or Accession-relevant data. `context` differs from the other three only in that its raw storage originates on `BaseClass`, not `Works.js` — `Works.js` layers its own resolution on top of the value `super()` already set.
- `edition`, `publisher`, `place-of-publication`, `text-source`, `abstract`, `word-count`, `year`, `date-consumed`, `date-cataloged`, `date-reviewed` are free text with no resolution step.
- `themes`/`keywords` are free text, `ValueSuggest`-backed in the modal for consistency without a closed vocabulary.
- `content-warnings` is a controlled-vocabulary array with advisory (non-blocking) validation — see [[Apparatus Library Property Taxonomy]] §5.

## 7. Modal
---

Location: `.obsidian/apparatus/library/lib/modals/WorksModal.js`, extending `BaseModal` directly (not `Works`). Each leaf's own modal (e.g. `ArticleModal.js`) extends `WorksModal` and calls `buildWorksFields()` alongside its own leaf-specific fields.

`buildWorksFields()` field build order — every relational field below is scoped to the enclosing library via `resolveLibraryFolder`, seeded from the active file's parent folder at modal-open time:

1. **Authors** — note-list picker, `expectedClass: 'author'`.
2. **Editors** — note-list picker, `expectedClass: 'author'`.
3. **Translators** — note-list picker, `expectedClass: 'author'`.
4. **Year** — text field.
5. **Collections** — note-list picker, `expectedClass: 'collection'`.
6. **Edition** — text field.
7. **Publisher** — text field.
8. **Place of publication** — text field.
9. **Text source** — text field.
10. **Abstract** — text field.
11. **Catalog status** — dropdown, `CATALOG_STATUS_OPTIONS`.
12. **Date consumed** — text field, placeholder `YYYY-MM-DD`.
13. **Date cataloged** — text field, placeholder `YYYY-MM-DD`.
14. **Date reviewed** — text field, placeholder `YYYY-MM-DD`.
15. **Word count** — text field.
16. **Themes** — list field.
17. **Keywords** — list field.
18. **Content warnings** — list field, advisory vocabulary (`CONTENT_WARNINGS`).
19. **Cites** — note-list picker, no `expectedClass` restriction.
20. **Related** — note-list picker, no `expectedClass` restriction.
21. **Part of** — single note-link picker, no `expectedClass` restriction.

`Context` is not part of `buildWorksFields()`'s build order — it is rendered separately, via the shared `Affiliations`/`Context`/`Tags` block every `BaseModal` subclass gets through `super.onOpen()`. `WorksModal` overrides `BaseModal`'s `buildContextSetting()` to scope results to the enclosing library (via `resolveLibraryFolder`, same pattern as `Cites`/`Related`) instead of `BaseModal`'s vault-wide default — the override is polymorphic, so whichever leaf modal is instantiated automatically gets the library-scoped version without needing its own `onOpen()` override.

Leaf-specific fields and the shared `Affiliations`/`Context`/`Tags` fields (via `super.onOpen()`) are built by each leaf modal on top of `buildWorksFields()`, in whatever order that leaf's own fields call for.

## 8. Command
---

No command scaffolds `Works.js` directly — `Works.js` is never instantiated on its own (§1). Each of the eleven leaves has its own `library-create-<leaf>.js` command, which opens that leaf's own modal (built atop `WorksModal.buildWorksFields()`) and constructs that leaf's object. Leaf commands are not covered by this document.

## 9. Leaves
---

Every leaf extends `Works` directly and follows the same structural pattern: leaf-specific fields assigned in the constructor after `super()`, a `computeCitation()` call passing only the fields that leaf's citation contract needs (see [[citation]] for the full per-leaf contract), and a `getFrontmatterFields()` override that hand-lists every key explicitly rather than spreading `baseFrontmatterFields()`/`worksFrontmatterFields()`. This hand-listing pattern is uniform across all eleven leaves — none spread `base`/`works` — and `context`/`tags` are always the final two keys, in that order, in every leaf.

### Distinguishing fields and resolution

| Leaf | Field(s) | Type | Resolution | Insertion point (relative to shared `Works`-tier fields) |
| --- | --- | --- | --- | --- |
| `Article` | `page-range` | string | Free text. | After `collections`, before `edition`. |
| `Chapter` | `parent-work` | wikilink | Resolved via `resolveNoteTitle()` (conditional, throwing) at citation time. | After `collections`, before `edition`. |
| | `page-range` | string | Free text. | Same. |
| `Entry` | `reference-work` | wikilink | Resolved via `resolveNoteTitle()` (conditional, throwing) at citation time. | After `collections`, before `edition`. |
| | `entry-term` | string | Free text; passed as the citation's `title` in place of `this.filename`. | Same. |
| `Essay` | *(none)* | — | Uses the base citation shape as-is. | — |
| `Interview` | `interviewer` | wikilink array | Resolved via `resolve-authors.js`. | After `translators`, before `year`. |
| | `interviewee` | wikilink array | Resolved via `resolve-authors.js`; fills the citation's author position. | Same. |
| `Lecture` | `event` | wikilink or string | Relational when bracketed, via `resolveOptionalNoteTitle()`; otherwise free text. | After `year`, before `collections`. |
| | `delivery-date` | string | Free text; preferred over `year` in citation when both present. | Same. |
| `Monograph` | `isbn` | string | Free text; never included in the rendered citation. | After `edition`, before `publisher`. |
| `Record` | `format` | string | Controlled vocabulary (`RECORD_FORMAT_OPTIONS`); included in the rendered citation. | After `edition`, before `publisher`. |
| | `duration` | string | Free text; never included in the rendered citation. | Same. |
| `Report` | `commissioning-body` | wikilink | Resolved via `resolveNoteTitle()` (conditional, throwing) at citation time; fills the citation's author position when `authors` is empty. | After `year`, before `collections`. |
| | `report-number` | string | Free text. | Same. |
| `Review` | `subject-work` | wikilink | Resolved via `resolveNoteTitle()` (conditional, throwing) at citation time; renders as its own clause, not a container-title substitution. | After `collections`, before `edition`. |
| `Thesis` | `institution` | wikilink | Resolved via `resolveNoteTitle()` (conditional, throwing) at citation time. | After `year`, before `collections`. |
| | `degree` | string | Controlled vocabulary (`THESIS_DEGREE_OPTIONS`); mapped per-style in citation. | Same. |
| | `advisor` | wikilink | Never resolved; captured for reference only, never passed to `computeCitation()`. | Same. |

Cross-referenced against [[Apparatus Library Property Taxonomy]] §7 (Middle-Tier Leaf Properties), which is the authoritative source for these fields' vocabulary and type classification; this table adds the frontmatter insertion point, which the Taxonomy document does not track.

### Category vocabularies

`Article`, `Essay`, `Monograph`, `Report`, `Review` override `categoryOptions()` with a closed vocabulary matching [[Apparatus Module Taxonomy]]. `Chapter`, `Entry`, `Interview`, `Lecture`, `Thesis` carry no override, inheriting `BaseClass`'s `null` default (free text) — consistent with the Module Taxonomy listing no category vocabulary for these five. `Record` also carries no override, but for a different reason than the other five: its category vocabulary is context-library-specific by design, deferred to each library's own `Record` subclass, per its own header comment and the Module Taxonomy's note on `record`.

## 10. Open Items
---

- The `terms` Dataview query in `getBodyDashboard()` filters on `class = "definition"` — a class not implemented anywhere in the current system. The glossary/definition mechanism this anticipates is deliberately out of scope for this document.
- No individual leaf specs (`Article.js`, `Chapter.js`, etc.) exist as standalone documents. §9 above is the current authoritative source for leaf-specific fields; a leaf gets its own spec only if its complexity grows to warrant one.
- `getFrontmatterFields()` has no `Works.js`-level override and remains fully leaf-determined — each leaf reconstructs its own key list rather than spreading `base`/`works`. This is documented as the current, confirmed pattern in §9, not treated as an open question, but is listed here since it remains a live source of duplication across all eleven leaves.

## 11. Change Log
---

| Date | Change |
| ---------- | ------ |
| 2026-08-25 | Added inline cross-reference notes marking duplicated content and where it must also be updated: §1's class-hierarchy statement (restated in Library Module §2 and Author.js/Periodical.js/Collection.js §1), §5's existing porting note extended to name Library Module §3, §6 Relational Field Resolution (restated in Citation Engine Specification §2 and Library Module §5 / Author.js §6 / Collection.js §7 / Periodical.js §7). No content changed. |
| 2026-08-24 | Implemented the four-method body architecture (`getBodyIntroduction()`, `getBodyDashboard()`, `getBodyAccessory()`, `getBodyFreeform()`, composed by `Works.js`'s own `getBody()`) in `Works.js`; removed the now-redundant duplicated `getBody()` override from all eleven leaves. §4 rewritten to describe this as implemented, not designed. Dashboard queries scope via a `library-tag` resolved at construction (`this.libraryTag`), matching `Library.js`'s own dashboard query pattern, not a folder-based scope. |
| 2026-08-23 | Renamed throughout: `Work.js` → `Works.js`, class `Work` → `Works`, `workFrontmatterFields()` → `worksFrontmatterFields()`, `WorkModal.js` → `WorksModal.js`, `buildWorkFields()` → `buildWorksFields()`. Added `context` (`BaseClass`-standard field, resolved eagerly via `resolveNoteLinksLenient()` in `Works.js`'s own constructor; library-scoped in `WorksModal.js` via a `buildContextSetting()` override of `BaseModal`'s vault-wide default). Added §9, Leaves, documenting all eleven leaves' distinguishing fields, resolution, insertion points, and category vocabulary sourcing. Condensed §5's bare row-number references into a local summary table. Corrected §1's leaf count (11, not 12) and a stale `resolve-works.js`/`resolveWorkTitle()` reference in `Chapter.js` to the current `resolve-titles.js`/`resolveNoteTitle()`. `date-consumed` propagated to all eleven leaves' `getFrontmatterFields()`, previously present only on `Works.js` itself. |
| 2026-08-23 | Initial spec. Added `date-consumed` (constructor, `workFrontmatterFields()`, `WorkModal.js` defaults and field-build order). Added a `super.postCreate(file)` call to `Work.postCreate()`. |