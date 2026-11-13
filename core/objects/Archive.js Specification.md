---
class: archive
category: specification
affiliations:
created: 2026-11-08
modified: 2026-11-08
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[StoryArchive.js Specification]]"
tags:
---

Base class for the archive notes a module scaffolds. Holds the shared frontmatter, the category vocabulary, and the overview dashboard layout, and exposes the hooks a subclass overrides to supply its own checks.

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

`Archive` extends `BaseClass`. It is the generic base for a module's archive notes and has no opinion on what kind of module it archives. A subclass supplies the module's checks through the hooks in §6.

`Archive` is not created on its own. A subclass is instantiated as part of the larger scaffold a module's creation command performs.

Inherited behavior (frontmatter rendering, `create()`, `path`, `resolveFolder()`) is specified in [[BaseClass.js Specification]]. Members with Kind `hook` in this spec are `Archive`'s overrides of `BaseClass` hooks, or the hooks `Archive` defines for its subclasses.

| Property           | Value                                                      |
| ------------------ | ---------------------------------------------------------- |
| Location           | `.codex/core/objects/Archive.js`                           |
| Export             | `Archive` (named)                                          |
| Extends            | `BaseClass` (`.codex/core/objects/BaseClass.js`)           |
| Module             | None                                                       |
| Accompanying modal | None, see §7                                               |
| Command            | None, see §8                                               |

**Dependencies**

| Import | Source | Use |
| --- | --- | --- |
| `BaseClass` | `./BaseClass.js` | Superclass |

No helper or utility modules.

**Constructor options**

`Archive` accepts every `BaseClass` option (`filename` required; `folder`, `category`, `affiliations`, `context`, `tags` optional), handled by `super`, plus:

| Option | Required | Default | Stored as |
| --- | --- | --- | --- |
| `options.moduleTag` | No | `''` | `this.moduleTag` |

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `constructor(app, options = {})` | instance | Calls `super(app, options)`, then stores `options.moduleTag`. Errors thrown by `BaseClass` for a missing `app` or `filename` propagate unchanged. | `moduleTag` is generic because `Archive` has no opinion on what kind of module it archives. |
| `static classValue` | hook | Value written to the `class` frontmatter field. `'archive'`. | — |

## 2. Frontmatter Fields
---

**Inherited fields:** every field, supplied by `baseFrontmatterFields()`. **Class-specific fields:** none.

| Order | Key | Value |
| --- | --- | --- |
| 1 | `class` | `'archive'` |
| 2 | `category` | `this.category`. Closed vocabulary, see §3. |
| 3 | `affiliations` | `this.affiliations` |
| 4 | `created` | `moment().format('YYYY-MM-DD')` |
| 5 | `modified` | `''` |
| 6 | `context` | `this.context`. Wikilink array, stored raw. |
| 7 | `tags` | `this.tags` merged with `moduleTag`, see below. |

`moduleTag` is not a frontmatter field of its own. It is merged into `tags`. When `moduleTag` is non-empty, `tags` is `moduleTag` followed by the remaining tags, with duplicates removed. Otherwise `tags` is `this.tags` unchanged. Key order is the `BaseClass` order.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getFrontmatterFields()` | hook | Returns `baseFrontmatterFields()` with `tags` replaced as described above. | — |

## 3. Category Vocabulary
---

Closed vocabulary, cross-referenced with [[Apparatus Module Taxonomy]]:

`specification`, `overview`, `documentation`, `changelog`

`Archive` has no modal, so no modal consumes the vocabulary. `getBody()` reads the category to decide whether to generate a body (§5).

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `static categoryOptions()` | hook | Returns the four valid category strings listed above. | Tied to class `archive` and exhaustive at the system level per [[Apparatus Module Taxonomy]]. A value outside these four suggests the note is not a true archive note. |

## 4. Status Field
---

None. `Archive` defines no status field and registers no status domain in [[Apparatus Status Taxonomy]].

## 5. Body Content
---

`getBody()` generates a body only when `this.category` includes `'overview'`. Otherwise it returns `''`.

The overview body, in order:

1. A `# contents` heading followed by an empty `toc` code block.
2. The integrity section, rendered from `integritySectionTitle()` and `integrityChecks()`.
3. The snapshot section, rendered from `snapshotSectionTitle()` and `snapshotChecks()`.
4. A `# changelog` heading followed by a fixed paragraph. The paragraph says changelog entries are generated and managed by Archivist, points to `archivist changelog` run from the module's folder, and states that the note does not prescribe or validate changelog structure.

A checks section renders as `# <title>`, then one block per check: a `## <label>` heading and a fenced `dataviewjs` block holding the check's `script` verbatim. Blocks are separated by a blank line. A section is omitted when its title is falsy or its checks list is empty or missing.

`Archive` contains no Dataview code. Subclasses supply the scripts through the hooks in §6.

**Members**

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `getBody()` | hook | Returns the overview body described above when `this.category` includes `'overview'`, otherwise `''`. | Only `overview` has a prescribed template. `specification` and `documentation` are hand-authored, and Archivist generates and owns `changelog` entries. |
| `buildArchiveOverview({ integritySectionTitle, integrityChecks, snapshotSectionTitle, snapshotChecks })` | internal | Assembles the overview body: the contents heading and `toc` block, the integrity section, the snapshot section, and the `changelog` heading with its fixed paragraph. | Archivist owns changelog entries, so the note describes them and does not prescribe or validate their structure. |
| `renderChecksSection(title, checks)` | internal | Returns the rendered checks section, or `''` when `title` is falsy or `checks` is empty or missing. | — |

## 6. Section Override Points
---

A subclass overrides these hooks to supply its module's checks. A check is an object `{ label, script }`: `label` becomes the `##` heading and `script` is the raw DataviewJS body, with no fence and no heading. `Archive` wraps each script in the fenced block.

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `integritySectionTitle()` | hook | Returns the heading of the integrity section. Defaults to `'archive integrity'`. | — |
| `integrityChecks()` | hook | Returns the checks for the integrity section, one per class the module validates. Defaults to `[]`. | `Archive` does not know which classes a given module has. |
| `snapshotSectionTitle()` | hook | Returns the heading of the snapshot section. Defaults to `null`, which omits the section. | There is no default title because a module with no archival-snapshot concept omits the section instead of emitting an assumed heading. |
| `snapshotChecks()` | hook | Returns the checks for the snapshot section, with the same shape as `integrityChecks()`. Defaults to `[]`. | — |

## 7. Modal
---

None. `Archive` has no modal.

## 8. Command
---

None. `Archive` has no command of its own. A subclass is created by its module's creation command.

## 9. Additional Companion Files
---

None.

## 10. Open Items
---

None.

## Appendix: Member Index
---

| Member | Kind | Section |
| --- | --- | --- |
| `buildArchiveOverview` | internal | §5 |
| `categoryOptions` | hook | §3 |
| `classValue` | hook | §1 |
| `constructor` | instance | §1 |
| `getBody` | hook | §5 |
| `getFrontmatterFields` | hook | §2 |
| `integrityChecks` | hook | §6 |
| `integritySectionTitle` | hook | §6 |
| `renderChecksSection` | internal | §5 |
| `snapshotChecks` | hook | §6 |
| `snapshotSectionTitle` | hook | §6 |

## Appendix: Specification Change Log
---

| Date | Change |
| --- | --- |
| 2026-11-08 | Initial spec |