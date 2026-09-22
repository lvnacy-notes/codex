---
class: archive
category:
  - specification
created: 2026-08-19
modified: 2026-08-25
context:
  - "[[Accession Specification]]"
  - "[[Accession Implementation]]"
  - "[[Author.js Specification]]"
  - "[[Collection.js Specification]]"
  - "[[Periodical.js Specification]]"
tags:
---
Reference specification for the Citation Engine. Reflects the delivered implementation (`resolve-note-file.js`, `resolve-authors.js`, `resolve-titles.js`, `citation-engine.js`, `name-format.js`, `mla.js`, `apa.js`, `chicago.js`).

## Contents
---
```toc
```

## 1. Architecture
---

- Two jobs, kept in separate files: **grab** (resolve wikilinks against real notes — the only files touching the Obsidian API) and **parse** (format resolved, structured data into a citation string — pure functions, no Obsidian dependency).
- Called from the Work modal at note-creation time. Not called from a Dataview view or recomputed live.
- Adding a leaf class means adding one function per style module, then registering it in `FORMATTERS` — no changes to the dispatcher itself.

File layout:

> This table is restated in [[Library Module]] §5, Citation Engine section. Update both when a file's path changes or a file is added/removed.

| File | Path |
|---|---|
| `resolve-note-file.js` | `.obsidian/apparatus/library/lib/controls/resolve-note-file.js` |
| `resolve-authors.js` | `.obsidian/apparatus/library/lib/controls/resolve-authors.js` |
| `resolve-titles.js` | `.obsidian/apparatus/library/lib/controls/resolve-titles.js` |
| `citation-engine.js` | `.obsidian/apparatus/library/citation/citation-engine.js` |
| `name-format.js` | `.obsidian/apparatus/library/citation/name-format.js` |
| `mla.js` / `apa.js` / `chicago.js` | `.obsidian/apparatus/library/citation/` |

## 2. Resolution Layer
---

This section is the authoritative source for resolver semantics (what each `resolve-*.js` export does, throws on, and is used for). It is restated in [[Library Module]] §5 (Object Resolution table), [[Author.js Specification]] §6, [[Collection.js Specification]] §7, [[Periodical.js Specification]] §7, and [[Works.js Specification]] §6. Update all five when resolver behavior changes here.

### `resolve-note-file.js` — shared core

Every other `resolve-*.js` module builds on this; it's also available to any other caller that needs the note itself rather than one field off it.

- `resolveNoteFileLenient(app, sourcePath, rawWikilink)` → the linked `TFile`, or `null` if it doesn't resolve or `rawWikilink` is falsy. Never throws.
- `resolveNoteFile(app, sourcePath, rawWikilink)` → the linked `TFile`. Throws (via `Log.error` first) if `resolveNoteFileLenient` returns `null`.
- Consumed outside the citation engine by Accession's `postCreate()` pushes on `Work.js` and `Collection.js`, which call `resolveNoteFile()` directly to reach the target note before appending to its frontmatter — see [[Accession Specification]].

### `resolve-authors.js`

- `resolveAuthor(app, sourcePath, rawWikilink)` → `{ prefix, first, last, suffix }`, read off the resolved Author note's frontmatter (`prefix`, `first-name`, `last-name`, `suffix`; each defaults to `''` if absent). Throws (via `resolveNoteFile`) on an unresolvable link — no lenient variant exists for authors.
- `resolveAuthors(app, sourcePath, rawWikilinks)` → maps the above over an array; `[]`/`undefined` input yields `[]`.

### `resolve-titles.js`

Class-agnostic — used for Work-to-Work references, Periodical references, and any other note-to-note link, since resolution never depends on the linked note's class.

- `toWikilink(basename)` → `[[basename]]`.
  - Also called directly by Accession's `postCreate()` pushes on `Work.js` and `Collection.js` to normalize a note's own filename before appending it into another note's frontmatter array — see [[Accession Specification]]. `resolveAuthor`/`resolveAuthors`, `resolveNoteTitle`/`resolveNoteTitles`, and the lenient resolvers below are not used by Accession; only `resolveNoteFile()` and `toWikilink()` are shared between the two mechanisms.
