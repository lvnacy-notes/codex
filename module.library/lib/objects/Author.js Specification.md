---
class: archive
category:
  - specification
affiliations:
created: 2026-08-22
modified: 2026-08-25
object: Author.js
modal: AuthorModal.js
context:
  - "[[Apparatus Library Property Taxonomy]]"
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[citation]]"
  - "[[Collection.js Specification]]"
  - "[[Periodical.js Specification]]"
  - "[[Library Accession Trigger Map]]"
tags:
---
Spec for `Author.js`.

## Contents
---

```toc
```

## 1. Scope and Class Shape
---

> The class-hierarchy statement below restates [[Library Module]] §2, Class Hierarchy, which is authoritative. It is also restated in [[Periodical.js Specification]] §1, [[Collection.js Specification]] §1, and [[Works.js Specification]] §1. Update all of these, including this section, when the hierarchy changes.

- `Author.js` extends `BaseClass` directly, sibling to `Work.js`/`Aggregate.js`/`Library.js`.
- Represents a contributor note — a person referenced by wikilink from `authors`/`editors`/`translators` fields across `Work.js`, `Aggregate.js` (`Collection`/`Periodical`), and by `interviewer`/`interviewee` on `Interview`.
- `categoryOptions()`: closed vocabulary — `author`, `editor`, `translator`, `interviewer`, `interviewee`. Describes which role(s) this person plays across the corpus, for at-a-glance recognition and dashboard querying. Purely descriptive — carries no effect on picker scoping, cascade behavior, or citation resolution; role in any given citation is determined entirely by which field a citing note's wikilink appears in, not by this value.
- `Author.resolveFolder()` resolves the enclosing library's fixed `authors/` folder via `resolveLibraryFolder`, from the active file's location. Throws if the active file isn't inside a library.

## 2. Frontmatter Fields
---

| Field | Type | Notes  |
| ----- | ---- | ------ |
| `class` | string | `author`. |
| `category` | string array | Closed vocabulary — see §1. Curator-entered at creation time; not cascade-populated. A person holding multiple roles across the corpus (e.g. author and editor) carries multiple values. |
| `affiliations` | string array | No fixed vocabulary, standard via `BaseClass`. |
| `created` / `modified` | date | Standard via `BaseClass`. |
| `prefix` | string | Free text, e.g. `Dr.`. Never rendered by any citation name formatter (see Citation Engine Specification — Formatting Layer). |
| `first-name` | string | Free text. |
| `last-name` | string | Free text. |
| `suffix` | string | Free text, e.g. `Jr.`, `III`. Appended when present by every citation name formatter that takes one. |
| `collections` | wikilink array | Relational. Cascade-only via Accession — see [[Accession Specification]]. No modal field. |
| `works` | wikilink array | Relational. Cascade-only via Accession — see [[Accession Specification]]. Undifferentiated — holds every connected Work regardless of the role that connected it. No modal field. |
| `homepage` | string | Free text URL. |
| `context` | string array | Standard via `BaseClass`. |
| `tags` | string array | Standard via `BaseClass`. |

Full field order in generated frontmatter: `class`, `category`, `affiliations`, `created`, `modified`, `prefix`, `first-name`, `last-name`, `suffix`, `collections`, `works`, `homepage`, `context`, `tags`.

## 3. Status Field
---

`Author.js` carries no status field. `catalog-status` and its variants apply to library records, work indexes, and ingest-oriented notes; an Author note is a reference entity, not a tracked work, and has no analogous lifecycle.

## 4. Body Content
---

`getBody()` renders a single `## works` section containing:

- **All Works** (unfiltered) — the existing dataview table, sitting directly under `## works`, no subheading. Columns: `file.link AS Title`, `year AS "Year Published"`, `collections AS Collections`. Filtered to `#catalog-works` where `authors`, `editors`, `translators`, `interviewer`, or `interviewee`  contain this Author's filename.
- **`### Authored`** — same column set as All Works, filtered to `#catalog-works` where `authors` contains this Author's filename.
- **`### Edited`** — same column set, filtered to `#catalog-works` where `editors` contains this Author's filename.
- **`### Translated`** — same column set, filtered to `#catalog-works` where `translators` contains this Author's filename.
- **`### Interviews`** — filtered to `#catalog-works` where `interviewer` or `interviewee` contains this Author's filename. Columns: `file.link AS Work`, a computed `Interviewee` boolean (`contains(interviewee, [[filename]])`), a computed `Interviewer` boolean (`contains(interviewer, [[filename]])`).

