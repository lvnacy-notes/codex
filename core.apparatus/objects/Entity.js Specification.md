---
class: archive
category:
  - specification
affiliations:
created: 2026-08-31
modified: 2026-08-31
object: Entity.js
modal: EntityModal.js
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Affiliations Taxonomy]]"
  - "[[Aggregate.js Specification]]"
  - "[[Works.js Specification]]"
  - "[[Image.js Specification]]"
tags:
---
Spec for `Entity.js`: its shared shape, `Constituent`, and the seven core leaves (`Person`, `Organization`, `Belief-System`, `Place`, `Artifact`, `Event`, `Timeline`).

This document defines `Entity`'s own contract only. A module building its own entity classes (e.g. a `LibraryEntity`, a `CreativeEntity`) extends this shape independently, in its own specification document, the same way [[Collection.js Specification]]/[[Periodical.js Specification]] each extend and specify their own particulars on top of [[Aggregate.js Specification]].

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

- `Entity.js` extends `BaseClass` directly. Location: `.obsidian/apparatus/lib/objects/Entity.js`, with `EntityModal.js` at `.obsidian/apparatus/lib/modals/EntityModal.js`.
- Represents a referenceable "thing" — a person, place, organization, belief system, artifact, event, or timeline — that other notes point to via wikilink or `affiliations`, as distinct from a citable Work.
- `Entity.js` itself is never instantiated directly. No `apparatus-create-entity.js` command.
- `categoryOptions()` is not overridden at the `Entity` or `Constituent` tier — inherits `BaseClass`'s `null` default. Category vocabulary is always defined at the leaf tier.
- `Entity.resolveFolder()` is not overridden — inherits `BaseClass`'s default (active file's parent, unscoped), the same pattern `Image.js` uses as a generic, directly-instantiable middle-tier class. Each of `Entity`'s seven leaves is directly instantiable, with its own creation command, following that same precedent.
- A module extending this shape (its own `*Entity` class) may override folder resolution, `source`'s resolution strictness, or any other module-specific particular; those extensions live in that module's own specification document, not here.

### 1.1 `Constituent`

- Abstract middle tier shared by `Person`, `Organization`, and `Belief-System` — the three leaves that can belong to, or have belonging to them, another entity.
- `Constituent.js` extends `Entity` directly. Location: `.obsidian/apparatus/lib/objects/Constituent.js`, modal at `.obsidian/apparatus/lib/modals/ConstituentModal.js`. Never instantiated directly.
- Does not return one fixed frontmatter field set. Exposes `part-of`/`membership`/`founder`/`founded`/`possessions`/`events` as independent, optionally-invoked field definitions and modal builder methods (§8) — see §9 for which leaf uses which.
- Folder resolution not overridden — inherits `Entity`'s default.
- A module building its own `Constituent` extension (e.g. a `LibraryConstituent`) extends that module's own `*Entity` class directly, not core `Constituent` — single inheritance rules out extending both. That module's own specification document defines its own `Constituent` extension.

## 2. Frontmatter Fields
---

**Fields contributed by `Entity.js`** — inherited by every leaf:

| Field | Type | Resolution |
| --- | --- | --- |
| `source` | wikilink array | Eager. Strictness is not fixed here — see §10. |
| `related` | wikilink array | Eager-lenient (`resolveNoteLinksLenient()`). |

`class`, `category`, `affiliations`, `created`, `modified`, `context`, `tags` are standard via `BaseClass`.

**Fields contributed by `Constituent`**:

| Field | Type | Resolution | Curator-enterable? |
| --- | --- | --- | --- |
| `part-of` | wikilink array | Eager-strict | Yes — the sole curator-enterable side. |
| `membership` | wikilink array | — | No. Cascade-only; reverse of `part-of`. |
| `founder` | wikilink array | Eager-lenient. Triple-class allowance: `Person`/`Organization`/`Belief-System`. | Yes — on `Organization`/`Belief-System` only. |
| `founded` | wikilink array | — | No. Cascade-only; reverse of `founder`. |
| `possessions` | wikilink array | — | No. Cascade-only; reverse of `Artifact.possessor`. |
| `events` | wikilink array | — | No. Cascade-only; reverse of `Event.participants`. |

## 3. Status Field
---

No `Entity` leaf carries a status field. None has an analogous lifecycle to track.

