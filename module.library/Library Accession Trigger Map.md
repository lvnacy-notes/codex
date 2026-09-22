---
class: archive
category:
  - specification
affiliations:
created: 2026-09-05
modified: 2026-09-05
context:
  - "[[Accession Specification]]"
  - "[[Library.js Specification]]"
  - "[[Collection.js Specification]]"
  - "[[Periodical.js Specification]]"
  - "[[Author.js Specification]]"
  - "[[Works.js Specification]]"
  - "[[Apparatus Library Property Taxonomy]]"
tags:
---
The Library module's concrete implementation of the Accession pattern. See [[Accession Specification]] for the general mechanism this document instantiates.

## Contents
---

```toc
```

## 1. Participants
---

Accession, in the Library module, is implemented across the `postCreate()` overrides of `Work.js` and `Collection.js` (via `Aggregate.js`), pushing into `Author.js`, `Collection.js`, and `Periodical.js`.

## 2. Object Graph
---

Accession assumes the following creation order, enforced partly by existing eager-resolution behavior (`Collection.periodical` resolves via a throwing `resolveNoteTitle()` at construction) and partly by curator workflow, not by Accession itself:

```
Periodical → Collection → Work
                 ↑
              Author (may be created any time before the Work that references it)
```

- A `Periodical` must exist before the first `Collection` in its series.
- A `Collection` must exist before any `Work` that references it.
- An `Author` must exist before any `Work`, `Collection`, or `Periodical` that references it, but has no other ordering constraint relative to `Collection`/`Periodical`.
- On creation, `Periodical.authors`/`editors`/`translators`/`collections` and `Collection.authors`/`editors`/`translators`/`works` all start empty — they are populated exclusively through Accession, never through modal input. `Author.works`/`collections` likewise start empty and are cascade-only.

## 3. Trigger Map
---

| # | Trigger (`postCreate()` on) | Resolves | Pushes into | Target field | Source value |
| --- | --- | --- | --- | --- | --- |
| 1 | `Collection` (only when `this.periodical` is set) | the linked `Periodical` | `Periodical` | `collections` | the Collection's own filename, as a normalized wikilink |
| 2 | `Work` | every wikilink across `authors`, `editors`, `translators`, `interviewer`, `interviewee` | each resolved `Author` | `works` | the Work's own filename, as a normalized wikilink |
| 3 | `Work` | every wikilink across the same five fields as row 2 | each resolved `Author` | `collections` | the filename of every `Collection` linked in the Work's own `collections` field, deduped, undifferentiated by role |
| 4 | `Work` | every `Collection` linked in the Work's own `collections` field | each resolved `Collection` | `works` | the Work's own filename, as a normalized wikilink |
| 5 | `Work` | the same set of `Collection`s as row 4 | each resolved `Collection` | `authors` | the Work's own `authors` field only — `editors`/`translators` are not pushed |
| 6 | `Work` (via a linked `Collection` whose own `periodical` field is set) | the linked `Periodical` | `Periodical` | `authors` | the Work's own `authors` field only, same source as row 5 |

**Note**: This trigger map is ported to and modified in [[Works.js Specification#5. Accession|§5]] of the [[Works.js Specification]], and restated in prose in [[Library Module]] §3, Data Flow. Updates to this trigger map should be ported to all locations it exists.

## 4. Per-Trigger Mechanics
---

### Row 1 — Collection → Periodical (`collections`)

- `Collection.postCreate()` calls `super.postCreate()`, then, if `this.periodical` is set, resolves it via `resolveNoteFile()` and pushes the Collection's own wikilink into the resolved Periodical's `collections` array.

### Rows 2–3 — Work → Author (`works`, `collections`)

- `Work.postCreate()` resolves every wikilink present across `authors`, `editors`, `translators`, `interviewer`, `interviewee` via `resolveNoteFile()`.
- For each resolved Author, the Work's own wikilink is pushed into that Author's `works` array (row 2).
- For each resolved Author, the wikilink of every Collection listed in the Work's own `collections` field is pushed into that Author's `collections` array (row 3). This runs regardless of which of the five role fields connected the Author to the Work — `Author.collections`, like `Author.works`, is undifferentiated by role.
- A Work with an empty `collections` field triggers row 2 for every resolved Author but performs no pushes for row 3.

### Rows 4–5 — Work → Collection (`works`, `authors`)

- For each Collection resolved from the Work's own `collections` field, the Work's own wikilink is pushed into that Collection's `works` array (row 4).
- For the same set of Collections, every wikilink in the Work's own `authors` field is pushed into that Collection's `authors` array (row 5). `editors`/`translators` on the Work are never pushed here — an editor credited on a single Work inside a Collection is not assumed to be the Collection's own editor.

### Row 6 — Work → Periodical, via Collection (`authors`)

- For each Collection resolved in rows 4–5, if that Collection's own `periodical` field is set, the resolved Periodical also receives the same push described in row 5 — the Work's `authors`, and only `authors`.
- This is a secondhand push: the Work never references the Periodical directly, and the Periodical is only reached by resolving through an already-resolved Collection.

## 5. Implementation-Specific Notes
---

- Every push in this trigger map goes through the shared helper `appendToFrontmatterArray(app, file, key, value)` (`.obsidian/apparatus/library/lib/controls/append-to-frontmatter-array.js`). This helper, and the dedupe/failure discipline it implements, are described generally in [[Accession Specification]] §3; this map's pushes conform to that discipline without deviation.
- Dedupe is a string diff against the target array's existing raw values, not a resolved-file-path comparison. This is consistent across every trigger in §3 above — no trigger introduces a different dedupe strategy.

## 6. Out-of-Scope Fields
---

The following relational fields are never touched by this trigger map, regardless of whether the note they live on also carries fields that are in scope:

- Every leaf-specific relational field other than `Interview.interviewer`/`interviewee`: `Chapter.parent-work`, `Entry.reference-work`, `Lecture.event`, `Report.commissioning-body`, `Review.subject-work`, `Thesis.institution`, `Thesis.advisor`.
- `Work.cites`/`related`/`part-of` — these resolve eagerly at construction via `resolve-titles.js`, independent of this trigger map, and are not pushed into any other note's field.
- `Collection.periodical`/`translators`, `Collection.editors`, `Periodical.editors` — none of these are ever populated by a push from a `Work`. `editors`/`translators` on `Collection`/`Periodical` remain exclusively curator-entered.
- `Collection.cover-card` — not a Work-tier or Aggregate-tier contributor field; out of scope by definition.

## 7. Per-Class Cross-References
---

Each class's own spec retains a short description of its participation in this trigger map and refers here for the full mechanism:

- [[Collection.js Specification]] §6, Accession
- [[Periodical.js Specification]] §6, Accession
- [[Author.js Specification]] §5, Accession
- `Work.js`'s own spec (not yet written as of this document) will require an equivalent section once it exists.

## 8. Open Items
---

- `Work.js` has no standalone spec document yet. Once one exists, it needs a section describing its role as the initiator of rows 2–6.

## 9. Change Log
---

| Date | Change |
| --- | --- |
| 2026-09-05 | Extracted from [[Accession Specification]], which was rewritten to describe the general reverse-edge population pattern with no reference to Library's classes. This document is the Library module's concrete instantiation of that pattern: its object graph, trigger map, per-trigger mechanics, out-of-scope fields, and per-class cross-references, carried over unchanged in content from the prior combined document. |