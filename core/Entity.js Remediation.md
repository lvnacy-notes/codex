---
class: archive
category:
  - documentation
created: 2026-10-12
modified: 2026-10-22
context:
  - "[[Entity.js Specification]]"
  - "[[Entity Schema]]"
  - "[[Apparatus Module Taxonomy]]"
tags:
---
Pre-build gap analysis for `Entity.js` and its leaves, produced by reviewing [[Entity.js Specification]] (modified 2026-10-11) and [[Entity Schema]] against the code and documents available in the review session. Every item below began as a question or gap, not a decision. Each blocker has a **Decision** line, filled in once resolved. ✅ marks a closed item. B2 arrived marked closed with no decision text, and none is recorded here. B1's decision was recorded on 2026-10-22.

Code facts cite the repo copies available in the review session. Verify any of them that may have changed since.

## Contents
---
```toc
```

## 1. Blockers
---

Resolve these before writing code. Each affects multiple files.

### ✅ B1. Resolvers and the Accession helper live in the Library module, not core

**Problem.** The spec relies on `resolveNoteLinksLenient()`, `resolveNoteLinkLenient()`, `resolveOptionalNoteTitle()`, `resolveNoteFile()`/`resolveNoteFileLenient()`, `resolveNoteTitles()`, `toWikilink()`, and `appendToFrontmatterArray()`. All of them are in `.obsidian/apparatus/library/lib/controls/`. `Entity` lives in `.obsidian/apparatus/lib/`, and the shared README states modules are built to assume core, never the reverse.

**Evidence.**
- `resolve-note-file.js`, `resolve-titles.js`, and `append-to-frontmatter-array.js` import `../../../utils/links.js` and `../../../utils/logger.js`. Those relative paths break if the files move into `apparatus/lib/`.
- The core README defines `lib/controls/` as `AbstractInputSuggest` UI classes, "not object classes, not modals, a third kind of thing". The resolvers are not that kind of thing, so core `controls/` may not be the right home.
- [[Library Module]] §5 contains "Used By" tables for these files, and [[citation]] §2 is the authoritative source for resolver semantics. Both would need updating if the files move.
- Strict array resolution has an existing pattern: `Definition.js` uses `resolveNoteTitles(...).map(toWikilink)`.

**Decision needed.** Where do shared resolvers and the Accession helper live in core, and does the Library module keep its own copies, re-export them, or import the core ones?

**Decision:** The resolvers live in `.codex/resolution/` and the Accession helper in `.codex/frontmatter-helpers/`, both at the project root and shared by every module. There are no per-module copies; the Library module imports from there. The shared controls (`NoteSuggest`, `ValueSuggest`, and the other `AbstractInputSuggest` classes) live in `.codex/controls/`.

### ✅ B2. `NoteSuggest` accepts exactly one `expectedClass`

**Problem.** `NoteSuggest.getSuggestions()` filters on `frontmatter?.class !== this.expectedClass`, a single string. `BaseModal.buildNoteListSetting()`, `buildNoteLinkSetting()`, and `buildNoteSuggestSetting()` pass `expectedClass` straight through. The spec needs multi-class scoping:

| Field | Scope |
| --- | --- |
| `part-of` | `Organization`/`Belief-System` |
| `founder` | `Person`/`Organization`/`Belief-System` |
| `participants` | `Person`/`Organization` |
| `possessor` | `Person`/`Organization` |
| `origin` | `Person`/`Place`/`Organization` |

**Decision needed.** Is changing `NoteSuggest` and the `BaseModal` note builders in scope? A candidate (not decided) is to accept either a string or an array for `expectedClass`, which would leave every existing Library caller unchanged.

**Decision:**

### ✅ B3. Frontmatter key order and modal build order are unspecified per leaf

**Problem.** [[Entity.js Specification]] §9 lists each leaf's fields but not their order. Every other class spec gives the full generated frontmatter order, and [[Works.js Specification]] gives a modal build order. Each leaf hand-lists its keys in `getFrontmatterFields()` and builds its modal fields in a chosen order, so both would be guesses.

**Decision needed.** Fill in the order for each leaf. Include where `source`, `related`, `context`, and `tags` fall.

**Decision:** General frontmatter order for every leaf: `class`, `category`, `affiliations`, `aliases`, `created`, `modified`, {leaf fields}, `source`, `related`, `context`, `tags`. Modal build order matches frontmatter order for every field the modal renders. `class`, `created`, and `modified` have no modal field. `aliases` moves onto `Entity`, so every leaf carries it. `Timeline.category` is written as an empty array. `EntityModal.onOpen()` does not call `super.onOpen()`; it runs the fixed sequence, uses the existing `buildCategorySetting()` for `category` (which each leaf overrides, supplying its own class or control), and calls the overridable hook `leafFieldsOverride` for the leaf fields.

