---
class: archive
category:
  - overview
affiliations:
created: 2026-07-23
modified: 2026-09-26
context:
tags:
---
This system replaces the old Templater scaffold scripts (e.g. `novellaScaffold`) with a class-based note-generation system built on CodeScript Toolkit. The old scripts became unwieldy because Templater doesn't support real JS import/export — everything must live in a single file, which can become unweildy. CodeScript Toolkit supports genuine ESM `import`/`export`, so generation logic can finally be split across files and reused instead of duplicated.

The long-term goal: every `class` in the Apparatus Module Taxonomy gets its own JS class capable of generating that kind of note, all built on a shared foundation rather than copy-pasted scaffolding.

The shared foundation itself — `BaseClass`, `BaseModal`, `controls/`, `utils/logger.js` — lives in `.obsidian/apparatus`. See `../README.md`. This document covers only what's specific to Calamity.

## contents
---
```toc
```

## core concepts
---

**Everything is an object.** The mental model isn't "notes with templates" — it's objects. A scene is an object; a manuscript is an object; a story is an object. Each taxonomy `class` value becomes a JS class.

**One class per file.** No file holds more than one class. This is a hard working constraint, not a suggestion — it's what keeps `lib/` navigable as the number of taxonomy classes grows, in contrast to the old scaffold scripts where everything piled into a single file.

**Taxonomy classes become class objects.** `BaseClass` (`.scripts/lib/objects/BaseClass.js`, shared — see `../README.md`) sits at the root and owns the properties every object in the Apparatus shares: `class`, `category`, `affiliations`, `created`, `modified`, `tags`, plus the `categoryOptions()` and `findIdentityAffiliation()` hooks documented there. `Scene`, `Manuscript`, and `Story` each extend it directly, adding only what's specific to each:
- `Scene` adds `stage`, `chapter`, `context`, and a status field whose *key* is derived from `stage` rather than fixed — `editorial-status` normally, `serial-status` at the `serial-draft` stage (`statusFieldKey`) — with its own matching value vocabulary per key (`statusValues`).
- `Manuscript` mirrors that same stage-derived status-key logic at the stage level (`statusFieldFor()`), plus `priorStage`, `context`, `storyTag`, and a `longform` config object (`format`, `title`, `draftTitle`, `workflow`, `sceneFolder`, `sceneTemplate`, `scenes`) — `sceneTemplate` is a vault-relative path (with `.md`) to that stage's matching scene template, wired in at creation time.
- `Story` adds `cycle`, `title`, `title-abbv` (required at creation — names the story's generated scene templates), `gitRepoUrl`, `storyStatus`, `stage`/`editorial-status` (mirroring the currently-active pipeline stage), `manuscriptLinks` (wikilinks to each stage's `Manuscript`), publication fields, and derived `pipeline`/`storyTag` getters.

**Modals manage input.** Frontmatter fields aren't left blank for the user to fill in by hand — field data is collected through Obsidian modals at creation time. `BaseModal` (also shared — `../README.md` has the full list of field-builder helpers it provides) renders whatever shared fields apply; `SceneModal` and `StoryModal` extend it and add each class's own fields, then call the shared submit button.

**Folder-targeting is a per-class strategy, not a fixed rule.** The default (`BaseClass.resolveFolder(app)`) uses the parent folder of wherever the invoking command was run — the assumption being that commands are run from within the relevant module folder. `Scene` uses this default. A class needing something else overrides `resolveFolder` — ENVOY's classes are the working example of a dynamic-search override, documented in `envoy/README.md`.

**Collisions always throw.** If a file already exists at the target path, `create()` throws rather than silently overwriting. No silent failures, anywhere in this system.

**Invocable scripts are thin.** Each command in `.scripts/commands/` does the minimum: open the modal, take its result, instantiate the class, call `.create()`. All the actual logic lives in `lib/`, not in the command files. `calamity-create-story.js` is the one exception to "minimum" in practice — a story scaffold has real sequencing to get right (scene templates before manuscripts, so each manuscript can be wired to the right one) — but the generation logic itself still lives in `Story`/`Manuscript`, not the command file.

## module map
---

