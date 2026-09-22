---
class: archive
category:
  - specification
modified: 2026-07-22
tags:
---
Every note in the LVNACY Apparatus carries two primary classification properties: `class` and `category`. Together they establish what a note _is_ before any other metadata is considered. Every note additionally carries a primary connecting property: `affiliations`. This allows connections between notes to arise via shared subjects or other parameters.

**`class`** defines the _form_ of a note — its fundamental nature as a discrete unit of content or structure. Class values are drawn from the professional vocabulary native to each module, ensuring that no two modules share a term. The namespace separation is inherent and semantic, not enforced by prefix or convention.

**`category`** defines the _type_ within a form — the specific kind a note is within its class. Where `class` answers _what is this?_, `category` answers _what kind?_

**`media-type`** is orthogonal to both. It describes the substrate — text, audio, video, image — and applies across all modules without prejudice.

```toc
```

## State Taxonomy: `stage` and domain-scoped status
---

The Apparatus uses two distinct state mechanisms:

- `stage` describes pipeline position: where a note sits in the editorial or production workflow.
- `*domain*-status` describes the current state of a note within its domain.

The authoritative vocabulary and usage rules for all domain-scoped status properties live in [status-taxonomy-implementation.md](Apparatus%20Status%20Taxonomy.md). This document remains authoritative for `class`, `category`, and `affiliations`; the status document is authoritative for domain statuses and their vocabulary.

The canonical status properties are:

- **`catalog-status`**: processing or cataloging state for library records, work indexes, and ingest-oriented notes.
- **`release-status`**: release-readiness for content moving toward publication — scoped to `edition` and `column`. Not used for the `publication` masthead or `volume`.
- **`editorial-status`**: development state for `manuscript` and `scene` notes — drafts and creative work in progress. This covers the story development stages for all but `serial-draft`.
- **`serial-status`**: development state for `serial-draft` manuscript and `scene` notes.
- **`story-status`**: project-container lifecycle for `story` notes — whether the work as a whole is still active, distinct from the progress of any individual draft pass.
- **`archive-status`**: preservation or lifecycle state for archival and system-level notes.
- **`workflow-status`**: operational state for admin/ops container notes — project boards and tracking documents not tied to a specific content domain. Not used for `story`.

**`stage`** remains a separate classifier. It answers the question “where is this note in the pipeline?” and is used for editorial positions such as `serial-draft`, `reassembly`, `1st-edit`, `2nd-edit`, and `final`. By contrast, `*domain*-status` answers the question “what is the current state of this note in its domain?” and uses the vocabulary defined in [status-taxonomy-implementation.md](Apparatus%20Status%20Taxonomy.md).

### Status Guidelines

- Use `catalog-status` for library and cataloging workflows.
- Use `release-status` for edition- and column-level publication readiness.
- Use `editorial-status` for manuscript- and scene-level creative drafting and revision.
- Use `serial-status` for manuscript- and scene-level creative drafting in the serial stage.
- Use `story-status` for the overall lifecycle of a story project.
- Use `archive-status` for archival or preservation contexts.
- Use `workflow-status` for admin/ops project tracking outside any specific content domain.
- Do not use generic `status` as a fallback.
- When a status property needs to be defined or extended, update [status-taxonomy-implementation.md](Apparatus%20Status%20Taxonomy.md) rather than inventing a local variant.

This taxonomy is the load-bearing foundation of the Apparatus. Dataview queries, pipeline logic, cross-vault portability, and module isolation all depend on the integrity of these values. The domain-status vocabulary in [status-taxonomy-implementation.md](Apparatus%20Status%20Taxonomy.md) is the normative reference for those values.

## Separation of Concerns
---

The Apparatus is organized into discrete **modules**, each governing a distinct domain of practice. Currently, three modules are fully developed and active:

- **Library** — the consumption, cataloging, and study of external works
- **Publication** — the editorial production and release of written work
- **Creative** — the development, drafting, and revision of original fiction

A fourth module, **World-Building** — the entities that populate a story's world (characters, groups, belief systems, locations, artifacts, and history) — is now formalized below. **Project/Plugin Development** remains in early development and will be formalized in a future iteration of this guide.

