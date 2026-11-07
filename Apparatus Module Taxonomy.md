---
class: archive
category:
  - specification
affiliations:
modified: 2026-10-22
context:
  - "[[Apparatus Status Taxonomy]]"
  - "[[Apparatus Affiliations Taxonomy]]"
tags:
---

> [!note] class /klăs/
> ### noun
> 1. A set, collection, group, or configuration containing members regarded as having certain attributes or traits in common; a kind or category.
> 2. A division based on quality, rank, or grade, as.
> 3. A social stratum whose members share certain economic, social, or cultural characteristics.
> 4. A syntactic entity structure used to create objects.

**`class`** defines the _form_ of an object (note) — its fundamental nature as a discrete unit of content or structure. Class values are drawn from the professional vocabulary native to each module, ensuring that no two modules share a term, excepting those extended from `Entity` (see Core). The namespace separation is otherwise inherent and semantic, not enforced by prefix or convention.

> [!note] category /kăt′ĭ-gôr″ē/
> ### noun
> 1. A specifically defined division in a system of classification; a class.
> 2. A general class of ideas, terms, or things that mark divisions or coordinations within a conceptual scheme, especially.
> 3. Aristotle's modes of objective being, such as quality, quantity, or relation, that are inherent in everything.

**`category`** defines the _type_ within a form — the specific kind an object (note) is within its class. Where `class` answers _what is this?_, `category` answers _what kind?_ 

Every note in the LVNACY Apparatus carries two primary classification properties: `class` and `category`. Together they establish what a note _is_ before any other metadata is considered. Every note additionally carries a primary connecting property: `affiliations`. This allows connections between notes to arise via shared subjects or other parameters. This document defines `class` and `category` taxonomy for Apparati. refer to [[Apparatus Affiliations Taxonomy]] for `affiliations` taxonomy and [[Apparatus Status Taxonomy]] for statuses.

## Contents
```toc
```

## Governing Principles

1. **Class describes form, not content.** A `monograph` on eldritch horror and a `monograph` on tax law are the same class. What they are _about_ is the work of `genres`, `themes`, and `keywords`.

2. **Module separation is enforced by vocabulary, not by prefix.** No term appears in more than one module's vocabulary, with one exception: classes extended from Core's `Entity` carry the same class value in every module that extends them. If any other term collision is discovered, one module must adopt a domain-appropriate synonym.

3. **Tags scope queries to modules.** `class` identifies what a note is. Tags (`#library`, `#publication`, `#house`, etc.) scope Dataview queries to the correct module or project. Both are necessary; neither substitutes for the other.

4. **`category` provides granularity within `class`.** It is always subordinate — never used without `class`, never queried without `class` context.

5. **The vocabulary is designed to grow.** New modules introduce new class terms drawn from their own professional vocabulary. Existing terms are never repurposed, with few exception, which are well-documented.

6. **System classes are not module classes.** `archive` and any future System vocabulary terms describe a note's structural role in the Apparatus, not its content type within a domain. A System class note is identified by what it does — it packages and preserves the operational context of whatever it oversees. Module classes are never elevated to System use, and System classes are never borrowed by modules.

## Separation of Concerns

The Apparatus is organized into discrete **modules**, each governing a distinct domain of practice. Currently, three modules are fully developed and active:

- **Library** — the consumption, cataloging, and study of external works
- **Publication** — the editorial production and release of written work
- **Creative** — the development, drafting, and revision of original fiction

A fourth module, **Core**, is the base from which all other classes are derived. It provides the fundamental classes and mechanisms which drive the others. `BaseClass` in `/.codex/core/objects/` contains the base properties all objects in the apparatus carry, as well as overridable functions for category display, body composition, and others. The objects and modals in **Core** are meant to be extended and used by the other modules, with few exception, such as `Image`.

**Project/Plugin Development** remains in early development and will be formalized in a future iteration of this guide.

Above the module layer sits the **System vocabulary** — a small set of class values that operate across all modules rather than within any one of them. System classes are not drawn from a domain's professional vocabulary; they describe the structural and operational role a note plays within the Apparatus itself. `archive` is the only currently active System class. See [System Vocabulary](#system-vocabulary) below.

### Why Disjoint Vocabularies Matter

A note with `class: edition` in a Publication context is a discrete issue or release of a publication — a production artifact. A note with `class: edition` in a Library context would be a specific published instantiation of a prior work — a bibliographic artifact. These are different things with different schemas, different queries, and different concerns. Sharing a class value between them would collapse that distinction and force every query to carry additional tag filters to compensate.