```
module.creative/                  <-- we are here
├── objects/
│   ├── Scene.js       — extends BaseClass; scene-specific fields + body
│   ├── Manuscript.js  — extends BaseClass; per-stage fields + editorial dashboard body
│   ├── Story.js       — extends BaseClass; story-level fields + dashboard body + scene-template generation
│   └── StoryArchive.js — extends Archive (shared, `.scripts/lib/objects/Archive.js`); story-scoped integrity/snapshot checks
└── modals/
    ├── SceneModal.js  — extends BaseModal; scene-specific fields
    └── StoryModal.js  — extends BaseModal; story-specific fields
```

That's the whole of it — `BaseClass`, `BaseModal`, `controls/`, and the `create-*.js` commands all live one level up (`.scripts/lib/`, `.scripts/commands/`), shared with ENVOY and whatever comes next. Calamity's own tree only holds what's actually Calamity-specific. As more taxonomy classes get built out (the World-Building classes), they land here the same way — `objects/<Class>.js` + `modals/<Class>Modal.js`, both extending the shared base directly, unless a cluster of Calamity classes turns out to share enough that an intermediate class (the way `Envoy`/`Market` sit between `BaseClass` and ENVOY's six leaf classes) makes sense here too.

- `lib/objects/` — every Calamity taxonomy-class subclass of `BaseClass`.
- `lib/modals/` — every Calamity taxonomy-class subclass of `BaseModal`.

No `controls/` or `commands/` of Calamity's own — both live at the shared `.scripts/` level (see `../README.md`), the same as ENVOY's.

## completed
---

