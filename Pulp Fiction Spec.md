---
class: archive
category:
  - specification
affiliations:
created: 2026-08-10
modified: 2026-08-11
tags:
---
This document is the authoritative reference for the Pulp Fiction context library's extension of the Library module. It is paired with [Apparatus Module Taxonomy.md](Apparatus%20Module%20Taxonomy.md), [Apparatus Status Taxonomy.md](Apparatus%20Status%20Taxonomy.md), and [Apparatus Library Property Taxonomy.md](Apparatus%20Library%20Property%20Taxonomy.md) — none of those are restated here. This document defines only what is specific to Pulp Fiction.

---
```toc
```

## 1. Scope
---

Pulp Fiction catalogs public-domain pulp horror fiction for potential republication via the Backstage Pass. This document supersedes the earlier `PulpFictionArticle`/`PulpFictionCollection` sketch referenced in `LIBRARY_MODULE_IMPLEMENTATION.md`, which was an unconfirmed guess and was not used as a basis for this spec.

## 2. Class Taxonomy
---

The Apparatus Module Taxonomy's twelve-leaf `Work` vocabulary is authoritative. There is no `Story` class. Individual pulp stories are catalogued under two existing `Work` leaves, chosen by how the story was originally published:

| Leaf | Parent | When to use |
| --- | --- | --- |
| `PulpFictionArticle` | `Article.js` | Story appeared in a specific issue of a magazine/periodical — the common case, covering nearly all Pulp Fiction works |
| `PulpFictionMonograph` | `Monograph.js` | Story was published standalone, not as part of a periodical issue — rare |

Beyond the two story-level leaves, Pulp Fiction also needs two classes reflecting the periodical hierarchy itself (title → issue → piece):

| Class | Parent | Purpose |
| --- | --- | --- |
| `PulpFictionCollection` | `Collection.js` | Represents one specific issue of a periodical (e.g. Weird Tales Vol. 11, No. 2). Frontmatter `class: collection`, matching `Collection.js`'s `classValue`. Lives in `collections/` (core folder-structure change, see `LIBRARY_MODULE_IMPLEMENTATION.md`). |
| `PulpFictionPeriodical` | `Periodical.js` (new middle-tier class, extends `BaseClass` directly) | Tracks an entire periodical's run across many issues (e.g. every issue of Weird Tales) — see §7. |

## 3. `PulpFictionWork.js` — Shared Fields
---

An intermediate class between `Work.js` and `PulpFictionArticle`/`PulpFictionMonograph`. Beyond everything `Work.js` already provides (including `cites`/`part-of`/`related`, now base-tier — see `LIBRARY_MODULE_IMPLEMENTATION.md`):

| Property | Type | Resolution | Vocabulary |
| --- | --- | --- | --- |
| `bp-candidate` | boolean | free text / checkbox | — |
| `bp-approved` | boolean | free text / checkbox | — |
| `backstage-draft` | string (URL) | free text | — |
| `date-approved` | date | free text | — |
| `public-domain` | boolean | free text / checkbox | — |
| `rights-verified` | boolean | free text / checkbox | — |
| `genres` | string array | free text, `ValueSuggest`-backed | open — no fixed list, same pattern as `themes`/`keywords` |
| `synopsis` | string | free text | — distinct from `Work.js`'s `abstract`: spoiler-free blurb vs. full critical summary |
| `date-consumed` | date | free text | — standardized field name across **all** context libraries for "when the curator consumed the work" (the companion pending-changes doc tracks the Marginalia rename this implies) |
| `illustration` | wikilink or string (URL) | free text — stored as-is in whichever format is entered, no title-resolution step (unlike relational fields, illustration doesn't point at a `Work`) | — |

## 4. Length/Format Category Vocabulary — `PulpFictionArticle` and `PulpFictionMonograph`
---

Neither leaf's inherited `categoryOptions()` fits short fiction (`Article`'s is venue type — `journal`/`magazine`/`newspaper`/`trade`; `Monograph`'s — `academic`/`popular`/`textbook`/`handbook`/`memoir`/`biography`/`polemic` — doesn't fit fiction at all). Both leaves need a `categoryOptions()` override using a shared length/format vocabulary, so a work's category is a fast, at-a-glance signal of Backstage Pass republishing eligibility regardless of which leaf catalogued it (nearly all works are `PulpFictionArticle`, so restricting this to `Monograph` alone would leave the common case uncovered).

Vocabulary (both leaves): `flash-fiction`, `short-story`, `novelette`, `novella`, `novel`, `serial` — standard SFWA-style length buckets, plus `serial` for works originally run as multi-installment serials across issues (a distinct republishing case: a serial excerpt isn't standalone-republishable the way a complete story is).

Lives in `library-vocab.js` as **`WORK_LENGTH`**, keyed by context library so other libraries can define their own length taxonomy later without touching Pulp Fiction's.

## 5. Periodical Issues — `PulpFictionCollection`
---

A single periodical/magazine issue (e.g. Weird Tales Vol. 11, No. 2) is catalogued as a `PulpFictionCollection` (`class: collection`) — see [[Library Module Implementation]] for the full rationale and the resulting `citation-engine.js`/folder-structure. Nothing Pulp-Fiction-specific is added on top of `Collection.js` at this level; `PulpFictionCollection` exists so the frontmatter's `class` value and the code's class name remain consistent with every other Pulp Fiction leaf's naming.

## 6. `PulpFictionPeriodical` — Tracking a Periodical's Full Run
---

`PulpFictionPeriodical` extends the middle-tier `Periodical.js` class (see [[Library Module Implementation]] for its full design — the title→issue→piece hierarchy, why it's not a `Work` leaf, the `authors` field, and the companion `.base` file mechanism). Nothing Pulp-Fiction-specific is added on top of `Periodical.js` at this level either; same reasoning as `PulpFictionCollection` above.

The generated `.base` file's filter — `tag == <filter-tag> AND class == "collection"` — matches against `PulpFictionCollection` notes specifically, since `class: collection` is what every issue-level note carries regardless of which context library it belongs to. The `<filter-tag>` captured in the creation modal is what actually scopes the view to *this* periodical (e.g. a `weird-tales` tag), not the `class` match alone.

## 7. Status — `catalog-status`
---

Pulp Fiction uses `Work.js`'s base-tier `catalog-status` field directly.

## 8. Root Note
---

`Pulp Fiction.md`, the library's actual root/dashboard note, is `class: library`, matching `Library.js`'s abstract per-library root note pattern. It carries `citation-style` and `works-folder-name`, per the existing `Library.js` design in [[Library Module Implementation]].

## 9. Naming
---

Every Pulp Fiction leaf/class follows the existing `<library>-create-<class>` command convention: `id` = `pulp-fiction-create-article.js` / `pulp-fiction-create-monograph.js` / `pulp-fiction-create-collection.js` / `pulp-fiction-create-periodical.js`, `name` = `Create Pulp Fiction Article` / etc.

## 10. Explicitly Deferred / Out of Scope
---

- **`content-metadata`** (free-form YAML object in the live template, e.g. `paranormal-mechanism`, `setting`, `creature-type`) — scrapped from this spec. To be designed separately.

## 11. Build Order
---

- [ ] Build `PulpFictionWork.js`. {{operonId:: p4gff5g}} {{status:: Project.Planned}} {{priority:: C}} {{datetimeCreated:: 2026-08-19T16:46:48}} {{datetimeModified:: 2026-08-19T16:46:53}}
- [ ] Build `PulpFictionArticle.js` + `PulpFictionArticleModal.js` + `pulp-fiction-create-article.js` {{operonId:: 1e8qtwc}} {{status:: Project.Planned}} {{priority:: C}} {{datetimeCreated:: 2026-08-19T16:45:55}} {{datetimeModified:: 2026-08-19T16:46:00}}
- [ ] Build `PulpFictionMonograph.js` + `PulpFictionMonographModal.js` + `pulp-fiction-create-monograph.js` {{operonId:: zcoodgl}} {{status:: Project.Planned}} {{priority:: C}} {{datetimeCreated:: 2026-08-19T16:46:56}} {{datetimeModified:: 2026-08-19T16:46:58}}
- [ ] Build `PulpFictionCollection.js` + modal + command {{operonId:: flp57p3}} {{status:: Project.Planned}} {{priority:: C}} {{datetimeCreated:: 2026-08-19T16:47:00}} {{datetimeModified:: 2026-08-19T16:47:04}}
- [ ] Build `PulpFictionPeriodical.js` + modal + command (including `.base`-file generation) {{operonId:: 13rdtl0}} {{status:: Project.Planned}} {{priority:: C}} {{datetimeCreated:: 2026-08-19T16:49:11}} {{datetimeModified:: 2026-08-19T16:49:16}}
- [ ] Build `PulpFictionLibrary.js` {{operonId:: 8lwbm4k}} {{status:: Project.Planned}} {{priority:: C}} {{datetimeCreated:: 2026-08-19T16:49:15}} {{datetimeModified:: 2026-08-19T16:49:18}}