> [!important]
> The only exception to this are objects extended from `Entity`. Creative and Library will have their own uses for leaves built from `Entity`, and the development of a separate class taxonomy for each module's extensions from `Entity` would be naught more than an exercise in cleverness and serve to obscure the clarity intended in this system.

By drawing each module's vocabulary from the professional language native to that domain, the namespaces are disjoint by nature. A `monograph` cannot be a production artifact. A `column` cannot be a bibliographic entry. No prefix, no disambiguation suffix, no noise.

The discipline this requires: whenever a term feels tempting to reuse across modules, stop and find the domain-appropriate equivalent. The synonym is always there.

## Module Vocabularies

### Core

Core contains the base material from which all else is derived. Core is not a domain of practice. It supplies the foundational classes and mechanisms the other modules extend, with few exception.

Core provides:

- **`BaseClass`** — the properties every object in the Apparatus carries (`class`, `category`, `affiliations`, `created`, `modified`, `context`, `tags`), plus overridable hooks for category display, body composition, and others.
- **`Entity`** — the shared tier for the seven classes below. Adds `aliases`, `source`, and `related`. Never instantiated directly, and carries no class value.
- **`Constituent`** — the shared tier for `person`, `organization`, and `belief-system`, the three classes that can belong to, or have belonging to them, another entity. Adds the relationship fields `part-of`, `membership`, `founder`, `founded`, `possessions`, and `events`. Never instantiated directly, and carries no class value.


| class       | description                                                               |
| ----------- | ------------------------------------------------------------------------- |
| `BaseClass` | Base object from which everything else extends.                           |
| `BaseModal` | Base modal from which all other modals are designed.                      |
| `Archive`   | System-level object.                                                      |
| `Image`     | Object for organizing images, with fields for location, source, and type. |

The following are classes instantiated by extending the base `Entity` or `Constituent` objects. These are further extended by Creative and Library as needed.

| class | description |
| --- | --- |
| `person` | An individual, real or fictional, referenced or discussed within a catalog or story. |
| `organization` | An organized collective: a family, faction, political party, or guild. Can have members and can belong to a larger organization or belief system. |
| `belief-system` | A religion, ideology, philosophy, or cosmological framework — distinct from any `organization` formed around practicing it. |
| `place` | A physical place, categorized by scope from broad geography down to a single structure. |
| `artifact` | An object of narrative or historical significance — weapon, relic, document, or tool — categorized by nature, function, and temperament. |
| `event` | A discrete or extended occurrence, categorized by scale and nature. |
| `timeline` | Container for a sequence of `event` notes. Carries no category of its own. |

Hierarchy: `timeline` (container/index) > `event` (atomic occurrence). The remaining classes are linked to each other through relational fields and `affiliations`.

Modules extend these classes rather than defining their own equivalents. An extended class keeps its Core class value and the category vocabulary defined below.

#### `category` Values by Core Class

- **`person`**: pick one — `real` · `fictional`
- **`organization`** (open-ended; a starting set, not a closed list): `family` · `faction` · `political-party` · `guild`
- **`belief-system`**:
  - domain (pick one, required): `political` · `religious`
  - political sub-axis (only when `political` is selected): `first-party` · `third-party` · `independent`
  - religious sub-axis (only when `religious` is selected): `mainstream` · `denomination` · `cult` · `individual`
  - ethical leaning (stackable, independent of domain): `benevolent` · `benevolent-neutral` · `neutral` · `neutral-malevolent` · `malevolent`
- **`place`**: scope (pick one) — `region` · `settlement` · `landmark` · `structure`
- **`artifact`**:
  - nature (stackable): `mundane` · `technological` · `supernatural`
  - function (stackable): `weapon` · `relic` · `document` · `tool`
  - temperament (pick one): `cursed` · `blessed` · `neutral`
- **`event`** (stackable): scale — `personal` · `local` · `regional` · `world-historic`; nature — `war` · `disaster` · `political` · `discovery` · `ritual`
- **`timeline`**: none — bare container

#### Notes on Status for Core

None of the seven Core classes carry a status property.

### Creative

The Creative module governs notes involved in the development and drafting of original fiction — from the work entity itself down to the atomic scene. World-building entities that populate in a story extend from Core's `Entity` leaves; a `story` links out to them via `affiliations` and standard wikilinks.

| class        | description |
| ------------ | ------------|
| `story`      | The work entity — the named fiction project in its entirety. Carries pipeline configuration, publication metadata, and links to all `manuscript` notes. One `story` note per work. Carries `story-status`. |
| `manuscript` | A complete draft pass tracked as a Longform project (`serial-draft`, `reassembly`, `1st-edit`, `2nd-edit`, `final`, etc.). Carries `stage` and `editorial-status`.                                         |
| `scene`      | The atomic unit of narrative draft — an individual chapter, or the single note holding a complete short piece when no chapter-split is needed. Carries `editorial-status` and lineage metadata.            |