## 4. Body Content
---

`getBody()` composes five sub-methods, in fixed order, joined with a blank line and filtered to drop any that return an empty string:

```
getBody() {
	return [
		this.getBodyIntroduction(),
		this.getBodyDashboard(),
		this.getBodyHistory(),
		this.getBodyAccessory(),
		this.getBodyFreeform(),
	].filter(Boolean).join('\n\n');
}
```

No leaf overrides the composition itself — only individual sub-methods, where needed.

- **`getBodyIntroduction()`** — fixed `## Summary` heading with a blank prose area beneath it. No leaf varies this.
- **`getBodyDashboard()`** — shared, unchanged across every leaf. Queries only fields universal to all seven leaf types: a `source` table, a `related` table, and an `affiliations`-by-namespace breakdown, grouping the note's own `affiliations` values by the [[Apparatus Affiliations Taxonomy]] category prefixes (`cohort.*`, `vocation.*`, `narrative.*`, `linguistic.*`, `temperament.*`, plus the standalone namespaces).
- **`getBodyHistory()`** — dedicated section for backstory, provenance, or historical development. Empty prose scaffold by default; not overridden by any leaf.
- **`getBodyAccessory()`** — leaf-overridable. Holds every relational field that isn't universal across all seven leaves — see §9 for content per leaf.
- **`getBodyFreeform()`** — fixed `## notes` heading with a blank prose area beneath it.

## 5. Cross-Object Relational Population
---

The rows below describe how a leaf's own `postCreate()` populates relational fields on other, already-existing notes. See §10 for this mechanism's naming/scope status relative to the Library module's own Accession mechanism.

| Row | Resolves | Pushes into | Target field | Source value |
| --- | --- | --- | --- | --- |
| 1 | Every wikilink in this note's own `part-of` | Each resolved `Organization`/`Belief-System` | `membership` | This note's own wikilink |
| 2 | A named `Person` in this note's own `allies`/`rivals`, at creation time only | The resolved `Person` | `allies`/`rivals` (whichever field matched) | This note's own wikilink |
| 3 | Every wikilink in this note's own `participants` (`Event` only) | Each resolved `Person`/`Organization` | `events` | This note's own wikilink |
| 4 | The wikilink in this note's own `timeline`, if set (`Event` only) | The resolved `Timeline` | `events` | This note's own wikilink |
| 5 | Every wikilink in this note's own `possessor` (`Artifact` only) | Each resolved `Person`/`Organization` | `possessions` | This note's own wikilink |
| 6 | Every wikilink in this note's own `founder` (`Organization`/`Belief-System` only) | Each resolved `Person`/`Organization`/`Belief-System` | `founded` | This note's own wikilink |

- Row 1 resolves strictly (throws on an unresolved link); rows 2–6 resolve leniently — an unresolvable target at creation time logs rather than throws, since not every referenced note necessarily exists yet.
- Row 2 is the only reciprocal push in this table: both `allies` and `rivals` are independently curator-enterable on every `Person`, and creating a new `Person` that names an existing one pushes back into that existing note's matching field. Every other row is one-sided — one curator-enterable field, one cascade-only field receiving the push.
- Every push is duplicate-safe (string-diff dedupe) and throw-and-log on failure; a failed push does not block the primary note's creation.

## 6. Relational Field Resolution
---

| Field(s) | Resolution |
| --- | --- |
| `related`, `allies`, `rivals`, `founder`, `possessor` | Eager-lenient (`resolveNoteLinksLenient()`/`resolveNoteLinkLenient()`). |
| `source` | Eager. Strictness not fixed here — see §10. |
| `part-of` | Eager-strict. |
| `origin` (Artifact), `region` (Belief-System) | `resolveOptionalNoteTitle()` — free text passes through untouched; a bracketed value resolves and throws on failure. |
| `membership`, `founded`, `possessions`, `events` | Not resolved directly — cascade-only fields, populated as-written by the pushes in §5. |

## 7. Category Vocabulary — Leaf Summary
---