| Leaf | Leaf fields, in order | Modal build order |
| --- | --- | --- |
| `Person` | `alignment-ethics`, `alignment-morality`, `role`, `occupation`, `significance`, `part-of`, `allies`, `rivals`, `founded`, `possessions`, `events` | Same as frontmatter. |
| `Organization` | `membership`, `part-of`, `founder`, `founded`, `possessions`, `events` | Same as frontmatter. |
| `Belief-System` | `date-start`, `date-end`, `region`, `membership`, `part-of`, `founder`, `founded` | Same as frontmatter. |
| `Place` | None. | Same as frontmatter. |
| `Artifact` | `origin`, `condition`, `possessor` | Same as frontmatter. |
| `Event` | `date-start`, `date-end`, `timeline`, `places`, `participants` | Same as frontmatter. |
| `Timeline` | `date-start`, `date-end`, `events` | Same as frontmatter. |

### ✅ B4. Single-select category control: home, signature, and required-ness

**Problem.** [[Entity.js Specification]] §8 requires single-select category controls in four modals: `PersonModal`, `PlaceModal`, `ArtifactModal` (temperament axis), and `BeliefSystemModal` (domain, plus the conditional sub-axis block). No such builder exists.

**Evidence.**
- `BaseModal.buildDropdownSetting()` assigns `this.result[resultKey] = value`, a string, which would overwrite the `category` array.
- `BaseModal.buildMultiSelectSetting()` adds and removes values on `this.result[resultKey]`, so several multi-select blocks can safely share the `category` key.
- Within each leaf's vocabulary, every value is unique across axes. A single array is therefore unambiguous.
- `category` is a string array for every class. The existing `Story` modal does not follow this (see O1).

**Decisions needed.**
1. Where does the builder live: `BaseModal`, `EntityModal`, or each leaf modal? You have said the category picker will be overhauled later, so this may be throwaway code.
2. Builder name and signature. It must clear previously selected values from its own axis only.
3. Are the `Person`, `Place`, and `Artifact` temperament selections required or optional? The spec requires only the `Belief-System` domain, enforced in the creation command.

**Decision:**
1. The builder lives in `BaseModal`, available to every modal.
2. `buildSingleSelectSetting(containerEl, label, resultKey, options, onChange)`. On change it removes only its own axis's `options` from the `result[resultKey]` array, adds the selection unless it is the empty option, then calls the optional `onChange(value)`. The callback lets `BeliefSystemModal` rebuild its sub-axis block when the domain changes.
3. The `Person`, `Place`, and `Artifact` temperament selections are optional. Only the `Belief-System` domain is required, enforced in `core-create-belief-system.js`.
4. The `Belief-System` sub-axis logic is modal-only. Once the object is instantiated, nothing governs `category`.

### ✅ B5. Leaf `classValue`s, and an outdated Module Taxonomy

**Problem.** Neither document states the `classValue` for each leaf. The Module Taxonomy copy reviewed still lists the old World-Building classes (`character`, `group`, `belief-system`, `location`, `artifact`, `event`, `timeline`) with different category vocabularies (for example `character`: `protagonist`/`antagonist`/`supporting`; `group`: `guild`/`faction`/`congregation`/`club`/`cabal`/`order`; `location`: `region`/`settlement`/`landmark`/`structure`). The retired worksheet noted a rename pass (`location` to `place`) as pending.

**Decisions needed.**
1. Exact `classValue` for each of the seven leaves.
2. Has the Module Taxonomy rename pass been done? If not, it is a prerequisite, because `class` values are the load-bearing disjoint vocabulary.

**Decision:**
1. The `classValue` is the lowercase form of each leaf's name: `person`, `organization`, `belief-system`, `place`, `artifact`, `event`, `timeline`.
2. The rename pass is done. The Module Taxonomy copy reviewed on 2026-10-22 lists the seven classes in its Core, Creative, and Library tables and in its Full Vocabulary Reference. The old World-Building classes survive only in the historical changelog.

## 2. Needs a Decision, Not Blocking
---

These can be settled while building, but should not be guessed.