The classes above are specific to Creative. Creative additionally extends all seven Core `Entity` classes. Each keeps its Core class value and its Core `category` vocabulary.

| class | description |
| --- | --- |
| `person` | Core `person`. An individual, real or fictional. |
| `organization` | Core `organization`. An organized collective: a family, faction, political party, or guild. |
| `belief-system` | Core `belief-system`. A religion, ideology, philosophy, or cosmological framework. |
| `place` | Core `place`. A physical place, from broad geography down to a single structure. |
| `artifact` | Core `artifact`. An object of narrative or historical significance. |
| `event` | Core `event`. A discrete or extended occurrence. |
| `timeline` | Core `timeline`. Container for a sequence of `event` notes. |

Hierarchy: `story` (container/index, project-wide) > `manuscript` (draft pass) > `scene` (atomic unit).

#### `category` Values for `story`

- **Length/form** (pick one): `flash-fiction` · `short-story` · `novelette` · `novella` · `novel` · `serial`
- **Series participation** (stackable, optional): `cycle` — paired with `affiliations` to identify the series or world it belongs to. World-building context and shared-series detail live at the Vault level (e.g. Conglomerate), not on the individual `story` note.

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

The classes above extend `Works` or `Aggregate`, and are specific to Library. Library additionally extends the following Core `Entity` classes. Each keeps its Core class value and its Core `category` vocabulary.

| class      | description |
| ---------- | ----------- |
| `person`   | Core `person`. An individual, real or fictional. |
| `place`    | Core `place`. A physical place, from broad geography down to a single structure. |
| `event`    | Core `event`. A discrete or extended occurrence. |
| `timeline` | Core `timeline`. Container for a sequence of `event` notes. |

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

All three categorized classes (`publication`, `edition`, `column`) are pick-one — each describes a single defining axis, no combinable secondary axis emerged. `volume` carries no category at all.

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

#### Notes on Status for Publication

`edition` and `column` carry `release-status`. `publication` and `volume` do not yet carry a status property — both are tracked via folder notes for project-wide tasks, with dashboards planned for the future.

## System Vocabulary

System classes operate above the module layer. They describe the structural and operational role a note plays within the Apparatus rather than its content type within a domain. A System class note may belong to any module or to no module at all — it is identified by what it *does* in the system, not what it *is* as a piece of content.

System class values are disjoint from all module vocabularies by the same principle that governs module-to-module separation: they are never repurposed as module class terms, and no module class term is ever elevated to system use.

|class|description|
|---|---|
|`archive`|A system-level note providing full operational context for a module, submodule, or project. Encompasses specifications, overviews, documentation, and changelogs. An `archive` is self-contained by design: the module or project it describes should be fully reconstructable from it. Applied at any level of the hierarchy — vault-wide, per-module, or per-submodule.|

### `category` Values for `archive`

- **`archive`**: `specification` · `overview` · `documentation` · `changelog`

These values are tightly coupled to `class: archive` and exhaustive at the system level. A note that is a spec is `specification`. A note that orients a reader to a module's scope and structure is `overview`. A note that provides operational or procedural guidance is `documentation`. A commit-generated or manually maintained record of changes is `changelog`. If a candidate category value falls outside these four, it is a signal that the note may not be a true system-level `archive` — reconsider its class before adding a new category value.

## Full Vocabulary Reference

All active class values across all layers:

| class           | module                                 |
| --------------- | -------------------------------------- |
| `monograph`     | Library                                |
| `article`       | Library                                |
| `essay`         | Library                                |
| `thesis`        | Library                                |
| `report`        | Library                                |
| `chapter`       | Library                                |
| `collection`    | Library                                |
| `entry`         | Library                                |
| `lecture`       | Library                                |
| `interview`     | Library                                |
| `review`        | Library                                |
| `record`        | Library                                |
| `periodical`    | Library                                |
| `publication`   | Publication                            |
| `volume`        | Publication                            |
| `edition`       | Publication                            |
| `column`        | Publication                            |
| `story`         | Creative                               |
| `manuscript`    | Creative                               |
| `scene`         | Creative                               |
| `person`        | Core, shared with Library and Creative |
| `organization`  | Core, shared with Creative             |
| `belief-system` | Core, shared with Creative             |
| `place`         | Core, shared with Library and Creative |
| `artifact`      | Core, shared with Creative             |
| `event`         | Core, shared with Library and Creative |
| `timeline`      | Core, shared with Library and Creative |
| image           | Core                                   |
| `archive`       | System                                 |