Each subheading (`### Authored`/`### Edited`/`### Translated`/`### Interviews`) is scaffolded to allow curator-entered notes beneath its table.

## 5. Accession
---

`Author.js` participates in Accession only as a target — it defines no `postCreate()` override of its own. See [[Accession Specification]] for the full mechanism.

- `works` is populated by a referencing Work's own `postCreate()`, resolved across all five role fields (`authors`, `editors`, `translators`, `interviewer`, `interviewee`) — Accession row 2.
- `collections` is populated by the same Work `postCreate()` pass, pulling from the Work's own `collections` field — Accession row 3. This runs regardless of which role field connected the Author to the Work; `collections`, like `works`, is undifferentiated by role.
- Both fields may also be edited by hand when the curator needs to correct or backfill an entry outside the normal creation flow — Accession is the primary population path, not the only one.
- Failure behavior follows the shared dedupe/failure model in [[Accession Specification]] §5: a failed push throws and logs rather than failing silently; primary note creation may already have succeeded on disk, requiring manual reconciliation.

## 6. Relational Field Resolution
---

> This section restates resolver semantics. The authoritative source is [[citation]] §2. It is also restated in [[Library Module]] §5 (Object Resolution table), [[Collection.js Specification]] §7, [[Periodical.js Specification]] §7, and [[Works.js Specification]] §6. Update all of these, including this section, when resolver behavior changes.

- `collections`/`works` are stored raw — plain, cascade-populated wikilink arrays holding the pushed value as-written, never resolved anywhere in the module. `Author.js` never computes a citation and never calls into `citation-engine.js` on its own behalf, so neither field has a resolution step of its own — the same pattern `Periodical.authors`/`collections` follow.
- Author notes are themselves resolved *by* other classes' citation computation — `resolve-authors.js`'s `resolveAuthor()`/`resolveAuthors()` read `prefix`/`first-name`/`last-name`/`suffix` off a resolved Author note at citation time. That resolution reads from the Author note; it does not write anything back to it.

## 7. Modal
---

Location: `.obsidian/apparatus/library/lib/modals/AuthorModal.js`, extending `BaseModal.js`.

Field build order:

1. **Filename**
2. **Category** — `buildCategorySetting()` against `Author.categoryOptions()`.
3. **Prefix** — text field, placeholder `e.g. Dr.`.
4. **First name** — text field.
5. **Last name** — text field.
6. **Suffix** — text field, placeholder `e.g. Jr., III`.
7. **Homepage** — text field, placeholder `https://...`.
8. Shared affiliations/tags fields, via `super.onOpen()`.

No `collections`/`works` fields — both cascade-only, per §5.

## 8. Command
---

`library-create-author.js` scaffolds this class.

- Opens `AuthorModal`; on submit, throws (via `Log.error`) if `last-name` is empty — enforced by the command, not the modal, since a nameless Author breaks citation formatting.
- Resolves the target folder via `Author.resolveFolder()`.
- Creates the `Author` note, then opens it in the active leaf.
- Any failure during creation is logged and re-thrown.

## 9. Open Items
---

- `Author.categoryOptions()`'s multi-select rendering (`buildMultiSelectSetting()`, via `buildCategorySetting()`) is intended to be replaced with a dropdown-style control to shorten the modal. Not addressed in this spec.

## 10. Change Log
---

| Date       | Change |
| ---------- | ------ |
| 2026-08-25 | Added inline cross-reference notes marking duplicated content and where it must also be updated: §1's class-hierarchy statement (restated in Library Module §2 and Periodical.js/Collection.js/Works.js §1), §6 Relational Field Resolution (restated in Citation Engine Specification §2 and Library Module §5 / Collection.js §7 / Periodical.js §7 / Works.js §6). No content changed. |
| 2026-08-22 | Renamed §5 from "Cascade Mechanism — Reception" to "Accession" and trimmed it to a summary of Author's own participation, cross-referencing [[Accession Specification]] for the full mechanism. Cleared the three §9 Open Items describing the then-undefined Work/Collection/Periodical-side push behavior, now fully specified in [[Accession Specification]]. |
| 2026-08-22 | Initial spec. Adds `category` as a curator-entered, closed-vocabulary field (`author`/`editor`/`translator`/`interviewer`/`interviewee`), descriptive only — no picker, cascade, or citation-resolution effect. Adds role-filtered dashboard tables (`Authored`/`Edited`/`Translated`/`Interviews`) to `getBody()` alongside the corrected unfiltered table. Removes `collections` from the modal and adds `works`, both now cascade-only fields populated by the referencing class's own `postCreate()`. |