| # | Item | Detail | Decision |
| --- | --- | --- | --- |
| S1 | Core `source` strictness | The spec leaves it to the extending module, but the seven core leaves are directly instantiable. What do they do: strict, lenient, or no resolution? | Closed. Lenient, via `resolveNoteLinksLenient()`: an unresolvable `source` link is kept as written and creation continues. The caller adds no logging; the resolver is not modified. |
| S2 | `Belief-System` file and class naming | The hyphen is not a valid JS identifier. Confirm `BeliefSystem.js` / `BeliefSystemModal.js` as the file and class names, with `belief-system` as the `classValue`. | Closed. `BeliefSystem.js` / `BeliefSystemModal.js`, `classValue` `belief-system`. A rename to `Ideology` was considered and declined. |
| S3 | Builder signatures in §8 | `buildPartOfSetting()` takes no `containerEl` while `buildFounderSetting(containerEl)` does, and every `BaseModal` builder takes one. Confirm that is a typo. `buildSourceSetting()` and `buildRelatedSetting()` have no signature at all. | Closed. Every builder takes `containerEl`: `buildPartOfSetting(containerEl)`, `buildFounderSetting(containerEl)`, `buildSourceSetting(containerEl)`, `buildRelatedSetting(containerEl)`. |
| S4 | `source`/`related` picker scope | The target class scope and any folder scope for these two pickers are not in the current spec. The earlier worksheet flagged them as never pinned down. Unrestricted, Entity-leaves-only, or other? | Closed. Both pickers are unrestricted: any note in the vault, no class or folder restriction. |
| S5 | `context` resolution | The spec says only "standard via `BaseClass`". Does `Entity` resolve it eagerly and leniently, as `Works.js` and `Definition.js` do, or leave it raw? | Closed. `Entity` does not resolve `context`. The modal renders the inherited `buildContextSetting()` note-list picker, and the value is written raw. |
| S6 | Command names and pattern | Presumably `apparatus-create-<leaf>.js`, following `apparatus-create-image.js`. Confirm the names. Confirm whether each uses the plain-callback pattern (`Image` precedent) or `checkCallback`. Are there required-field checks beyond the `Belief-System` domain? `Event.date-start` is described as "always present". | Closed. `core-create-<leaf>.js`, with command `name` `Create <Leaf>`. Plain `callback()`, not `checkCallback()`. The only required-field check is the empty `Belief-System` domain. `Event.date-start` is not required; the key is always written and the value may be empty. |
| S7 | `date-start` / `date-end` validation | The spec says type `date`, the schema says free text. `utils/inputValidation.js` exports `dateValidator()`, which returns an empty string on a failed match. Is it used, or are the fields unvalidated like the Works date fields? | Closed. Native date picker through a new `BaseModal.buildDateSetting(containerEl, label, resultKey)`, producing `YYYY-MM-DD`. `dateValidator()` is not applied. A custom in-universe calendar is deferred. |
| S8 | Dashboard and Accessory queries | The spec does not define the columns or fields for the `source`/`related` tables, the affiliations-by-namespace breakdown, the adherent list ("pulling fields off each `Person`"), or the per-leaf Accessory tables. | Closed. Tables use the minimal form `TABLE WITHOUT ID file.link AS Title, <field> AS <Label>`. Column sets are deferred until objects are instantiated. Table A lists the notes in this note's own field; Table B lists the notes whose own field links to this note. `source`, `related`, `allies`, and `rivals` use B. Every Accession-only field gets both: A on the field itself, B on the counterpart (`membership`/`part-of`, `founded`/`founder`, `possessions`/`possessor`, `events`/`participants` or `timeline`). No tables for the other curator-entered fields (`part-of`, `founder`, `possessor`, `participants`, `places`, `timeline`), since frontmatter already shows them. `Artifact` and `Event` therefore do not override `getBodyAccessory()`. The `Belief-System` adherent list is dropped. The `affiliations` table lists the other notes that share this note's affiliations, without repeating the note's own values, sorted by prefix. A note shares an affiliation when its own `affiliations` contains a value recorded in this note's `affiliations`. Column sets are deferred until objects are instantiated. |
| S9 | Lenient Accession rows | `appendToFrontmatterArray()` always logs a Notice and throws. Rows 2 to 6 "log rather than throw" on an unresolvable target. Which resolver and which `Log` level? Row 2 says "a named `Person` … at creation time only", which needs clarifying. | Closed. Row 2's `Person` is an existing note named in `allies`/`rivals`, pushed at creation only. Rows 2–6 resolve with `resolveNoteFileLenient()`, which returns `null` and does not log; the caller logs the miss with `Log.error` and skips the push. The resolver for lenient `source` on the core leaves is `resolveNoteLinksLenient()`. |
| S10 | Module loading convention | Core files mix styles. `BaseClass.js` and `BaseModal.js` use `await requireAsync(...)`, while `Image.js` and `Library.js` use ES `import`. The README says `requireAsync()` everywhere. Which do the new core files use? | Closed. Standard ESM `import`/`export`, with default exports for every new Entity file. `BaseModal` stays a named export, imported as `import { BaseModal }`. |
| S11 | `Organization.category` modal | The vocabulary is "open-ended by design". If `categoryOptions()` returns the four starting values, `BaseModal` renders a closed multi-select and the curator cannot add a value. If it returns `null`, the modal renders suggest-backed free text. Which is intended? | Closed. `Organization` does not override `categoryOptions()`, so the modal renders the comma-separated suggest-backed list. "Open-ended by design" stands. Starting values appear as suggestions once used in the vault. |

### 2.1 Raised During Resolution

All closed.

| # | Item | Detail |
| --- | --- | --- |
| R1 | `EntityModal` hook and object class | Closed. `EntityModal` supplies no object class; each leaf overrides `buildCategorySetting()`, supplying its own class or control. The leaf-fields hook is `leafFieldsOverride(containerEl)`. |
| R2 | `Event` category control | Closed. Follows `Artifact`: two stackable multi-selects, scale and nature, each its own labeled control. |
| R3 | `aliases`, `tags`, and leaf field builders | Closed. `aliases`: `buildListSetting()`. `tags`: `buildListSuggestSetting()`. Leaf fields are mapped to builders in spec §8.5. |
| R4 | `ValueSuggest` class scoping | Closed. `buildListSuggestSetting()` and `buildCategorySetting()` each gain an optional trailing `expectedClass`, forwarded to `ValueSuggest`. `ValueSuggest` is not modified. `Organization` passes its own `class` value. |
| R5 | Leaf file locations | Closed. Flat in `.codex/core/objects/` and `.codex/core/modals/`, one class per file, per the codex module map. |
| R6 | `belief-system` command | Closed. File `core-create-belief-system.js`, command `name` `Create Belief System`. |

## 3. Observed Outside Entity
---

Not part of this build, but found during the review.

- **✅ O1. `Story` category type.** `StoryModal` builds its pick-one category through `buildDropdownSetting()`, which writes a plain string, and `Story.js` renders it as-is. If `category` must be a string array across every class, `Story` does not conform.
- **✅ O2. Export style mismatch.** `BaseModal.js` is a named export, while `SceneModal.js` default-imports it. To be reconciled across modules by the curator.
- **O3. `BaseModal.onOpen()` tags builder.** `BaseModal.onOpen()` builds `tags` with plain `buildListSetting()`, while the curator intends `buildListSuggestSetting()` for `tags`. The Entity modals do not call `super.onOpen()`, so this build is unaffected.
- **✅ O4. Extract `buildFrontmatterBlock()` from `BaseClass.js`.** Decision: extract it, together with its two module-private helpers, `formatFrontmatterLine()` and `formatScalarValue()`, so that `BaseClass.js` holds only the class and the one-class-per-file rule holds across the code base. `findIdentityAffiliation()` stays on `BaseClass`. The extracted code goes in the new `.codex/frontmatter-helpers/` directory, alongside `append-to-frontmatter-array.js`. The file name inside it is not yet chosen. Every importer of `buildFrontmatterBlock`, including `Story.buildSceneTemplates()` and the external projects, needs its import updated. `Entity` uses neither function, so this is separate from this build. The codex describes the leading-`[` quoting as single-quoted, while the code double-quotes it; the codex line needs correcting.

## 4. Suggested Order
---

B1 through B5 are closed. Nothing remains open. Column sets are deferred until objects are instantiated.

## 5. Documents to Update After Patching
---

- [[Apparatus Module Taxonomy]]: the rename pass is complete. The `Entity` description now includes `aliases` (applied 2026-10-22).
- [[Library Module]] §5: updated 2026-10-22. The Object Resolution section documents the resolvers in `.codex/resolution/`, and the Accession section documents the helper in `.codex/frontmatter-helpers/`. [[citation]] §2 has not been checked and may still need updating.
- [[Entity.js Specification]]: updated 2026-10-22 for every item closed this session. No decisions are pending.
- [[Entity Schema]]: not available in the 2026-10-22 session. The B3 orders, `aliases` on `Entity`, and the B5 `classValue`s still need applying.
- `_codex.md`: loading convention and `lib/` references (O3), and the quoting description (O5).

## 6. Change Log
---

| Date | Change |
| --- | --- |
| 2026-10-22 | Recorded decisions for B1, B3, B4, B5, S1 through S11, and R1 through R6. Added §2.1 for items raised during resolution, all now closed, and added O2 through O5 to §3. |
| 2026-10-12 | Initial document. |