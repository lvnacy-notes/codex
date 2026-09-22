---
class: archive
category:
  - specification
affiliations:
created: 2026-08-31
modified: 2026-08-31
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
tags:
---
This document is the authoritative reference for the `affiliations` property across the Apparatus: its governing definition, the boundary separating it from relational fields, and the canonical namespace vocabulary built on top of it.

This document is paired with [[Apparatus Module Taxonomy]] and [[Apparatus Status Taxonomy]]. Those documents remain authoritative for `class`/`category` and domain-scoped status properties, respectively; this document is authoritative for `affiliations` and its namespace vocabulary.

## Contents
---
```toc
```

## 1. Governing Definition
---

`affiliations` is a many-to-many, non-resolving string tag array naming a **concept or grouping** a note participates in — not a pointer to another note.

- **Never resolves to a real note.** A value in `affiliations` carries no expectation that a backing note exists, now or ever. This distinguishes it categorically from every relational field in the Apparatus (`related`, `source`, `part-of`, `possessor`, `founder`, `participants`, etc.), all of which are typed, resolvable pointers between two specific notes.
- **Describes shared context, not a specific pairwise link.** `affiliations` answers "what broader concept, world, or grouping does this note belong to?" — not "which other specific note does this note connect to?" The latter question is always a relational field's job.
- **Reserved specifically for concepts deliberately not reified as their own note.** This is the operative boundary — see §2.

## 2. The Governing Rule (Reification Test)
---

> If the grouping in question is, or should be, its own real note — an `Organization`, `Belief-System`, `Timeline`, `Event`, `Place`, or any other addressable class — the connection belongs in a relational field pointing at that note, not in `affiliations`. `affiliations` is reserved for concepts too loose, too informal, or not worth the overhead of a dedicated object.

Worked example: a character's membership in "the Thieves' Guild." If the Thieves' Guild has, or should have, its own `Organization` note, that membership belongs in `part-of` — not `affiliations`. If the grouping in question is a loose narrative concept nobody intends to formalize as its own note — "characters caught up in the redemption arc," "works discussing the Dust Bowl" — that is where `affiliations` earns its keep.

This rule disciplines every namespace in this document: **anything that could plausibly graduate into a real note is rejected outright as a namespace candidate**, regardless of how convenient it might seem in the short term.

### 2.1 Two Distinct Reasons a Concept Belongs in `affiliations`

A namespace clears the reification test for one of two different reasons, worth distinguishing explicitly:

- **Permanently unreifiable.** The concept's identity is inherently informal or emergent — it has no definitional center a note would require (a founder, a charter, a bounded membership, a settled geography). There is no version of it that ever becomes a note. Example: `cohort.milieu.` — a scene like "goth" organizes its own participants loosely and resists exactly the kind of pinning-down an `Organization` note would demand.
- **Not-yet-reified.** The concept *could* become a note later, once a curator has accumulated enough content, context, or objects to define it properly. `affiliations` serves as the staging ground before that graduation happens. Example: `geographic.` — a regional identity may sharpen over time into a specific `Place` note. `ideological.` fits the same pattern, sharpening into a `Belief-System`.

This distinction matters for curator guidance: a not-yet-reified value is a candidate for eventual promotion, while a permanently-unreifiable one should never be second-guessed as "needing" a note it will never actually get.

Not every not-yet-reified namespace promotes the same way. Three distinct promotion shapes are documented in this vocabulary:

- **One-to-one graduation.** The affiliation value *is* the same concept that eventually becomes the note — it just starts underspecified (`geographic.`→`Place`, `ideological.`→`Belief-System`).
- **Soft, non-directional destination.** A plausible eventual note exists, but the relationship isn't asserted as guaranteed or strictly one-way (`era.`↔`Timeline`, `occasion.`→`Event`). Treat these as open rather than assuming a clean supersession.
- **Combination destination.** The value doesn't graduate on its own — it combines with other namespace values on the same population, and it's the *cluster* that may eventually justify a note (`customs.`, alongside `ideological.` and `cohort.milieu.`, potentially justifying a `Belief-System` or `Organization`).

### 2.2 Relationship to Existing Documented Usage