Above the module layer sits the **System vocabulary** — a small set of class values that operate across all modules rather than within any one of them. System classes are not drawn from a domain's professional vocabulary; they describe the structural and operational role a note plays within the Apparatus itself. `archive` is the only currently active System class. See [System Vocabulary](#system-vocabulary) below.

### Why Disjoint Vocabularies Matter

A note with `class: edition` in a Publication context is a discrete issue or release of a publication — a production artifact. A note with `class: edition` in a Library context would be a specific published instantiation of a prior work — a bibliographic artifact. These are different things with different schemas, different queries, and different concerns. Sharing a class value between them would collapse that distinction and force every query to carry additional tag filters to compensate.

By drawing each module's vocabulary from the professional language native to that domain, the namespaces are disjoint by nature. A `monograph` cannot be a production artifact. A `column` cannot be a bibliographic entry. No prefix, no disambiguation suffix, no noise.

The discipline this requires: whenever a term feels tempting to reuse across modules, stop and find the domain-appropriate equivalent. The synonym is always there.

## Module Vocabularies
---

### Library

The Library module governs notes created when consuming, cataloging, and studying external works. Its vocabulary is drawn from the language of bibliography, scholarship, and reader practice.

| class        | description  |
| ------------ | ------------ |
| `article`    | A piece published in a periodical with external editorial oversight — academic journals, magazines, newspapers, and trade publications. Distinct from self-published web writing. |
| `chapter`    | A discrete, catalogable section of a larger `monograph` or `collection`, particularly when cited or studied independently. |
| `collection` | A curated gathering of works — anthology, essay collection, short story collection — by single or multiple authors. |
| `entry`      | A discrete entry in a reference work: encyclopedia, dictionary, handbook, or companion. |
| `essay`      | A standalone argumentative, critical, or personal essay published as a discrete work, not as part of a periodical. |
| `interview`  | A structured conversation published as a primary document, whether in print, audio, or video form. |
| `lecture`    | A talk, speech, or keynote — content delivered rather than written-first, cataloged from recording, transcript, or notes. |
| `monograph`  | A book-length work on a single subject, whether academic, popular, or literary. Encompasses novels, nonfiction books, and extended single-author works. |
| `periodical` | Tracks an entire periodical's run — title → issue → piece — one level above `collection`. Represents the masthead as an ongoing concern within a context library, not any single issue. |
| `record`     | An institutionally preserved primary source document: letter, manuscript, legal record, correspondence, legislation, treaty, or other unpublished or officially archived material. |
| `report`     | A formal research report, white paper, technical report, or policy brief — institutional in nature, not submitted for a degree. |
| `review`     | A critical review of another work — book review, film review, exhibition review — published as a discrete piece. |
| `thesis`     | An academic dissertation or thesis submitted in partial fulfillment of a degree. |

#### `category` Values by Library Class

- **`article`**: `journal` · `magazine` · `newspaper` · `trade`
- **`collection`**: `anthology` · `essay-collection` · `fiction` · `poetry` · `festschrift`
- **`essay`**: `critical` · `personal` · `argumentative` · `lyric`
- **`monograph`**: `academic` · `popular` · `textbook` · `handbook` · `memoir` · `biography` · `polemic`
- **`periodical`**: `pulp-magazine` · `literary-magazine` · `trade-journal` · `academic-journal` · `opinion-journal` · `fanzine` · `webzine` · `newsletter` · `newspaper` · `digest` · `magazine`
- **`record`**: No prescribed values at the spec level. Category values for `record` are context-library-specific, reflecting the range of primary source types relevant to each domain (e.g., `legislation` · `treaty` · `platform` · `charter` for a political science library; `correspondence` · `manuscript` for a literary archive). Apply domain-appropriate values per context library and document them in that library's folder note.
- **`report`**: `research` · `policy` · `technical` · `white-paper` · `working-paper`
- **`review`**: `book` · `film` · `exhibition` · `performance`

### Publication

The Publication module governs notes belonging to the editorial production pipeline — the mechanics of making and releasing written work. Its vocabulary is drawn from editorial and publishing practice.

