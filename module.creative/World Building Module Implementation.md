---
class: archive
category:
  - specification
created: 2026-08-02
modified:
tags:
---

# World-Building Classes — Implementation Plan

## Scope

Seven classes from the World-Building module (`Apparatus_Module_Taxonomy.md`), none of which exist in the scripts system yet: `character`, `group`, `belief-system`, `location`, `artifact`, `event`, `timeline`.

## Shared pattern

All seven extend `BaseClass` **directly** — no intermediate shared class (no `WorldBuildingClass` mirroring ENVOY's `Market`). Reasoning: ENVOY's `Market` exists because `agent`/`publication`/`publisher` genuinely share substantive fields beyond `BaseClass` (`sim-sub`, `fee`, `tier`, `response-time`, `submission-windows`, etc.). The World-Building classes don't — per the taxonomy, all seven use only `class`/`category`/`affiliations`/`created`/`modified`/`tags` (all already `BaseClass`-owned) and explicitly carry **no status property** ("a deliberate deferral... status is added only once an actual tracking need emerges"). There's nothing to factor out yet. An intermediate class is worth it only once a cluster "turns out to share enough" — right now none of them do.

None of the seven need any frontmatter field beyond what `BaseClass.baseFrontmatterFields()` already provides. The taxonomy's per-class descriptions (e.g. character "carries physical, psychological, relational, and narrative metadata") are prose about what the note *contains* in its body, not a defined frontmatter schema — no concrete fields are specified there, so none are invented here. Same "start basic, extend from real use case" principle the taxonomy itself invokes for status.

## Class-by-class

| Class | `classValue` | `categoryOptions()` | Notes |
|---|---|---|---|
| `Character` | `character` | `['protagonist', 'antagonist', 'supporting']` | pick-one axis |
| `Group` | `group` | `['guild', 'faction', 'congregation', 'club', 'cabal', 'order']` | pick-one axis |
| `BeliefSystem` | `belief-system` | `['political', 'religious', 'benevolent', 'benevolent-neutral', 'neutral', 'neutral-malevolent', 'malevolent']` | two stackable axes (domain, ethical leaning) flattened into one option list |
| `Location` | `location` | `['region', 'settlement', 'landmark', 'structure']` | pick-one axis (scope) |
| `Artifact` | `artifact` | `['mundane', 'technological', 'supernatural', 'weapon', 'relic', 'document', 'tool']` | two stackable axes (nature, function) flattened |
| `Event` | `event` | `['personal', 'local', 'regional', 'world-historic', 'war', 'disaster', 'political', 'discovery', 'ritual']` | two stackable axes (scale, nature) flattened |
| `Timeline` | `timeline` | `null` (inherited default — no override) | bare container, no category at all |

File layout, matching the existing `Scene`/`Manuscript`/`Story` convention:

```
.obsidian/apparatus/creative/lib/
├── objects/
│   ├── Character.js
│   ├── Group.js
│   ├── BeliefSystem.js
│   ├── Location.js
│   ├── Artifact.js
│   ├── Event.js
│   └── Timeline.js
└── modals/
    ├── CharacterModal.js
    ├── GroupModal.js
    ├── BeliefSystemModal.js
    ├── LocationModal.js
    ├── ArtifactModal.js
    ├── EventModal.js
    └── TimelineModal.js
```

Commands go in the shared `.obsidian/commands/`, following the established naming convention: `id` matches the filename (`creative-create-character.js`, etc.), `name` is `Create <Module> <Class>` with no domain word (`"Create Creative Character"`, `"Create Creative Belief System"`, ...).

Each modal: `buildTextSetting` for `filename`, `buildCategorySetting(contentEl, <Class>)` for `category` (multi-select toggle, since every class but `Timeline` declares a fixed vocabulary), `buildListSuggestSetting` for `affiliations` and `tags`. `Timeline`'s modal skips the category setting entirely, the same way the reworked `SceneModal` now skips it for `scene`.

## Hierarchy: `Timeline` → `Event`

The taxonomy specs `timeline` (container/index) > `event` (atomic occurrence) — the same container relationship as `story` > `manuscript` > `scene`, just one level deep instead of two. How much of that relationship gets built into the classes (vs. left to affiliations/wikilinks + Dataview) is an open question below rather than assumed.

## Open questions — need your call before building

1. **Note body content.** `Scene.getBody()` supplies a `dataviewjs` inline-comment scanner. Do the seven World-Building classes get that same block (useful if these notes carry prose commentary the way scenes do), something else, or nothing (just frontmatter + blank body) until a real need shows up?
2. **Pick-one categories via multi-select toggles.** `character`, `group`, and `location` are each "pick one" in the taxonomy, but `buildCategorySetting()`/`buildMultiSelectSetting()` only knows how to render flat toggles — same as how `Story`'s pick-one length/form field already works. Fine to keep that precedent (toggles, trusting one gets picked), or worth a true single-select control for pick-one classes specifically?
3. **`Timeline` ↔ `Event` linkage.** Does `Timeline` need any actual field or generated dashboard referencing its `Event` notes (mirroring `Story.manuscriptLinks` / the story dashboard's scene queries), or does it stay a genuinely bare container relying only on `affiliations` + wikilinks, at least for this first pass?
4. **Folder targeting.** Default `resolveFolder()` (active file's parent) covers the common case — these classes created from inside a story's own draft folder, per the taxonomy's "most stories are atomic... embedded" note. Standalone-module folder resolution is explicitly left open in the taxonomy itself ("Open: Migration Mechanics"), so the plan here is to ship all seven with the default and revisit per-class if/when a project's world-building actually graduates to standalone. Confirm that's the right scope for this pass.
5. **Build order.** Given how uniform and thin all seven are (no field differs beyond the `category` vocabulary, no class has real behavioral logic the way `Story`'s scene-template generation or `Manuscript`'s stage-derived status does), the plan is to build all seven together in one pass rather than phasing them — unless you'd rather stage it (e.g. `character`/`group`/`belief-system`/`location` first since they were already living in Creative before this formalization, `artifact`/`event`/`timeline` after).