| Leaf | Structure | Values |
| --- | --- | --- |
| `Person` | Partial — one confirmed axis, rest undefined | Real/fictional axis (naming undecided) |
| `Organization` | Open-ended list | `family`, `faction`, `political-party`, `guild` |
| `Belief-System` | Four axes, two conditional on a third | Domain (pick-one): `political`/`religious`. Political sub-axis (shown only when `political` is selected): `first-party`/`third-party`/`independent`. Religious sub-axis (shown only when `religious` is selected): `mainstream`/`denomination`/`cult`/`individual`. Ethical leaning (stackable, independent of domain): `benevolent`/`benevolent-neutral`/`neutral`/`neutral-malevolent`/`malevolent`. |
| `Place` | Pick-one | `region`/`settlement`/`landmark`/`structure` |
| `Artifact` | Two stackable axes, one pick-one | Nature (stackable): `mundane`/`technological`/`supernatural`. Function (stackable): `weapon`/`relic`/`document`/`tool`. Temperament (pick-one): `cursed`/`blessed`/`neutral`. |
| `Event` | Two stackable axes | Scale: `personal`/`local`/`regional`/`world-historic`. Nature: `war`/`disaster`/`political`/`discovery`/`ritual`. |
| `Timeline` | None | — |

## 8. Modal
---

- `EntityModal.js`: exposes `buildSourceSetting()` and `buildRelatedSetting()`. Any module's own leaf modal extends its own `*Entity` modal, which in turn extends this one.
- `ConstituentModal.js`: exposes `buildPartOfSetting()` and `buildFounderSetting(containerEl)` — each called only by the leaf modals that use the corresponding field. No builder for `membership`/`founded`/`possessions`/`events` — all cascade-only.
- Each of `Entity`'s seven leaves has its own modal, extending `EntityModal.js` (or `ConstituentModal.js`, for `Person`/`Organization`/`Belief-System`) directly, calling only the builders it needs.

## 9. Leaves
---

Every leaf extends `Entity` directly, except `Person`/`Organization`/`Belief-System`, which extend `Constituent`.

### Frontmatter fields by leaf

| Leaf | Field | Type | Resolution |
| --- | --- | --- | --- |
| `Person` | `category` | string array | Controlled vocabulary — see §7. |
| `Person` | `aliases` | string array | Obsidian native property. |
| `Person` | `role` | string | Free text. |
| `Person` | `significance` | string | Free text. |
| `Person` | `occupation` | string | Free text. |
| `Person` | `alignment-ethics` | string | Controlled vocabulary — `lawful`/`neutral`/`chaotic`. |
| `Person` | `alignment-morality` | string | Controlled vocabulary — `good`/`neutral`/`evil`. |
| `Person` | `allies` | wikilink array | Eager-lenient, scoped to `Person`. |
| `Person` | `rivals` | wikilink array | Eager-lenient, scoped to `Person`. |
| `Person` | `part-of` | wikilink array | Via `Constituent`. Eager-strict, scoped to `Organization`/`Belief-System`. |
| `Person` | `founded` | wikilink array | Via `Constituent`. Cascade-only. |
| `Person` | `possessions` | wikilink array | Via `Constituent`. Cascade-only. |
| `Person` | `events` | wikilink array | Via `Constituent`. Cascade-only. |
| `Organization` | `category` | string array | Controlled vocabulary — see §7. |
| `Organization` | `part-of` | wikilink array | Via `Constituent`. Eager-strict, scoped to `Organization`/`Belief-System`. |
| `Organization` | `membership` | wikilink array | Via `Constituent`. Cascade-only. |
| `Organization` | `founder` | wikilink array | Via `Constituent`. Eager-lenient, triple-class: `Person`/`Organization`/`Belief-System`. |
| `Organization` | `founded` | wikilink array | Via `Constituent`. Cascade-only. |
| `Organization` | `possessions` | wikilink array | Via `Constituent`. Cascade-only. |
| `Organization` | `events` | wikilink array | Via `Constituent`. Cascade-only. |
| `Belief-System` | `category` | string array | Controlled vocabulary — see §7. Requires new conditional modal logic (§10). |
| `Belief-System` | `date-start` | date | Optional. |
| `Belief-System` | `date-end` | date | Optional; absence implies a single point rather than a range. |
| `Belief-System` | `region` | wikilink or string | `resolveOptionalNoteTitle()`, scoped to `Place`. |
| `Belief-System` | `part-of` | wikilink array | Via `Constituent`. Eager-strict, scoped to `Organization`/`Belief-System`. |
| `Belief-System` | `membership` | wikilink array | Via `Constituent`. Cascade-only. |
| `Belief-System` | `founder` | wikilink array | Via `Constituent`. Eager-lenient, triple-class. |
| `Belief-System` | `founded` | wikilink array | Via `Constituent`. Cascade-only. |
| `Place` | `category` | string array | Controlled vocabulary — see §7. |
| `Artifact` | `category` | string array | Controlled vocabulary — see §7. |
| `Artifact` | `possessor` | wikilink array | Eager-lenient, dual-class: `Person`/`Organization`. May be empty. |
| `Artifact` | `origin` | wikilink or string | `resolveOptionalNoteTitle()`, `NoteSuggest`-scoped to `Person`/`Place`/`Organization` in the modal. |
| `Artifact` | `condition` | string | Controlled vocabulary — `intact`/`damaged`/`lost`/`destroyed`/`unknown`/`hidden`. |
| `Event` | `category` | string array | Controlled vocabulary — see §7. |
| `Event` | `date-start` | date | Always present. |
| `Event` | `date-end` | date | Optional; absence implies a single-day/point event. |
| `Event` | `participants` | wikilink array | Eager-lenient, dual-class: `Person`/`Organization`. |
| `Event` | `places` | wikilink array | Eager-lenient, scoped to `Place`. |
| `Event` | `timeline` | wikilink (singular) | Eager-lenient, scoped to `Timeline`. |
| `Timeline` | `category` | — | None. |
| `Timeline` | `events` | wikilink array | Cascade-only, populated from `Event.timeline`. |
| `Timeline` | `date-start` | date | Same shape as `Event`; describes the Timeline's own overall span. |
| `Timeline` | `date-end` | date | Same shape as `Event`. |

### Notes

- `Person` naming convention: last name, first name. No split name fields.
- Time-of-day is out of scope for every `date-start`/`date-end` field in this table — dates only, time left to body prose.
- `Place` containment (a `structure` within a `settlement` within a `region`) and `Timeline`'s subject-tracing (whose arc/history it traces) both use `related` rather than a dedicated field.
- `Artifact.possessor` records current possession only; provenance/possession history lives in `getBodyHistory()`, not frontmatter.

### `getBodyAccessory()` content by leaf

| Leaf | Content |
| --- | --- |
| `Person` | Tables for `allies`, `rivals`, `part-of`, `possessions`, `founded`. |
| `Organization` | Tables for `part-of`, `membership`, `founder`, `founded`, `possessions`. |
| `Belief-System` | Postulates/doctrine prose, tables for `part-of`, `membership`, `founder`, `founded`, and an adherent list (Dataview, pulling fields off each `Person` linked via `membership`). |
| `Place` | Not overridden — nothing leaf-specific beyond `getBodyDashboard()`. |
| `Artifact` | Table for `possessor`. |
| `Event` | Table for `participants`/`places`/`timeline`. |
| `Timeline` | Table for `events`. |

## 10. Open Items
---

- **`source`'s resolution strictness is not fixed at this tier.** Left to whichever concrete `*Entity` extends this shape to decide.
- **The mechanism in §5 is Accession-shaped but not formally Accession.** [[Accession Specification]] scopes Accession explicitly to the Library module. Whether a module extending this shape should describe its own version of §5 as a formal use of Accession, or as a distinct, separately-named mechanism sharing its mechanics, is that module's own decision to make in its own specification document.
- **`Belief-System.category`'s domain-conditional sub-axes require new modal logic.** No existing `buildCategorySetting()`/`buildMultiSelectSetting()` pattern in this system supports a sub-axis that only appears once a parent axis value is selected.
- **`Person.category`'s vocabulary is incomplete.** Only the real/fictional axis is confirmed, and even its two value names are provisional.
- **`Organization.category`'s vocabulary is open-ended by design** — `family`/`faction`/`political-party`/`guild` is a starting set, not a closed list.

## 11. Change Log
---

| Date | Change |
| ---- | ------ |
| 2026-08-31 | Initial specification. Scoped to `Entity`'s own contract only — module-specific extensions (their own `*Entity`, `*Constituent`, and leaf classes) are out of scope for this document and belong in their own specification documents. §5 and §9 follow [[Works.js Specification]]'s tabular convention: one master table per section, with brief prose notes after rather than a subsection per leaf. |