|class|description|
|---|---|
|`publication`|The masthead entity — the named publication as an ongoing concern. A single note representing the publication itself, not any individual release.|
|`volume`|Groups editions within a publication.|
|`edition`|A discrete issue or release of a publication. For a newsletter, this is a single issue. For a serial, this is a specific installment window.|
|`column`|A standalone written piece produced for publication. The atomic unit of the publication pipeline, whether published as a standalone piece or as part of an `edition`.|

#### `category` Values by Publication Class

- **`publication`**: `newsletter` · `zine` · `magazine` · `journal` · `digest`
- **`volume`**: — (no category; bare grouping container)
- **`edition`**: `newsletter` · `zine` · `magazine` · `journal` · `digest`
- **`column`**: `serial` · `short-story` · `classic-horror`

##### Pick-one vs. stackable

All three categorized classes (`publication`, `edition`, `column`) are pick-one — each describes a single defining axis, no combinable secondary axis emerged. `volume` carries no category at all, mirroring the bare-container precedent set by `timeline` in the World-Building module.

- **`publication`** — pick-one. Describes the masthead's own format, stable across its whole run.
- **`volume`** — no category. Purely a grouping container for editions; nothing distinguishes a "kind" of volume that isn't already inherited from what it contains.
- **`edition`** — pick-one. Shares the same format vocabulary as `publication`, since an edition's format tracks the masthead's format at time of release.
- **`column`** — pick-one, fixed vocabulary of named recurring slots within a masthead. The category value is what the column is called structurally (`serial`, `short-story`, `classic-horror`), not a genre or content-type axis. Extensible only when a masthead adds a new recurring feature.

##### Identity: tags, not category

Masthead identity (`#<publication-name>`) and story identity (`#<story-name>`) live in `tags`, spread across every relevant object — `publication`, `volume`, `edition`, and `column` — rather than folded into `category` or duplicated across frontmatter properties. This mirrors how the Story module keeps series/world identity out of `category` as well.

One practical consequence: a single `edition` can host multiple `column` notes sharing the same category value (e.g. two different serialized novels both categorized `serial`, running in parallel). They're distinguished from each other by their story tag, not by category.

#### The `serial` / `stage` relationship

`serial` as a `column` category value is shared vocabulary with the Creative module's `stage` property (`serial-draft`). The two describe the same story from two vantage points at once:

- `column`'s `serial` category names the **publication-side venue** — this slot runs whatever story is currently in serial publication.
- Creative's `stage` names the **manuscript-side pipeline state** — where that story sits in its own editorial process.

This is an implicit second Publication↔Creative bridge, alongside the explicit `context` field (which lets a `column` reference the `scene` note(s) it draws from).

#### Notes on `column`

`column` replaces prior usage of `article` for production-side pieces. A piece you consume is an `article` (Library). A piece you produce is a `column` (Publication). Same form, different domain, different word.

A `column` may draw from `scene` notes in the Creative module via `part-of`, `context`, or linking conventions — this is the sanctioned bridge between the Publication and Creative modules.

#### Notes on Status

`edition` and `column` carry `release-status`. `publication` and `volume` do not yet carry a status property — both are tracked via folder notes for project-wide tasks, with dashboards planned for the future.

### Creative

The Creative module governs notes involved in the development and drafting of original fiction — from the work entity itself down to the atomic scene. The world-building entities that populate a story now belong to the World-Building module (below); a `story` links out to them via `affiliations` and standard wikilinks rather than housing them directly.

| class        | description                                                                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `story`      | The work entity — the named fiction project in its entirety. Carries pipeline configuration, publication metadata, and links to all `manuscript` notes. One `story` note per work. Carries `story-status`. |
| `manuscript` | A complete draft pass tracked as a Longform project (`serial-draft`, `reassembly`, `1st-edit`, `2nd-edit`, `final`, etc.). Carries `stage` and `editorial-status`.                                         |
| `scene`      | The atomic unit of narrative draft — an individual chapter, or the single note holding a complete short piece when no chapter-split is needed. Carries `editorial-status` and lineage metadata.            |

Hierarchy: `story` (container/index, project-wide) > `manuscript` (draft pass) > `scene` (atomic unit).

#### `category` Values for `story`

