---
class: archive
category:
  - specification
created: 2026-08-03
modified:
tags:
---

# Publication Module — Implementation Plan

## Scope

Four classes from the taxonomy's Publication module: `publication`, `volume`, `edition`, `column`. Governs the editorial *production/release* pipeline, distinct from Library (which governs consuming external work).

## Shared pattern

All four extend `BaseClass` directly — no intermediate class. Same reasoning as World-Building: this is a container hierarchy (`publication` > `volume` > `edition`, `column` as the atomic piece), structurally like Creative's `story`>`manuscript`>`scene`, not a fan-out like Library's twelve wildly-different catalog types. Nothing here needs factoring out across multiple leaf instances the way `Work.js` did.

## Class-by-class

| Class | `categoryOptions()` | Status | Notes |
|---|---|---|---|
| `Publication` | `['newsletter', 'zine', 'magazine', 'journal', 'digest']` — pick-one | none yet (folder note for now) | the masthead entity; format stable across its whole run |
| `Volume` | `null` — no category at all | none yet (folder note for now) | bare grouping container, mirrors `Timeline`'s precedent; nothing distinguishes a "kind" of volume beyond what it contains |
| `Edition` | same format vocab as `Publication` — pick-one | `release-status` | a discrete release; format tracks the masthead's format at time of release |
| `Column` | `['serial', 'short-story', 'classic-horror']` — pick-one | `release-status` | fixed vocabulary of named recurring slots within a masthead, not a genre/content axis; extends only when a masthead adds a new recurring feature; also carries `context` (plain field, mirrors `Scene`/`Manuscript`'s `context`) — the bridge to the `scene` note(s) it draws from |

**Identity via tags, not category.** Masthead identity (`#<publication-name>`) and story identity (`#<story-name>`) live in `tags` on every relevant object, not in `category` — same convention as Story keeping series/world identity out of `category`. This is also how multiple `serial` columns can run in the same `edition` at once (two parallel serialized novels): distinguished by tags, not category.

**The `serial`/`stage` bridge.** `column`'s `serial` category and Creative's `stage` (`serial-draft`) describe the same story from two vantage points — publication-side venue vs. manuscript-side pipeline state. Worth a code comment cross-referencing `Scene.SERIAL_STAGE` when `Column.js` is written, the same way `SceneModal.js` already comments on the `stage`/status-key coupling.

## File layout

```
.obsidian/apparatus/publication/lib/
├── objects/
│   ├── Publication.js
│   ├── Volume.js
│   ├── Edition.js
│   └── Column.js
└── modals/
    ├── PublicationModal.js
    ├── VolumeModal.js
    ├── EditionModal.js
    └── ColumnModal.js
```

Commands in the shared `.obsidian/commands/`, following Calamity's plain-naming convention (no domain word) rather than ENVOY's/Library's — Publication is a single flat module, not one that forks into multiple sibling trees the way Library's context libraries do, so there's no collision risk to guard against: `create-publication.js`/`create-volume.js`/`create-edition.js`/`create-column.js`, names "Create Publication"/"Create Volume"/"Create Edition"/"Create Column".

## Open questions before building

1. **`release-status` value vocabulary.** The taxonomy names the property for `Edition`/`Column` but gives no value set (unlike Creative's `editorial-status`/`serial-status`, which came with theirs from the start). Needs its own small pass — likely mirrors Library's `catalog-status` shape (a processing/lifecycle pipeline) but should be worked out on its own terms rather than assumed to be identical, since a *release* pipeline (drafted → scheduled → released → archived, say) isn't quite the same shape as a *cataloging* pipeline. Want this done here, or handed off the same way the category values were?
2. **Note body content.** `Publication`/`Volume` currently rely on folder notes rather than dashboards (per the "none yet" status above) — does that mean their `getBody()` stays blank for this pass, with a real dashboard (mirroring `Story`'s) deferred until status lands? `Edition`/`Column` likely want *something* in the body even now — same inline-comment-scanner block as `Scene`, or something specific to a release/piece?
3. **`Volume`↔`Edition` linkage.** Does `Volume` need any field or generated list referencing its `Edition`s (mirroring `Story.manuscriptLinks`), or stay a genuinely bare container for now, relying on `affiliations`/tags/wikilinks alone?
4. **Folder targeting.** Proposing default `resolveFolder()` for all four, on the assumption commands run from inside that masthead's own project folder — same assumption made for Library and World-Building. Confirm, or does Publication need something else?