[[Apparatus Module Taxonomy]] already documents one confirmed use of `affiliations`: naming the series or shared world a note belongs to (e.g. `Conglomerate`, `PLEROMA`), applied uniformly across `story` and all seven World-Building classes, left empty when no shared world applies. This usage is consistent with §1/§2 above — a series or shared world is a context/grouping, not a specific note, and is not itself reified as a note anywhere in the Apparatus. This document formalizes that existing usage as the `world.` namespace (§3) and extends the same governing principle into the fuller vocabulary below.

## 3. Namespace Vocabulary
---

The following namespace set is scoped to `Entity` (see [[Entity.js Specification Worksheet]]) as the first module to receive formal `affiliations` namespacing. Several parent namespaces group related sub-delineations; standalone namespaces carry no children.

### 3.1 `cohort.` — shared experience or circumstance

Groups identities formed by shared experience or circumstance rather than by belief, occupation, or a single specific place.

| Namespace | Reason | Description |
| --- | --- | --- |
| `cohort.milieu.` | Permanently unreifiable | A cultural, class, or lifestyle scene with no definitional center — no founder, charter, or bounded membership (e.g. "goth," "court society," "the criminal underworld"). Distinguished from `Organization` by the absence of anything to pin down; participants self-organize around a loose, informal identity rather than a structured one. |
| `cohort.generation.` | Permanently unreifiable | A shared identity from having come of age in, or lived through, the same period (e.g. "the war generation," "children of the collapse") — people shaped by a period, distinct from `era.` (§3.5), which tags the period itself. |
| `cohort.diaspora.` | Permanently unreifiable | A population's shared identity as displaced — from a place *or* from a group — rather than a population defined by presence in one (e.g. "of the sunken isles," "the exiled," "cast out of the guild"). Not limited to geographic displacement. The displacement identity itself never becomes a note: a `Place`/`Organization`/`Event` note describing the origin, if one is ever written, documents the origin, not the diaspora — the shared identity of separation persists regardless. Same shape as `cohort.milieu.` (a self-organizing identity with no definitional center), inverted — belonging vs. separation. |

### 3.2 `vocation.` — what a person does for work

Groups identities describing what a person does for work.

| Namespace | Reason | Description |
| --- | --- | --- |
| `vocation.trade.` | Permanently unreifiable (diffuse case) / not-yet-reified (structured case) | A specific skill or craft used to produce goods or services, functional/pragmatic in orientation (e.g. "smiths," "the dockworkers") — too diffuse to be an `Organization` when there's no guild hall or membership roll. |
| `vocation.craft.` | Permanently unreifiable (diffuse case) / not-yet-reified (structured case) | Adjacent to `vocation.trade.`, but artisanal or artistic in orientation rather than purely functional (e.g. "glassblowers," "the illuminators"). |
| `vocation.occupation.` | Permanently unreifiable | Any work or job engaged in to earn a living — the broadest of the four `vocation.*` children, for cases too general to fit `trade`/`craft`/`profession`'s more specific connotations. |
| `vocation.profession.` | Permanently unreifiable (diffuse case) / not-yet-reified (structured case) | A specialized occupation requiring specific knowledge, skills, and training (e.g. "physicians," "the scribes") — distinguished from `trade`/`craft` by its formal-training threshold. |

**Deliberate overlap with `Person.occupation`** (a stored free-text field, per [[Entity.js Specification Worksheet]]): `occupation` names one specific job precisely; `vocation.*` allows looser, broader, or multiple simultaneous groupings (e.g. someone whose `occupation` is "blacksmith" might also carry `vocation.trade.` alongside a `vocation.craft.` tag if their work leans artisanal). The elasticity is worth the duplication — not an oversight.

### 3.3 `narrative.` — a note's participation in the story

Groups a note's participation in the story in some general sense, distinct from a Work-tier note's own catalogued content.

| Namespace | Reason | Description |
| --- | --- | --- |
| `narrative.plot.` | Permanently unreifiable | A story-structural thread, arc, subplot, or through-line a note participates in (e.g. "the redemption arc," "the heist subplot"). |
| `narrative.thematic.` | Permanently unreifiable | Shared symbolic or thematic material connecting entities in ways not otherwise obvious (e.g. "corruption," "found family," "the sea as memory"). Distinguished from Work-tier `themes`: `themes` draws out a catalogued work's own content directly, and makes sense there because a Work carries specific themes to surface; `narrative.thematic.` instead surfaces cross-entity resonance that wouldn't otherwise be visible and isn't clear enough to necessitate its own dedicated property — it wouldn't make sense as a property on `Person`, for instance, the way `themes` makes sense on a Work. |

### 3.4 `linguistic.` — shared language identity

Groups shared-language identity, independent of `geographic.` even under complete overlap with a region — no region is ever linguistically narrowed to a single language, and a language can span multiple regions.

| Namespace | Reason | Description |
| --- | --- | --- |
| `linguistic.dialect.` | Permanently unreifiable | A regional or group-specific variation of a shared language (e.g. "the border creole," "old-tongue speakers"). |
| `linguistic.sociolect.` | Permanently unreifiable | A language variety tied to social class or in-group status rather than region (e.g. "court speech," "street slang") — distinguishes *who you're around* from *where you're from* as the driver of linguistic variation. |
| `linguistic.cant.` | Permanently unreifiable | A specialized in-group vocabulary used for secrecy or trade-specific communication (e.g. "thieves' cant," "sailor's argot"). Overlap with `cohort.milieu.` may be complete in a given case — kept as its own namespace regardless, since it still provides useful information up front about the milieu, and gives cohesion to the system if language is being tracked elsewhere. |
| `linguistic.fusion.` | Permanently unreifiable | A contact language or variety formed from the blending of two or more languages — distinct from `linguistic.dialect.` because it's not a variation *of* one language but a fusion *between* languages. |

### 3.5 `temperament.` — shared behavioral and perceptual identity

Groups a note's shared behavioral and perceptual identity — what a group of notes has in common by way of habit, admirable trait, or reputation. Named to avoid `character.`, which collides with the existing World-Building `character` class.

| Namespace | Reason | Description |
| --- | --- | --- |
| `temperament.vice.` | Permanently unreifiable | An informal association through shared habit or indulgence (e.g. "drinkers," "gamblers," "the opium dens' regulars"). Deliberately paired with `temperament.virtue.` — the two are not represented one without the other. |
| `temperament.virtue.` | Permanently unreifiable | An informal association through a shared admirable trait or practice (e.g. "the temperate," "known for mercy," "the steadfast") — the positive counterpart to `temperament.vice.`. |
| `temperament.reputation.` | Permanently unreifiable | Colloquial/reputational identity distinct from any formal fact about the note (e.g. "known as a coward," "the people's hero," "spoken of as cursed") — often downstream of `temperament.vice.`/`temperament.virtue.`, but not the same axis: a note can carry a reputation for something it doesn't actually do. |

### 3.6 Standalone Namespaces

Namespaces with no children, each cleared independently against the reification test.

| Namespace | Reason | Description |
| --- | --- | --- |
| `geographic.` | Not-yet-reified (one-to-one) | A loose regional or cultural-geographic identity not yet tied to one specific `Place` note (e.g. "of the borderlands," "coastal folk"). May graduate to a `Place` note once enough content, context, and objects accumulate to define the region clearly. |
| `ideological.` | Not-yet-reified (one-to-one) | A stance, sympathy, or leaning too informal or unstructured to justify its own `Belief-System` note yet (e.g. "sympathetic to the rebellion," "secular humanist outlook"). May graduate to `Belief-System` once the ideology is sufficiently defined. |
| `world.` | Permanently unreifiable | Series or shared-world identity (e.g. `Conglomerate`, `PLEROMA`) — the pre-existing usage documented in [[Apparatus Module Taxonomy]], formalized here as an explicit namespace. |
| `lineage.` | Permanently unreifiable, pending Apparatus capability | Ancestral or hereditary identity not tracked as a formal genealogy record (e.g. "of the old blood," "descended from the coastal clans"). **Flagged for future elevation:** if `lineage.` sees substantial real use, it should be considered for promotion to a proper relational field (a formal genealogy mechanism) rather than remaining a namespace indefinitely. |
| `kinship.` | Permanently unreifiable | Found or chosen family — a bond that functions like kinship without descent (e.g. "raised together in the guild," "sworn-siblings"). Distinguished from `lineage.` (blood/heritage) and from the real relational field `allies` (a specific pairwise Person-to-Person link) — `kinship.` is a shared, many-to-many bond-of-belonging, not a specific asserted alliance and not a bloodline. |
| `condition.` | Permanently unreifiable | A shared circumstantial or situational state affecting a group of people (e.g. "the afflicted," "the displaced," "the indebted") — describes what has happened to a group, not a system-tracked lifecycle state. Distinct from `Artifact.condition` (a physical-state property on that leaf, unrelated in kind — different tier, different note class, different kind of thing entirely). |
| `aesthetic.` | Permanently unreifiable | A stylistic or sensory scene, most naturally applied to objects and places rather than people (e.g. "art deco," "brutalist"). Same self-organizing-scene shape as `cohort.milieu.`, applied to a different kind of note. |
| `enterprise.` | Permanently unreifiable | A market or economic scene a note moves through (e.g. "black market circles," "the luxury trade crowd") — the identity is the *scene itself*, not a specific occupation. Distinguished from `vocation.trade.` by that emphasis: `vocation.trade.` names what a person does for a living; `enterprise.` names the economic milieu they move within, regardless of what they personally do there. Deliberately adjacent to `cohort.milieu.` — the economic-flavored case of the same self-organizing-scene shape, the way `aesthetic.` is the stylistic-flavored case. |
| `customs.` | Not-yet-reified (combination) | Adherence to a shared ritual or practice, without the theological/philosophical commitment `ideological.` implies (e.g. "those who observe the old rites," "keepers of the harvest customs") — practice-based rather than belief-based. Distinct promotion shape: rather than sharpening alone, `customs.` more plausibly *combines* with `ideological.` and `cohort.milieu.` on the same population — once all three cluster consistently enough, that combination may justify formalizing a `Belief-System` or `Organization` note. |
| `era.` | Not-yet-reified (soft destination) | An informal, loosely-bounded time period not formalized as its own `Timeline` (e.g. "the old world," "pre-collapse," "the long winter"). The relationship to `Timeline` isn't strictly directional — an `era.` value may sharpen into a `Timeline` note, or a `Timeline` may instead sit inside a broader `era.` Adjacent to `cohort.generation.` but distinct: `era.` tags the period itself; `cohort.generation.` tags people shaped by having lived through it. |
| `occasion.` | Not-yet-reified (soft destination) | Something tied to a single moment or gathering too minor or informal to warrant its own `Event` note (e.g. "the night everything changed," "the last gathering before the war") — distinct from `era.` in scope (a moment, not a span). May sharpen into an `Event` note, but this is not a guaranteed destination. |

## 4. Rejected Candidates
---

Logged for reference — these were considered and explicitly ruled out during this vocabulary's development.

| Namespace | Reason for rejection |
| --- | --- |
| `project.` | Real-world authorial/production grouping, not an in-fiction concept at all; doesn't fit the Entity namespace space. |
| `narrative.role.` | Collided with the already-stored `Person.role` field. Unlike `vocation.`/`Person.occupation`'s deliberate overlap (§3.2), this one wasn't judged worth keeping. |

## 5. Change Log
---

| Date | Change |
| ---- | ------ |
| 2026-08-31 | Finalized from the working `Affiliations.md` worksheet into a formal specification, paired with [[Apparatus Module Taxonomy]] and [[Apparatus Status Taxonomy]]. Established the governing definition and reification test for `affiliations`, and the full `Entity`-scoped namespace vocabulary: `cohort.*`, `vocation.*`, `narrative.*`, `linguistic.*`, `temperament.*`, plus standalone `geographic.`, `ideological.`, `world.`, `lineage.`, `kinship.`, `condition.`, `aesthetic.`, `enterprise.`, `customs.`, `era.`, `occasion.`. Explicitly excludes the `ally.`/`rival.`/`subject.` namespace pattern previously drafted in [[Entity.js Specification Worksheet]] — that pattern points at specific notes by name rather than tagging a concept/grouping, conflicts with this document's governing rule, and is being redesigned separately, outside this document's scope. |