- **Length/form** (pick one): `flash-fiction` · `short-story` · `novelette` · `novella` · `novel` · `serial`
- **Series participation** (stackable, optional): `cycle` — paired with `affiliations` to identify the series or world it belongs to. World-building context and shared-series detail live at the Vault level (e.g. Conglomerate), not on the individual `story` note.

### World-Building

The World-Building module governs the entities that populate a story's world. Embedding is a matter of project scale, not taxonomy: most stories are atomic and short (novella-length or under), so their `character`, `location`, and other world-building notes simply live inside the story's own draft folder alongside its editorial workflow, with a Dataview dashboard on the story card. A World-Building module only comes alive as its own dedicated space for series, serials, and novels — but the class and category definitions below are identical either way; nothing about the vocabulary changes when a project graduates from embedded to standalone.

|class|description|
|---|---|
|`character`|A discrete character entity within a story or shared world. Carries physical, psychological, relational, and narrative metadata.|
|`group`|An organized collective, categorized by the binding force that holds its membership together — trade, ideology, devotion, sociability, secrecy, or oath.|
|`belief-system`|A religion, ideology, philosophy, or cosmological framework operative within the story world — distinct from any `group` (e.g. a `congregation`) organized around practicing it.|
|`location`|A physical place within the story world, categorized by scope from broad geography down to a single structure.|
|`artifact`|An object of narrative significance — weapon, relic, document, or tool — categorized by both its nature and its function.|
|`event`|A discrete occurrence within the story world's history, categorized by both scale and nature. Normally housed within a `timeline`.|
|`timeline`|Container/index for a sequence of `event` notes, mirroring `story`'s container role in the Creative module. Carries no category of its own.|

Hierarchy: `timeline` (container/index) > `event` (atomic occurrence). The other five classes are standalone, linked to each other and to their story or shared world via `affiliations` and wikilinks.

#### `category` Values by World-Building Class

- **`character`**: narrative role (pick one) — `protagonist` · `antagonist` · `supporting`
- **`group`**: binding force (pick one) — `guild` · `faction` · `congregation` · `club` · `cabal` · `order`
- **`belief-system`** (stackable): domain — `political` · `religious`; ethical leaning — `benevolent` · `benevolent-neutral` · `neutral` · `neutral-malevolent` · `malevolent`
- **`location`**: scope (pick one) — `region` · `settlement` · `landmark` · `structure`
- **`artifact`** (stackable): nature — `mundane` · `technological` · `supernatural`; function — `weapon` · `relic` · `document` · `tool`
- **`event`** (stackable): scale — `personal` · `local` · `regional` · `world-historic`; nature — `war` · `disaster` · `political` · `discovery` · `ritual`
- **`timeline`**: none — bare container

#### Notes on `affiliations`

All seven World-Building classes use `affiliations` the same way `story` does: to name the series or shared world a note belongs to (e.g. Conglomerate, PLEROMA). This holds even for an element embedded in an atomic, standalone story with no formal shared world — the property is simply left empty in that case.

#### Notes on Status

None of the seven World-Building classes carry a status property. This is a deliberate deferral, consistent with the Apparatus's "start basic, extend from real use case" principle — status is added only once an actual tracking need emerges, not speculatively.

#### Open: Migration Mechanics

`character`, `group`, and `belief-system` previously lived in the Creative module as a stopgap; their class and category definitions now live here instead. What (if anything) changes structurally — beyond moving notes into a dedicated module folder and standing up its dashboard — when a project's world-building actually graduates from embedded to standalone module status remains undecided. That question will be resolved against a real project when the situation next arises, not speculatively.

## System Vocabulary
---

System classes operate above the module layer. They describe the structural and operational role a note plays within the Apparatus rather than its content type within a domain. A System class note may belong to any module or to no module at all — it is identified by what it *does* in the system, not what it *is* as a piece of content.

System class values are disjoint from all module vocabularies by the same principle that governs module-to-module separation: they are never repurposed as module class terms, and no module class term is ever elevated to system use.

|class|description|
|---|---|
|`archive`|A system-level note providing full operational context for a module, submodule, or project. Encompasses specifications, overviews, documentation, and changelogs. An `archive` is self-contained by design: the module or project it describes should be fully reconstructable from it. Applied at any level of the hierarchy — vault-wide, per-module, or per-submodule.|