## State Taxonomy: `stage` and domain-scoped status

The Apparatus uses two distinct state mechanisms:

- `stage` describes pipeline position: where a note sits in the editorial or production workflow.
- `*domain*-status` describes the current state of a note within its domain.

The authoritative vocabulary and usage rules for all domain-scoped status properties live in [[Apparatus Status Taxonomy]]. This document remains authoritative for `class`, `category`, and `affiliations`; the status document is authoritative for domain statuses and their vocabulary.

The canonical status properties are:

- **`catalog-status`**: processing or cataloging state for library records, work indexes, and ingest-oriented notes.
- **`release-status`**: release-readiness for content moving toward publication — scoped to `edition` and `column`. Not used for the `publication` masthead or `volume`.
- **`editorial-status`**: development state for `manuscript` and `scene` notes — drafts and creative work in progress. This covers the story development stages for all but `serial-draft`.
- **`serial-status`**: development state for `serial-draft` manuscript and `scene` notes.
- **`story-status`**: project-container lifecycle for `story` notes — whether the work as a whole is still active, distinct from the progress of any individual draft pass.
- **`archive-status`**: preservation or lifecycle state for archival and system-level notes.
- **`workflow-status`**: operational state for admin/ops container notes — project boards and tracking documents not tied to a specific content domain. Not used for `story`.

**`stage`** remains a separate classifier. It answers the question “where is this note in the pipeline?” and is used for editorial positions such as `serial-draft`, `reassembly`, `1st-edit`, `2nd-edit`, and `final`. By contrast, `*domain*-status` answers the question “what is the current state of this note in its domain?” and uses the vocabulary defined in [[Apparatus Status Taxonomy]].

### Status Guidelines

- Use `catalog-status` for library and cataloging workflows.
- Use `release-status` for edition- and column-level publication readiness.
- Use `editorial-status` for manuscript- and scene-level creative drafting and revision.
- Use `serial-status` for manuscript- and scene-level creative drafting in the serial stage.
- Use `story-status` for the overall lifecycle of a story project.
- Use `archive-status` for archival or preservation contexts.
- Use `workflow-status` for admin/ops project tracking outside any specific content domain.
- Do not use generic `status` as a fallback.
- When a status property needs to be defined or extended, update the [[Apparatus Status Taxonomy]] rather than inventing a local variant.

This taxonomy is the load-bearing foundation of the Apparatus. Dataview queries, pipeline logic, cross-vault portability, and module isolation all depend on the integrity of these values. The domain-status vocabulary in [[Apparatus Status Taxonomy]] is the normative reference for those values.

## Document Updates

| Date | Change |
| ---- | ------ |
| 2026-10-22 | `Entity` now also adds `aliases`, alongside `source` and `related`. |
| 2026-10-12 | Revised the entire doc, reorganizing the order in which information is provided. Implemented `Entity` and its associated leaves, integrating the information into `Creative` and `Library`. `Entity` supersedes the proposed World-Building module, which has been removed.                                                                                                                                                                                                                                                                                          |
| 2026-08-17 | Added `periodical` class to the Library module — tracks an entire periodical's run (title → issue → piece), one level above `collection`. Defined its `category` vocabulary: `pulp-magazine` · `literary-magazine` · `trade-journal` · `academic-journal` · `opinion-journal` · `fanzine` · `webzine` · `newsletter` · `newspaper` · `digest` · `magazine`.                                                                                                                                                                                                          |
| 2026-07-22 | Formalized the **World-Building** module. Migrated `character`, `group`, `belief-system` out of Creative; added `location`, `artifact`, `event`, `timeline`. Defined `category` values for all seven classes (several stackable, per-class). Established uniform `affiliations` usage across all seven, mirroring `story`. Deferred status for all seven pending real tracking need. Left migration mechanics (embedded → standalone module) open, to be resolved against a real project.                                                                            |
| 2026-07-22 | Retired `publication-status` in favor of `release-status`, scoped to `edition`/`column`. Added `story-status` for `story`-level project lifecycle. Re-scoped `workflow-status` to admin/ops container notes only, not `story`. Added `volume` class (Publication). Added `manuscript` class (Creative), replacing the placeholder `class: workflow` on Longform project notes. Added `category` values for `story` (length/form, plus stackable `cycle`). Confirmed this taxonomy is Calamity-instance-specific, not framework-portable across all LVNACY instances. |
| 2026-03-17 | Initial vault and module taxonomy spec drafted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |