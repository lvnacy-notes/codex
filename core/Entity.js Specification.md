---
class: archive
category:
  - specification
affiliations:
created: 2026-08-31
modified: 2026-11-01
object: Entity.js
modal: EntityModal.js
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[Apparatus Affiliations Taxonomy]]"
  - "[[Aggregate.js Specification]]"
  - "[[Works.js Specification]]"
  - "[[Image.js Specification]]"
  - "[[Accession Specification]]"
tags:
---
Spec for `Entity.js`: its shared shape, `Constituent`, and the seven core leaves (`Person`, `Organization`, `Belief-System`, `Place`, `Artifact`, `Event`, `Timeline`).

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

- `Entity.js` extends `BaseClass` directly. Location: `.codex/core/objects/Entity.js`, with `EntityModal.js` at `.codex/core/modals/EntityModal.js`.
- Represents a referenceable "thing" — a person, place, organization, belief system, artifact, event, or timeline — that other notes point to via wikilink or `affiliations`, as distinct from a citable Work.
- `Entity.js` itself is never instantiated directly. No `core-create-entity.js` command.
- `categoryOptions()` is not overridden at the `Entity` or `Constituent` tier — inherits `BaseClass`'s `null` default. Category vocabulary is always defined at the leaf tier.
- `Entity.resolveFolder()` is not overridden — inherits `BaseClass`'s default (active file's parent, unscoped), the same pattern `Image.js` uses as a generic, directly-instantiable middle-tier class. Each of `Entity`'s seven leaves is directly instantiable, with its own creation command, following that same precedent.
- This document defines `Entity`'s own contract only. A module extending this shape (its own `*Entity` class, e.g. a `LibraryEntity`, a `CreativeEntity`) may override folder resolution, `source`'s resolution strictness, or any other module-specific particular. Those extensions live in that module's own specification document, not here, the same way [[Collection.js Specification]]/[[Periodical.js Specification]] each extend and specify their own particulars on top of [[Aggregate.js Specification]].

### 1.1 `Constituent`

- Abstract middle tier shared by `Person`, `Organization`, and `Belief-System` — the three leaves that can belong to, or have belonging to them, another entity.
- `Constituent.js` extends `Entity` directly. Location: `.codex/core/objects/Constituent.js`, modal at `.codex/core/modals/ConstituentModal.js`. Never instantiated directly.
- Does not return one fixed frontmatter field set. Exposes `part-of`/`membership`/`founder`/`founded`/`possessions`/`events` as independent, optionally-invoked field definitions and modal builder methods (§7) — see §9 for which leaf uses which.
- Folder resolution not overridden — inherits `Entity`'s default.
- A module building its own `Constituent` extension (e.g. a `LibraryConstituent`) extends that module's own `*Entity` class directly, not core `Constituent` — single inheritance rules out extending both. That module's own specification document defines its own `Constituent` extension.

### 1.2 Class Values and Files

| Leaf | `class` value | Object file | Modal file |
| --- | --- | --- | --- |
| `Person` | `person` | `Person.js` | `PersonModal.js` |
| `Organization` | `organization` | `Organization.js` | `OrganizationModal.js` |
| `Belief-System` | `belief-system` | `BeliefSystem.js` | `BeliefSystemModal.js` |
| `Place` | `place` | `Place.js` | `PlaceModal.js` |
| `Artifact` | `artifact` | `Artifact.js` | `ArtifactModal.js` |
| `Event` | `event` | `Event.js` | `EventModal.js` |
| `Timeline` | `timeline` | `Timeline.js` | `TimelineModal.js` |

- Each `class` value is the lowercase form of the leaf's name. A hyphen is not a valid JS identifier, so `Belief-System` is `BeliefSystem` in file and class names while its `class` value stays `belief-system`.
- `Entity` and `Constituent` carry no `class` value.
- Object files sit directly in `.codex/core/objects/` and modal files directly in `.codex/core/modals/`, alongside `Entity.js`, `Constituent.js`, and their modals. There are no leaf subdirectories. One class per file.

### 1.3 Module Loading

- Every file in this specification uses standard ESM `import`/`export`, and every new `Entity` file uses a default export.
- `BaseModal` is a named export and is imported as `import { BaseModal } from ...`.

## 2. Frontmatter Fields
---

**Fields contributed by `Entity.js`** — inherited by every leaf:

| Field     | Type           | Resolution                                                                                                                                                                                                             |
| --------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aliases` | string array   | Obsidian native property. Not resolved.                                                                                                                                                                                |
| `source`  | wikilink array | Eager. Strictness is module-defined — see §1. The seven core leaves resolve it leniently with `resolveNoteLinksLenient()`: an unresolvable link is kept as written and creation continues. The caller adds no logging. |
| `related` | wikilink array | Eager-lenient (`resolveNoteLinksLenient()`).                                                                                                                                                                           |

`class`, `category`, `affiliations`, `created`, `modified`, `context`, `tags` are standard via `BaseClass`.

- `category` is written as an array on every leaf, empty when the leaf carries no vocabulary (`Timeline`).
- `context` is never resolved by `Entity`. It is written raw, as entered.
- `created` is set automatically at instantiation and has no modal field.

**Fields contributed by `Constituent`**:

| Field | Type | Resolution | Curator-enterable? |
| --- | --- | --- | --- |
| `part-of` | wikilink array | Eager-strict | Yes — the sole curator-enterable side. |
| `membership` | wikilink array | — | No. Accession-only; reverse of `part-of`. |
| `founder` | wikilink array | Eager-lenient. Triple-class allowance: `Person`/`Organization`/`Belief-System`. | Yes — on `Organization`/`Belief-System` only. |
| `founded` | wikilink array | — | No. Accession-only; reverse of `founder`. |
| `possessions` | wikilink array | — | No. Accession-only; reverse of `Artifact.possessor`. |
| `events` | wikilink array | — | No. Accession-only; reverse of `Event.participants`. |

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
- **`getBodyDashboard()`** — shared, unchanged across every leaf. Queries only fields universal to all seven leaf types: a `source` table, a `related` table, and an `affiliations` table listing the other notes that share this note's `affiliations`, without repeating the note's own values, sorted by the [[Apparatus Affiliations Taxonomy]] category prefixes (`cohort.*`, `vocation.*`, `narrative.*`, `linguistic.*`, `temperament.*`, plus the standalone namespaces). A note shares an affiliation when its own `affiliations` contains a value recorded in this note's `affiliations`.
- **`getBodyHistory()`** — dedicated section for backstory, provenance, or historical development. Empty prose scaffold by default; not overridden by any leaf.
- **`getBodyAccessory()`** — leaf-overridable. Holds every relational field that isn't universal across all seven leaves — see §9 for content per leaf.
- **`getBodyFreeform()`** — fixed `## notes` heading with a blank prose area beneath it.

Dashboard and Accessory tables are Dataview queries in the minimal form `TABLE WITHOUT ID file.link AS Title, <field> AS <Label>`, for example `source AS Source` or `allies AS Allies`. Each table is one of two kinds. Table A lists the notes in this note's own field (`WHERE contains(this.<field>, file.link)`). Table B lists the notes whose own `<field>` links to this note (`WHERE contains(<field>, this.file.link)`), which surfaces links that are not reciprocated. `source`, `related`, `allies`, and `rivals` use Table B.

Every Accession-only field gets both tables. Table A shows what Accession pushed. Table B queries the counterpart field that points at this note, so a push that Accession missed appears as a difference between the two.

| Accession-only field | Counterpart queried by Table B |
| --- | --- |
| `membership` | `part-of` |
| `founded` | `founder` |
| `possessions` | `possessor` |
| `events` | `participants` on `Person`/`Organization`; `timeline` on `Timeline` |

No tables are raised for the other curator-entered fields (`part-of`, `founder`, `possessor`, `participants`, `places`, `timeline`), since frontmatter already shows what they point at. Fuller column sets are deferred until objects have been instantiated.

## 5. Accession
---

The rows below describe how a leaf's own `postCreate()` populates relational fields on other, already-existing notes. This is Accession, per [[Accession Specification]] — a creation-time reverse-edge push from this note's own `postCreate()` into a relational field on an already-existing note.

| Row | Resolves | Pushes into | Target field | Source value |
| --- | --- | --- | --- | --- |
| 1 | Every wikilink in this note's own `part-of` | Each resolved `Organization`/`Belief-System` | `membership` | This note's own wikilink |
| 2 | A named `Person` in this note's own `allies`/`rivals`, at creation time only | The resolved `Person` | `allies`/`rivals` (whichever field matched) | This note's own wikilink |
| 3 | Every wikilink in this note's own `participants` (`Event` only) | Each resolved `Person`/`Organization` | `events` | This note's own wikilink |
| 4 | The wikilink in this note's own `timeline`, if set (`Event` only) | The resolved `Timeline` | `events` | This note's own wikilink |
| 5 | Every wikilink in this note's own `possessor` (`Artifact` only) | Each resolved `Person`/`Organization` | `possessions` | This note's own wikilink |
| 6 | Every wikilink in this note's own `founder` (`Organization`/`Belief-System` only) | Each resolved `Person`/`Organization`/`Belief-System` | `founded` | This note's own wikilink |

- Row 1 resolves strictly (throws on an unresolved link); rows 2–6 resolve leniently — an unresolvable target at creation time logs rather than throws, since not every referenced note necessarily exists yet.
- Rows 2–6 resolve each target with `resolveNoteFileLenient()`, which returns `null` for an unresolvable link and does not log. The caller logs the miss with `Log.error` and skips that push. Row 2's `Person` is a note that already exists, named in `allies`/`rivals`, and the push happens at creation only.
- Row 2 is the only reciprocal push in this table: both `allies` and `rivals` are independently curator-enterable on every `Person`, and creating a new `Person` that names an existing one pushes back into that existing note's matching field. Every other row is one-sided — one curator-enterable field, one Accession-only field receiving the push.
- Every push is duplicate-safe (string-diff dedupe) and throw-and-log on failure; a failed push does not block the primary note's creation.

## 6. Relational Field Resolution
---

| Field(s) | Resolution |
| --- | --- |
| `related`, `allies`, `rivals`, `founder`, `possessor` | Eager-lenient (`resolveNoteLinksLenient()`/`resolveNoteLinkLenient()`). |
| `source` | Eager. Strictness module-defined — see §1. Core leaves: lenient (`resolveNoteLinksLenient()`). |
| `part-of` | Eager-strict. |
| `origin` (Artifact), `region` (Belief-System) | `resolveOptionalNoteTitle()` — free text passes through untouched; a bracketed value resolves and throws on failure. |
| `membership`, `founded`, `possessions`, `events` | Not resolved directly — Accession-only fields, populated as-written by the pushes in §5. |

## 7. Modal
---

### 7.1 `BaseModal` Additions

Two builders are added to `BaseModal`, and two existing builders gain a parameter. All are available to every modal. `BaseModal` remains a named export.

- `buildSingleSelectSetting(containerEl, label, resultKey, options, onChange)` — renders a dropdown with a leading empty option. `result[resultKey]` is an array. On change, it removes every value in `options` from that array, adds the selected value unless the empty option was chosen, then calls `onChange(value)` if one was passed. Values outside `options` are untouched, so several controls can share one array. `onChange` is optional; callers that omit it are unaffected.
- `buildDateSetting(containerEl, label, resultKey)` — renders a native date picker (`type="date"`). Stores a `YYYY-MM-DD` string, or an empty string when left blank. Gregorian dates only.
- `buildListSuggestSetting()` and `buildCategorySetting()` each gain an optional trailing `expectedClass` parameter. `buildCategorySetting()` forwards it to `buildListSuggestSetting()`, which passes it to `ValueSuggest`. `ValueSuggest` already supports `expectedClass` and is unchanged. When omitted, behavior is unchanged for every existing caller.

### 7.2 `EntityModal`

- Exposes `buildSourceSetting(containerEl)` and `buildRelatedSetting(containerEl)`. Both pickers are unrestricted: any note in the vault, with no class or folder restriction. Any module's own leaf modal extends its own `*Entity` modal, which in turn extends this one.
- `onOpen()` does not call `super.onOpen()`. It renders fields in frontmatter order and ends with `buildSubmitButton()`. `category` is rendered by the existing `BaseModal.buildCategorySetting()`. `EntityModal` supplies no object class; each leaf overrides the method, supplying its own class or its own control. One overridable hook, `leafFieldsOverride(containerEl)`, covers the leaf fields. The sequence:
  1. `category` — `buildCategorySetting()`
  2. `affiliations` — `buildListSuggestSetting()`: vault-wide autocomplete that surfaces existing values and still accepts new ones.
  3. `aliases` — `buildListSetting()`
  4. leaf fields — `leafFieldsOverride(containerEl)`
  5. `source`
  6. `related`
  7. `context` — the inherited `buildContextSetting()` note-list picker. Written raw.
  8. `tags` — `buildListSuggestSetting()`
- `class`, `created`, and `modified` have no modal field. Fields with no modal control (the Accession-only fields) are still written to the instantiated object.

### 7.3 `ConstituentModal`

- Exposes `buildPartOfSetting(containerEl)` and `buildFounderSetting(containerEl)` — each called only by the leaf modals that use the corresponding field. No builder for `membership`/`founded`/`possessions`/`events` — all Accession-only.

### 7.4 Leaf Modals

- Each of `Entity`'s seven leaves has its own modal, extending `EntityModal.js` (or `ConstituentModal.js`, for `Person`/`Organization`/`Belief-System`) directly, calling only the builders it needs.
- Every `date-start`/`date-end` field is built with `buildDateSetting()`.
- Each leaf overrides `buildCategorySetting()`, supplying its own object class or its own control.
- `BaseModal` has no required-field validation. The empty-domain block for `Belief-System` lives in `core-create-belief-system.js`. No other field is required.

| Leaf | Category control |
| --- | --- |
| `Person` | Single-select (`real`/`fictional`) via `buildSingleSelectSetting()`. Optional. |
| `Organization` | `buildCategorySetting()`, which renders the comma-separated suggest-backed list because `categoryOptions()` is `null`. Passes its own `class` value as `expectedClass`, so suggestions come from existing `organization` notes only. |
| `Belief-System` | Does not use `buildCategorySetting()`. Three parts, all writing into the one flat `category` array — see below. |
| `Place` | Single-select (`region`/`settlement`/`landmark`/`structure`) via `buildSingleSelectSetting()`. Optional. |
| `Artifact` | Does not use `buildCategorySetting()`. Nature multi-select (`mundane`/`technological`/`supernatural`), function multi-select (`weapon`/`relic`/`document`/`tool`), and a temperament single-select (`cursed`/`blessed`/`neutral`) via `buildSingleSelectSetting()`. Temperament is optional and leaves the other axes' values untouched. |
| `Event` | Does not use the inherited `buildCategorySetting()` behavior. Two stackable multi-selects, as `Artifact` does: scale (`personal`/`local`/`regional`/`world-historic`) and nature (`war`/`disaster`/`political`/`discovery`/`ritual`). |
| `Timeline` | No control. `category` is written as an empty array. |

`BeliefSystemModal.js` builds `category` in three parts:

1. **Domain** — pick-one (`political`/`religious`) via `buildSingleSelectSetting()`, with an `onChange` callback. Holds only the selected domain value in `category`. Required, enforced in the command.
2. **Sub-axis block** — rendered in its own container beneath the domain control. Shows the political multi-select when `political` is selected, the religious multi-select when `religious` is selected, and nothing otherwise. The domain control's `onChange` empties and rebuilds this container and removes the previous sub-axis's values from `category`.
3. **Ethical leaning** — multi-select, always shown, independent of domain.

This logic exists only while the modal is open. Once the object is instantiated, nothing governs `category`; adherence to the taxonomy is up to the curator.

### 7.5 Field Builders

| Field type | Builder | Fields |
| --- | --- | --- |
| Free text | `buildTextSetting()` | `role`, `significance`, `occupation` |
| Controlled-vocabulary string | `buildDropdownSetting()` | `alignment-ethics`, `alignment-morality`, `condition` |
| Wikilink or string, single | `buildNoteLinkSetting()` | `region` (scoped to `Place`), `origin` (scoped to `Person`/`Place`/`Organization`) |
| Single wikilink | `buildNoteLinkSetting()` | `timeline` (scoped to `Timeline`) |
| Wikilink array | `buildNoteListSetting()` | `allies`, `rivals` (`Person`), `participants` (`Person`/`Organization`), `places` (`Place`), `possessor` (`Person`/`Organization`) |
| Constituent fields | `buildPartOfSetting(containerEl)`, `buildFounderSetting(containerEl)` | `part-of`, `founder` |
| Date | `buildDateSetting()` | `date-start`, `date-end` |
| Free-text array | `buildListSetting()` | `aliases` |
| Suggest-backed list | `buildListSuggestSetting()` | `affiliations`, `tags` |
| Accession-only | None. | `membership`, `founded`, `possessions`, `events` |

## 8. Command
---

- `Entity` and `Constituent` have no command; neither is instantiated directly (§1).
- Each leaf has its own command in `.commands/`: `core-create-<leaf>.js`, with the command's `name` property set to `Create <Leaf>`. For `Belief-System`, the file is `core-create-belief-system.js` and the `name` is `Create Belief System`.
- Commands use the plain `callback()` pattern, following the `Image` precedent, not `checkCallback()`.
- No field is required at creation, with one exception: `core-create-belief-system.js` blocks an empty domain, since `BaseModal` has no validation of its own. `Event.date-start` is not required.

## 9. Leaves
---

Every leaf extends `Entity` directly, except `Person`/`Organization`/`Belief-System`, which extend `Constituent`.

### Frontmatter fields by leaf

| Leaf | Field | Type | Resolution |
| --- | --- | --- | --- |
| `Person` | `category` | string array | Controlled vocabulary — see Category vocabulary below. |
| `Person` | `role` | string | Free text. |
| `Person` | `significance` | string | Free text. |
| `Person` | `occupation` | string | Free text. |
| `Person` | `alignment-ethics` | string | Controlled vocabulary — `lawful`/`neutral`/`chaotic`. |
| `Person` | `alignment-morality` | string | Controlled vocabulary — `good`/`neutral`/`evil`. |
| `Person` | `allies` | wikilink array | Eager-lenient, scoped to `Person`. |
| `Person` | `rivals` | wikilink array | Eager-lenient, scoped to `Person`. |
| `Person` | `part-of` | wikilink array | Via `Constituent`. Eager-strict, scoped to `Organization`/`Belief-System`. |
| `Person` | `founded` | wikilink array | Via `Constituent`. Accession-only. |
| `Person` | `possessions` | wikilink array | Via `Constituent`. Accession-only. |
| `Person` | `events` | wikilink array | Via `Constituent`. Accession-only. |
| `Organization` | `category` | string array | Controlled vocabulary — see Category vocabulary below. |
| `Organization` | `part-of` | wikilink array | Via `Constituent`. Eager-strict, scoped to `Organization`/`Belief-System`. |
| `Organization` | `membership` | wikilink array | Via `Constituent`. Accession-only. |
| `Organization` | `founder` | wikilink array | Via `Constituent`. Eager-lenient, triple-class: `Person`/`Organization`/`Belief-System`. |
| `Organization` | `founded` | wikilink array | Via `Constituent`. Accession-only. |
| `Organization` | `possessions` | wikilink array | Via `Constituent`. Accession-only. |
| `Organization` | `events` | wikilink array | Via `Constituent`. Accession-only. |
| `Belief-System` | `category` | string array | Controlled vocabulary — see Category vocabulary below. Built by `BeliefSystemModal.js` per §7. |
| `Belief-System` | `date-start` | date | Optional. |
| `Belief-System` | `date-end` | date | Optional; absence implies a single point rather than a range. |
| `Belief-System` | `region` | wikilink or string | `resolveOptionalNoteTitle()`, scoped to `Place`. |
| `Belief-System` | `part-of` | wikilink array | Via `Constituent`. Eager-strict, scoped to `Organization`/`Belief-System`. |
| `Belief-System` | `membership` | wikilink array | Via `Constituent`. Accession-only. |
| `Belief-System` | `founder` | wikilink array | Via `Constituent`. Eager-lenient, triple-class. |
| `Belief-System` | `founded` | wikilink array | Via `Constituent`. Accession-only. |
| `Place` | `category` | string array | Controlled vocabulary — see Category vocabulary below. |
| `Artifact` | `category` | string array | Controlled vocabulary — see Category vocabulary below. |
| `Artifact` | `possessor` | wikilink array | Eager-lenient, dual-class: `Person`/`Organization`. May be empty. |
| `Artifact` | `origin` | wikilink or string | `resolveOptionalNoteTitle()`, `NoteSuggest`-scoped to `Person`/`Place`/`Organization` in the modal. |
| `Artifact` | `condition` | string | Controlled vocabulary — `intact`/`damaged`/`lost`/`destroyed`/`unknown`/`hidden`. |
| `Event` | `category` | string array | Controlled vocabulary — see Category vocabulary below. |
| `Event` | `date-start` | date | Key always written; value may be empty. Not required at creation. |
| `Event` | `date-end` | date | Optional; absence implies a single-day/point event. |
| `Event` | `participants` | wikilink array | Eager-lenient, dual-class: `Person`/`Organization`. |
| `Event` | `places` | wikilink array | Eager-lenient, scoped to `Place`. |
| `Event` | `timeline` | wikilink (singular) | Eager-lenient, scoped to `Timeline`. |
| `Timeline` | `category` | string array | None. Written as an empty array. |
| `Timeline` | `events` | wikilink array | Accession-only, populated from `Event.timeline`. |
| `Timeline` | `date-start` | date | Same shape as `Event`; describes the Timeline's own overall span. |
| `Timeline` | `date-end` | date | Same shape as `Event`. |

### Notes

- `Person` naming convention: last name, first name. No split name fields.
- Time-of-day is out of scope for every `date-start`/`date-end` field in this table — dates only, time left to body prose.
- `Place` containment (a `structure` within a `settlement` within a `region`) and `Timeline`'s subject-tracing (whose arc/history it traces) both use `related` rather than a dedicated field.
- `Artifact.possessor` records current possession only; provenance/possession history lives in `getBodyHistory()`, not frontmatter.
- Every `date-start`/`date-end` field is written as a `YYYY-MM-DD` string, entered through `buildDateSetting()` (§7).
- Frontmatter order is defined in the table below.

### Frontmatter and modal order

General order, for every leaf: `class`, `category`, `affiliations`, `aliases`, `created`, `modified`, {leaf fields}, `source`, `related`, `context`, `tags`.

Each modal builds its fields in the same order, for every field the modal renders.

| Leaf | Leaf fields, in order |
| --- | --- |
| `Person` | `alignment-ethics`, `alignment-morality`, `role`, `occupation`, `significance`, `part-of`, `allies`, `rivals`, `founded`, `possessions`, `events` |
| `Organization` | `membership`, `part-of`, `founder`, `founded`, `possessions`, `events` |
| `Belief-System` | `date-start`, `date-end`, `region`, `membership`, `part-of`, `founder`, `founded` |
| `Place` | None. |
| `Artifact` | `origin`, `condition`, `possessor` |
| `Event` | `date-start`, `date-end`, `timeline`, `places`, `participants` |
| `Timeline` | `date-start`, `date-end`, `events` |

### `getBodyAccessory()` content by leaf

Table kinds, as defined in §4:

- **Table A** lists the notes in this note's own `<field>` (`WHERE contains(this.<field>, file.link)`).
- **Table B** lists the notes whose own `<field>` links to this note (`WHERE contains(<field>, this.file.link)`). For an Accession-only field, Table B queries the counterpart field listed in §4.
- **"A and B tables"** means both tables are raised for that field.

| Leaf | Content |
| --- | --- |
| `Person` | Table B for `allies`, `rivals`; A and B tables for `possessions`, `founded`. |
| `Organization` | A and B tables for `membership`, `founded`, `possessions`. |
| `Belief-System` | Postulates/doctrine prose; A and B tables for `membership`, `founded`. |
| `Place` | Not overridden — nothing leaf-specific beyond `getBodyDashboard()`. |
| `Artifact` | Not overridden — nothing leaf-specific beyond `getBodyDashboard()`. |
| `Event` | Not overridden — nothing leaf-specific beyond `getBodyDashboard()`. |
| `Timeline` | A and B tables for `events`. |

### Category vocabulary

Cross-referenced with [[Apparatus Module Taxonomy]].

| Leaf | Structure | Values |
| --- | --- | --- |
| `Person` | Pick-one | `real`/`fictional` |
| `Organization` | Open-ended list | Starting values: `family`, `faction`, `political-party`, `guild`. `Organization` does not override `categoryOptions()`, so its modal renders a comma-separated, vault-wide suggest-backed list rather than a closed multi-select. Starting values appear as suggestions once they have been used in the vault. |
| `Belief-System` | Four axes, two conditional on a third | Domain (pick-one, required): `political`/`religious`. Political sub-axis (shown only when `political` is selected): `first-party`/`third-party`/`independent`. Religious sub-axis (shown only when `religious` is selected): `mainstream`/`denomination`/`cult`/`individual`. Ethical leaning (stackable, independent of domain): `benevolent`/`benevolent-neutral`/`neutral`/`neutral-malevolent`/`malevolent`. |
| `Place` | Pick-one | `region`/`settlement`/`landmark`/`structure` |
| `Artifact` | Two stackable axes, one pick-one | Nature (stackable): `mundane`/`technological`/`supernatural`. Function (stackable): `weapon`/`relic`/`document`/`tool`. Temperament (pick-one): `cursed`/`blessed`/`neutral`. |
| `Event` | Two stackable axes | Scale: `personal`/`local`/`regional`/`world-historic`. Nature: `war`/`disaster`/`political`/`discovery`/`ritual`. |
| `Timeline` | None | — |

## 10. Open Items
---

None. Column sets for every table are deferred until objects have been instantiated.

## 11. Change Log
---

| Date | Change |
| ---- | ------ |
| 2026-11-01 | Aligned with [[Apparatus Code Module Specification Template]]. Moved Commands out of §1 into new §8. Moved Category Vocabulary into §9 as a subsection. Moved Modal to §7; §9 Leaves follows Command. Moved the "own contract only" note from the opening into §1. `context` gains [[Apparatus Status Taxonomy]]. |
| 2026-10-22 | Resolved remediation items B3, B4, B5, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, and S11. Moved file locations to `.codex/core/`. Added `aliases` to `Entity` and removed it from `Person`. Fixed frontmatter and modal order per leaf (§9). Added `class` values, file names, commands, and module loading convention (§1.2–§1.4). Added `buildSingleSelectSetting()` and `buildDateSetting()` to `BaseModal` and specified `EntityModal.onOpen()` (§8). Reworded `Event.date-start` and `Timeline.category`. Set leaf file locations (flat in `core/objects/` and `core/modals/`), the `belief-system` command name, lenient `source` on the core leaves, and unrestricted `source`/`related` pickers. Cleared §10. |
| 2026-10-11 | Closed both remaining open items; §10 is now empty. `Belief-System.category`: domain is required and pick-one; `BeliefSystemModal.js` builds `category` as a domain control, a domain-conditional sub-axis block, and an always-shown ethical-leaning multi-select, all writing into one flat array (§7, §8, §9). `Person.category`: finalized as pick-one `real`/`fictional`, with no further axes at this time; `PersonModal.js` enforces pick-one through a single-select control (§7, §8). The same single-select treatment applies to every other pick-one axis: `Place.category` and `Artifact`'s temperament axis (§8). |
| 2026-09-12 | Resolved the "Accession-shaped but not formally Accession" open item. Renamed §5 from "Cross-Object Relational Population" to "Accession" and rewrote its intro to state directly that the mechanism is Accession, per the updated [[Accession Specification]], which no longer scopes Accession to the Library module. Removed the corresponding bullet from §10. |
| 2026-09-05 | Renamed §5 from "Cross-Object Relational Population" to "Accession," per [[Accession Specification]]'s own rewrite to a module-agnostic pattern with no Library-module scoping. Removed the corresponding open item — the mechanism in §5 is Accession, not merely Accession-shaped. |
| 2026-09-05 | Replaced every instance of "Cascade-only" with "Accession-only" throughout, for terminology consistency with the rest of this document. |
| 2026-09-05 | Removed `source`'s resolution strictness from Open Items — it was already settled, not unresolved: §1 states plainly that a module extending this shape decides its own strictness, the same treatment folder resolution gets. Listing it as "open" contradicted §1. Corrected both forward references (§2, §6) to point at §1 instead. |
| 2026-09-05 | Removed `Organization.category`'s open-endedness from Open Items — same pattern as the `source` correction above. §7 already states the vocabulary is open-ended by design; the Open Item was restating that as if it were a gap rather than a settled choice. Confirmed the remaining two items (`Belief-System`'s conditional modal logic, `Person.category`'s incompleteness) are genuinely unresolved — neither is described or settled anywhere else in this document. |
| 2026-08-31 | Initial specification. Scoped to `Entity`'s own contract only — module-specific extensions (their own `*Entity`, `*Constituent`, and leaf classes) are out of scope for this document and belong in their own specification documents. §5 and §9 follow [[Works.js Specification]]'s tabular convention: one master table per section, with brief prose notes after rather than a subsection per leaf. |