### `category` Values for `archive`

- **`archive`**: `specification` · `overview` · `documentation` · `changelog`

These values are tightly coupled to `class: archive` and exhaustive at the system level. A note that is a spec is `specification`. A note that orients a reader to a module's scope and structure is `overview`. A note that provides operational or procedural guidance is `documentation`. A commit-generated or manually maintained record of changes is `changelog`. If a candidate category value falls outside these four, it is a signal that the note may not be a true system-level `archive` — reconsider its class before adding a new category value.

## Full Vocabulary Reference
---

All active class values across all layers, confirmed disjoint:

|class|module|
|---|---|
|`monograph`|Library|
|`article`|Library|
|`essay`|Library|
|`thesis`|Library|
|`report`|Library|
|`chapter`|Library|
|`collection`|Library|
|`entry`|Library|
|`lecture`|Library|
|`interview`|Library|
|`review`|Library|
|`record`|Library|
|`periodical`|Library|
|`publication`|Publication|
|`volume`|Publication|
|`edition`|Publication|
|`column`|Publication|
|`story`|Creative|
|`manuscript`|Creative|
|`scene`|Creative|
|`character`|World-Building|
|`group`|World-Building|
|`belief-system`|World-Building|
|`location`|World-Building|
|`artifact`|World-Building|
|`event`|World-Building|
|`timeline`|World-Building|
|`archive`|System|

## Governing Principles
---

1. **Class describes form, not content.** A `monograph` on eldritch horror and a `monograph` on tax law are the same class. What they are _about_ is the work of `genres`, `themes`, and `keywords`.

2. **Module separation is enforced by vocabulary, not by prefix.** No term appears in more than one module's vocabulary. If a term collision is discovered, one module must adopt a domain-appropriate synonym.

3. **Tags scope queries to modules.** `class` identifies what a note is. Tags (`#library`, `#publication`, `#house`, etc.) scope Dataview queries to the correct module or project. Both are necessary; neither substitutes for the other.

4. **`category` provides granularity within `class`.** It is always subordinate — never used without `class`, never queried without `class` context.

5. **The vocabulary is designed to grow.** New modules introduce new class terms drawn from their own professional vocabulary. Existing terms are never repurposed. World-Building has now extended this reference without disturbing it; Project Development will do the same once formalized.

6. **System classes are not module classes.** `archive` and any future System vocabulary terms describe a note's structural role in the Apparatus, not its content type within a domain. A System class note is identified by what it does — it packages and preserves the operational context of whatever it oversees. Module classes are never elevated to System use, and System classes are never borrowed by modules.

## Document Updates
---

| Date | Change |
|---|---|
| 2026-03-17 | Initial vault and module taxonomy spec drafted. |
| 2026-07-22 | Retired `publication-status` in favor of `release-status`, scoped to `edition`/`column`. Added `story-status` for `story`-level project lifecycle. Re-scoped `workflow-status` to admin/ops container notes only, not `story`. Added `volume` class (Publication). Added `manuscript` class (Creative), replacing the placeholder `class: workflow` on Longform project notes. Added `category` values for `story` (length/form, plus stackable `cycle`). Confirmed this taxonomy is Calamity-instance-specific, not framework-portable across all LVNACY instances. |
| 2026-07-22 | Formalized the **World-Building** module. Migrated `character`, `group`, `belief-system` out of Creative; added `location`, `artifact`, `event`, `timeline`. Defined `category` values for all seven classes (several stackable, per-class). Established uniform `affiliations` usage across all seven, mirroring `story`. Deferred status for all seven pending real tracking need. Left migration mechanics (embedded → standalone module) open, to be resolved against a real project. |
| 2026-08-17 | Added `periodical` class to the Library module — tracks an entire periodical's run (title → issue → piece), one level above `collection`. Defined its `category` vocabulary: `pulp-magazine` · `literary-magazine` · `trade-journal` · `academic-journal` · `opinion-journal` · `fanzine` · `webzine` · `newsletter` · `newspaper` · `digest` · `magazine`. |