- `Scene` — extends `BaseClass`; adds `stage`, `chapter`, `context`, and a `stage`-derived status field (`statusFieldKey`/`statusValues`: `editorial-status` with `not-started`/`in-progress`/`revision`/`complete` normally, `serial-status` with `backlog`/`active`/`ready`/`published` at the `serial-draft` stage); supplies the scene body (comments `dataviewjs` block, `## text`, `## reference` — the reference block's status-key/value list is also derived from `stage`, so it always documents the field actually in use).
- `SceneModal` — extends `BaseModal`; adds `filename`, `category`, `affiliations`, `stage`, a status dropdown (labeled generically since which key it saves under is resolved by `Scene` itself from `stage`), `chapter`, `context`, `tags` fields. Its `stage` options were fixed to match the pipeline's actual stage names (`serial-draft`, not `serial` — a mismatch that silently broke status-key derivation until caught).
- `Manuscript` — extends `BaseClass`; adds `stage`, the same `stage`-derived status-key logic as `Scene` (`statusFieldFor()`), `priorStage`, `context`, `storyTag`, and `longform` (including `sceneTemplate`); supplies the per-stage editorial dashboard body (inline comments, scene metadata completeness, status distribution, cross-stage lineage).
- `Story` — extends `BaseClass`; adds `cycle`, `title`, `title-abbv`, `gitRepoUrl`, `storyStatus`, `stage`/`editorial-status`, `manuscriptLinks`, publication fields, and `pipeline`/`storyTag` getters; supplies the story-level dashboard body (stage completion, word count, scene status by stage, cross-stage lineage, recent activity, unresolved editorial notes — the stage-completion block branches per stage on the correct status vocabulary, same serial-draft/everything-else split as `Scene`). Also generates that story's scene Templater templates via `buildSceneTemplates()` (one to three `.md` files, placed at the story's own root — see below) and exports `sceneTemplateSuffixForStage(stage)` so the calling command can wire each stage's `Manuscript.longform.sceneTemplate` to the matching template's vault path.
- `StoryModal` — extends `BaseModal`; adds `titleAbbv` (required — `BaseModal` has no built-in required-field validation, so the actual block on an empty value lives in `calamity-create-story.js`), `category`, `cycle`, `affiliations`, `gitRepoUrl`, `storyStatus`, `editorialStatus`, `tags` fields.
- `calamity-create-story.js` (`.scripts/commands/`) — invocable script (`checkCallback`, folder-gated to a resolvable folder) that opens `StoryModal`, builds a `Story`, generates its scene templates first (so their real vault paths are known), then one `Manuscript` per pipeline stage — each wired to the matching template via `sceneTemplateSuffixForStage()` — then the `ARCHIVE` dashboard + `DRAFTS`/`CHANGELOG` folders, then creates + opens the `Story` note last.
- `create-scene.js` (`.scripts/commands/`) — invocable script (`export async function invoke(app) {}`) that opens `SceneModal`, resolves the folder via `Scene.resolveFolder(app)`, instantiates `Scene`, and creates + opens the file.
- `StoryArchive` — extends the shared `Archive` (`.scripts/lib/objects/Archive.js` — see `../README.md`); adds no frontmatter fields of its own (`Archive`'s own frontmatter is already sufficient) and implements `Archive`'s hook methods for a story's own dashboard: `integrityChecks()` returns three `dataviewjs` checks scoped to the story's tag (story-level fields present, manuscript-level fields present including `longform.*`, and scene-level required fields — each resolving `editorial-status`/`serial-status` the same `stage`-derived way as `Scene`/`Manuscript` do), `snapshotSectionTitle()` returns `'drafts'`, and `snapshotChecks()` returns two more (snapshot-folder existence per pipeline stage, and pre-removal validation for manuscripts already sitting in `ARCHIVE/DRAFTS`). One instance is created per scaffolded story, at `ARCHIVE/ARCHIVE.md` within the story's own folder.

### Scene template generation

Each scaffolded story gets its own scene Templater templates, placed at the story project's root folder (not inside any stage folder), for use later when actually spawning scene notes:

- **Serial-category stories** get three: `<title-abbv>-scene-serial` (stage `serial-draft`), `<title-abbv>-scene-reassembly` (stage `reassembly`), and `<title-abbv>-scene-editorial` (stage left blank — covers the remaining numbered edit stages, which all share the same shape).
- **Every other category** gets just the one `<title-abbv>-scene-editorial`.

All of them prefill only `tags` (the story's own tag); `created` is left as Templater's own `<% tp.date.now() %>` syntax rather than a real date, and `modified` is deferred. Each is built via a throwaway `Scene` instance (never `.create()`'d) so template output always matches `Scene`'s own field set and status-key derivation, rather than duplicating that logic.

`BaseClass`, `BaseModal`, and `FolderSuggest` are complete and documented in `.scripts/README.md` — Scene was the class they were originally built against, and it still uses the foundation as it stood at that point (plain `category`/`affiliations`/`tags` text fields, no `Log` tracing) apart from the status-key derivation fix above. Everything added to the shared core since — `categoryOptions()`, suggest-enabled list fields (`NoteSuggest`/`ValueSuggest`), `Log` integration — is available to `Scene`/`SceneModal` for free whenever it's worth adopting; nothing about Scene requires the upgrade, but nothing blocks it either.

## next steps
---

- Adopt the newer shared-core patterns on `Scene`/`SceneModal` when it's worth doing: a `Scene.categoryOptions()` override (`SceneModal` currently takes plain text for `category` rather than the multi-select/suggest fallback `BaseModal.buildCategorySetting()` provides), and `Log` tracing in `Scene`'s creation path to match `BaseClass.create()`'s pattern.
- `Manuscript`'s `modified` field is still unaddressed (same open item as everywhere else `BaseClass.baseFrontmatterFields()` stamps it blank).
- Decide, per future class, whether it uses the default `resolveFolder()` strategy (as `Scene` does) or needs something else — a fixed/dynamic folder search (ENVOY's pattern) or a folder-suggest field collected directly in its modal.
- Build out the remaining taxonomy classes on the same `BaseClass`/`BaseModal` pattern (the World-Building classes) — and revisit whether an intermediate shared class (mirroring ENVOY's `Envoy`/`Market`) makes sense once there's more than one to compare.

Resolved since the last pass: `import { moment } from 'obsidian'` and `app.vault.getAllFolders(true)` both confirmed working — the former is load-bearing across `BaseClass` and several ENVOY classes now, the latter is exactly how ENVOY's dynamic folder resolution works. `Manuscript`, `Story`, and `StoryModal` are built out; `Story`'s scene-template generation and its Longform `sceneTemplate` wiring are working end-to-end in the vault. `StoryArchive` is now documented above.

## related docs
---

- `../README.md` — the shared core (`BaseClass`, `BaseModal`, `controls/`, `utils/logger.js`) this module extends from
- `envoy/README.md` — ENVOY, the other module built on the same foundation — worth a look for patterns (intermediate shared classes, suggest-enabled fields, dynamic folder resolution) that may end up useful here too