- `resolveNoteTitle(app, sourcePath, rawWikilink)` → the resolved note's basename. Throws (via `resolveNoteFile`) on an unresolvable link.
- `resolveNoteTitles(app, sourcePath, rawWikilinks)` → maps the above over an array; `[]`/`undefined` input yields `[]`.
- `resolveOptionalNoteTitle(app, sourcePath, raw)` → for a field that may be a wikilink or plain text. Only attempts resolution when `raw` is bracketed (`[[...]]`); a bare string passes through unchanged rather than being treated as an unresolvable link. **When the value *is* bracketed, resolution still throws on failure** — this function's leniency is only about whether to attempt resolution at all, not about tolerating a broken link.
- `resolveNoteLinkLenient(app, sourcePath, rawWikilink)` → a normalized wikilink to the resolved note, or the raw wikilink text unchanged if unresolved. Does **not** route through `Log.error` — an unresolved link here is an expected, tolerated condition (not-yet-cataloged or since-renamed cross-reference), not a failure worth surfacing as a Notice.
- `resolveNoteLinksLenient(app, sourcePath, rawWikilinks)` → maps the above over an array leniently.

## 3. Dispatch Layer — `citation-engine.js`
---

### `FORMATTERS` registry

Keys: `mla`, `apa`, `chicago-author-date` (Chicago's notes-bibliography variant is not implemented). Each maps all 12 leaf lowercase class values (`article`, `chapter`, `collection`, `entry`, `essay`, `interview`, `lecture`, `monograph`, `record`, `report`, `review`, `thesis`) to that style's formatter function.

### `generateCitation(app, sourcePath, leafClass, style, fields)`

1. Looks up `styleFormatters = FORMATTERS[style]`; throws (`Log.error` first) if the style is unregistered.
2. Looks up `formatter = styleFormatters[leafClass]`; throws (`Log.error` first) if that style has no formatter for the leaf class.
3. Builds a `resolvedFields` object from the raw `fields` object passed in:
   - `authors`, `editors`, `translators`, `interviewer`, `interviewee` → resolved unconditionally via `resolveAuthors` (an absent/empty array resolves to `[]`, not skipped).
   - `collections` → resolved unconditionally via `resolveNoteTitles`.
   - `parentWork`, `referenceWork`, `subjectWork`, `commissioningBody`, `institution`, `periodical` → each resolved via `resolveNoteTitle` **only when present** on the incoming `fields` object (conditional spread) — resolving an absent field unconditionally would throw, since these are leaf-specific and most leaves don't carry them.
   - `containedWorks` → resolved via `resolveNoteTitles` (plural), same present-only condition.
4. Calls `formatter(resolvedFields)` and returns the resulting string.

**Two things worth flagging as observed in the code, not decided anywhere I can see:**
- `event` (Lecture's wikilink-or-string field) is **not** among the fields `generateCitation` resolves. `formatLecture` receives whatever `event` value was already sitting on the incoming `fields` object, unresolved. If `event` needs wikilink resolution, that has to happen upstream of `generateCitation` — it isn't handled here.
- `periodical` **is** resolved by the engine (via `resolveNoteTitle`), but none of the twelve formatters across `mla.js`/`apa.js`/`chicago.js` destructure a `periodical` field. It's resolved and then currently dropped on the floor — no formatter consumes it yet.

## 4. Formatting Layer — `name-format.js`
---

Pure primitives, no Obsidian dependency, shared across all three style modules. Every function takes/returns already-resolved `{ prefix, first, last, suffix }` objects or plain strings.

| Function | Output shape | Notes |
|---|---|---|
| `formatNameAPA({ first, last, suffix })` | `"Last, F."` | Uses `initials()`; `prefix` never rendered. |
| `formatNameInverted({ first, last, suffix })` | `"Last, First"` | Used for the first author in inverted-name styles. |
| `formatNameNormal({ first, last, suffix })` | `"First Last"` | Used for subsequent/non-primary contributors. |
| `initials(firstMiddle)` | `"J. M."` | Splits on whitespace, uppercases + periods each part. |
| `formatPageRange(raw)` | en-dash-joined | Normalizes `"112-134"` or `"112--134"` to `"112–134"`. |
| `joinNamesNormal(names)` | `"A, B, and C"` | Plain (never-inverted) and-joined list — editor/translator/interviewer credits. |

`prefix` (courtesy titles — Dr., Ms.) is deliberately never rendered by any name formatter. `suffix` is always appended when present, in every name formatter that takes one.

## 5. Per-Style Formatters
---

### Author-list join rules (whole author list, not a single name)

| Style | Function | Rule |
|---|---|---|
| MLA | `joinAuthorsMLA` | 1 author: inverted. 2 authors: inverted + normal, joined "and". 3+: `"Last, First, et al."` — no full list ever printed. |
| APA | `joinAuthorsAPA` | All authors listed (up to 20 — 21+ truncation not implemented), last joined with "&". |
| Chicago author-date | `joinAuthorsChicagoAuthorDate` | First author inverted, rest normal, joined "and" — no et al. truncation at any length. |

`FORMATTERS` are keyed identically across styles; `formatCollection` and `formatMonograph` alias `formatEssay` in all three style modules (Collection/Monograph render identically to Essay — `contained-works`/`isbn` never appear in the rendered citation).

### Per-leaf field contracts (fields each formatter destructures)

| Leaf | Shared fields | Style-specific notes |
|---|---|---|
| **Article** | `title, authors, year, collections, volume, issue, pageRange` | — |
| **Chapter** | `title, authors, editors, translators, year, parentWork, edition, publisher, pageRange` | MLA/Chicago also take `placeOfPublication`; APA does not. |
| **Collection** | *(alias of Essay)* | — |
| **Entry** | `title` (caller-supplied entry-term, not filename), `authors, editors, translators, year, referenceWork, edition, publisher` | MLA/Chicago also take `placeOfPublication`; APA does not. |
| **Essay** | `title, authors, editors, translators, year, collections, edition, publisher` | MLA/Chicago also take `placeOfPublication`; APA does not. |
| **Interview** | `title, interviewee, interviewer, year, collections` | `interviewee` fills the author position; `interviewer` gets its own "interview by" clause. |
| **Lecture** | `title, authors, event, deliveryDate, year` | `deliveryDate` preferred over `year` when both present. `event` arrives unresolved (see Dispatch Layer flag above). |
| **Monograph** | *(alias of Essay)* | — |
| **Record** | Essay shape + `format` | `duration` is never destructured/rendered by any style — metadata-only. APA brackets format after the title (`[format]`); MLA/Chicago insert it as a plain trailing element. |
| **Report** | `title, authors, commissioningBody, year, reportNumber, publisher, placeOfPublication` | `commissioningBody` fills the author position when `authors` is empty (corporate authorship). APA additionally suppresses `publisher` from the tail when it equals `commissioningBody`; MLA/Chicago always print `publisher` regardless. |
| **Review** | `title, authors, year, collections, subjectWork` | `subjectWork` renders as its own clause — MLA `"Review of X"`, APA `"[Review of X]"`, Chicago lowercase `"review of x"`. |
| **Thesis** | `title, authors, year, institution, degree` | `degree` mapped through a per-style `DEGREE_LABELS` table (below). `advisor` is never passed to any formatter. |

### Thesis degree labels

| `degree` value | APA | MLA | Chicago |
|---|---|---|---|
| `Doctoral` | "Doctoral dissertation" | "PhD dissertation" | "PhD diss." |
| `Master's` | "Master's thesis" | "master's thesis" | "master's thesis" |

### Observed cross-style inconsistency (flagged, not reconciled)

APA's `formatChapter`/`formatEntry`/`formatEssay`/`formatRecord` never destructure or use `placeOfPublication` at all, while the equivalent MLA and Chicago formatters all take and render it. This is the code as uploaded — not something already decided one way or the other.

## 6. Change Log
---


| Date       | Change        |
| ---------- | ------------- |
| 2026-08-25 | Added inline cross-reference notes marking duplicated content and where it must also be updated: §1's file layout table (restated in Library Module §5, Citation Engine section), §2 Resolution Layer (restated in Library Module §5 and Author.js/Collection.js/Periodical.js/Works.js). No content changed. |
| 2026-08-23 | Added `[[Accession Specification]]` to `context` (previously only `[[Accession Implementation]]` was linked). Noted in §2 that `resolveNoteFile()` and `toWikilink()` are also called directly by Accession's `postCreate()` pushes on `Work.js`/`Collection.js`, and that no other resolver in this layer (`resolveAuthor`/`resolveAuthors`, `resolveNoteTitle`/`resolveNoteTitles`, the lenient variants) is used by Accession. No change to the Dispatch or Formatting layers — `generateCitation()` is never called by Accession, since Accession never computes a citation. |
| 2026-08-19 | Initial Spec. |