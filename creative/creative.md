---
class: archive
category:
affiliations:
created: 2026-07-23
modified: 2026-09-28
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
tags:
---

## Contents
---
```toc
```

## 1. Classes
---

All classes currently supported in the Apparatus Creative module. No specification document exists yet for any class in this module — see §7, TODO.

Class instantiation objects are stored in `module.creative/objects`. Accompanying modals are stored in `module.creative/modals`.

The classes are grouped by role:

### Story Pipeline

| Class | Specification | Purpose | Modal |
| ----- | ------------- | ------- | ----- |
| Story.js | No specification exists yet. | The project-container entity — the named fiction project as a whole. Carries pipeline configuration (derived from `category` via `manuscriptPipelines.js`), story-level status, manuscript wikilinks, and publication metadata. Generates the story's scene Templater templates at construction time. Extends `BaseClass.js`. | `StoryModal.js` |
| Manuscript.js | No specification exists yet. | A single draft pass within a story's editorial pipeline (e.g. `shitty-first-draft`, `1st-edit`). Carries `stage`, a stage-derived status field, and `longform` project configuration. Extends `BaseClass.js`. | None — no modal for this class exists in this repository. |
| Scene.js | No specification exists yet. | The atomic unit of narrative draft. Carries `stage`, `chapter`, `context`, and a stage-derived status field. Extends `BaseClass.js`. | `SceneModal.js` |

### Archive

| Class | Specification | Purpose | Modal |
| ----- | ------------- | ------- | ----- |
| StoryArchive.js | No specification exists yet. | Story-scoped archive/dashboard note. Implements `Archive.js`'s integrity- and snapshot-check hook methods for story/manuscript/scene metadata completeness and draft-snapshot validation. Extends `Archive.js`. | None — instantiated directly, not through a modal. |

## 2. Class Hierarchy
---

Inheritance flows from base to specific and runs along two paths, neither passing through a Creative-specific intermediate class:

For the story pipeline:
`BaseClass` → `Scene`
`BaseClass` → `Manuscript`
`BaseClass` → `Story`

For the story-scoped archive:
`Archive` → `StoryArchive`

`Scene`, `Manuscript`, and `Story` each extend `BaseClass` directly — no shared Creative-tier class sits between them, unlike Library's `Works`/`Aggregate` middle tiers. `StoryArchive` extends the Apparatus-shared `Archive.js`, not `BaseClass` directly.

## 3. Data Flow
---

For note creation, data moves through the code modules in the following manner:
1. A modal gathers user input and passes it to the appropriate object class. `SceneModal` feeds `Scene`; `StoryModal` feeds `Story`. `Manuscript` and `StoryArchive` have no modal in this repository — construction of those two is driven directly by whatever orchestrates story scaffolding, which lives outside this repository.
2. The object constructor assigns fields; the object's frontmatter and body methods provide the note content.
3. `Story`'s constructor additionally resolves its own `pipeline` (the ordered stage list for its `category`, via `manuscriptPipelines.js`'s `getStagePipeline()`) and derives its default `stage` from that pipeline's first entry when not supplied.
4. `Story.buildSceneTemplates()` builds this story's Templater scene-template file specs — one to three `{ suffix, filename, content }` entries, depending on category — each built via a throwaway `Scene` instance that is never `.create()`'d. `sceneTemplateSuffixForStage()` lets a caller map each pipeline stage to the matching template, for wiring into that stage's `Manuscript.longform.sceneTemplate`.
5. No class in this module overrides `postCreate()`. Creation is a single-pass write with no follow-on relational pushes to other notes — this module has no Accession-equivalent mechanism.

### Lifecycle and Failure Notes

- No class in this module overrides `resolveFolder()`. Every class uses `BaseClass`'s unscoped default: the parent folder of the active file at invocation time. There is no Creative-scoped, library-style folder-discovery mechanism.
- None of `Scene`/`Manuscript`/`Story`/`StoryArchive` call the shared `Log` utility directly. Logging occurs only transitively, through `BaseClass.create()`'s own success/failure logging.
- `Scene` and `StoryArchive` carry no `categoryOptions()` override, so any modal-driven category input for them falls back to `BaseModal`'s free-text suggest list. `Story` deliberately bypasses `categoryOptions()`/`buildCategorySetting()` in its own modal — `StoryModal.js` uses a fixed pick-one dropdown instead, since `category` (length/form) is a single value, not a stackable vocabulary. `Manuscript` has no modal and so no category input mechanism at all.
- `buildFrontmatterBlock()` is used outside the normal `create()` pipeline by `Story.buildSceneTemplates()`, to render each scene template's frontmatter from a throwaway `Scene` instance's own `getFrontmatterFields()` output, with `created` overwritten afterward to Templater's `<% tp.date.now() %>` syntax.

## 4. External Dependencies and Runtime Assumptions
---

The Creative module is an Obsidian-facing JavaScript module. It is not designed to run as a standalone Node.js or browser application because object construction, note creation, and modal rendering depend on the Obsidian application context.

### CodeScript Toolkit

The Creative module depends on the **CodeScript Toolkit** Obsidian plugin, the same as every other Apparatus module. CodeScript Toolkit provides the execution and integration environment in which these scripts run.

### Shared Internal Dependencies

Creative scripts import shared infrastructure from outside `module.creative/`:

| Dependency | Used for |
| ---------- | -------- |
| `BaseClass.js` | Common object state, frontmatter/body assembly, and the `create()`/`postCreate()` lifecycle. Inherited by `Scene`, `Manuscript`, `Story`. |
| `BaseModal.js` | Common modal lifecycle and field-builder helpers. Inherited by `SceneModal`, `StoryModal`. |
| `Archive.js` | Shared integrity/snapshot dashboard base. Inherited by `StoryArchive`. |
| `logger.js` | `Log.log()`/`Log.fatal()` reporting inside `BaseClass.create()`. Not called directly by any class in this module. |

### Obsidian API Requirements

The module expects an Obsidian `App` instance and uses the following services:

| API | Runtime role |
| --- | ------------ |
| `app.vault` | File creation and collision checking, via `BaseClass.create()`. |
| `app.workspace` | Identifies the active file's parent folder for `BaseClass`'s default `resolveFolder()`. |
| `TFile` and file metadata | Supplies note paths for creation. |
| Obsidian modal and `Setting` APIs | Renders `SceneModal`/`StoryModal`'s creation forms. |

`app.vault.getAbstractFileByPath()`/`app.vault.read()` also appear inside the `dataviewjs` blocks that `Manuscript`, `Story`, and `StoryArchive` generate into note bodies (the inline-comment scanners and snapshot-existence checks). Those calls run inside Obsidian's Dataview plugin, at note-render time, in a separate `app`/`dv` execution context Dataview itself provides — they are not calls made directly by this module's own JavaScript at note-creation time.

### Repository and Rendering Assumptions

- No note in this module plays the folder-discovery role `Library.js`'s `class: library` note plays for the Library module. Every class resolves its target folder via `BaseClass`'s unscoped default.
- Generated `Manuscript`/`Story`/`StoryArchive` bodies expect Obsidian to render `toc`, Dataview, and Dataview-JS blocks. `Story`'s dashboard additionally expects a Mermaid renderer (pie-chart status/completion visualizations) and, for its word-count section, either the Novel Word Count plugin or a manually maintained `word-count` frontmatter field on each scene.
- `Story.buildStoryDashboard()`'s generated `dataviewjs` blocks, and `StoryArchive`'s `sceneIntegrityScript()`/`snapshotExistenceScript()`, each call `requireAsync('/.obsidian/apparatus/creative/core/manuscriptPipelines.js')` — an absolute vault path baked into the generated note content itself, not just this repository's own documentation.
- Frontmatter field names are part of the module contract. `stage`, the `editorial-status`/`serial-status` key pair, `chapter`, `context`, and every `longform.*` key are referenced as literal strings inside the generated Dataview/DataviewJS queries, not through any shared constant — a rename requires updating the owning class and every generated query that references it.

## 5. Creative Tooling
---

This section will grow as more tooling is added to this module's construction. It currently holds one file.

### Stage Pipelines

| File | Description | Used By |
| ---- | ----------- | ------- |
| `manuscriptPipelines.js` | Single source of truth mapping a story's `category` (length/form) to its ordered stage list. Exports `getStagePipeline(lengthForm)` (throws for an unregistered length/form — `flash-fiction` currently has none defined), `getStageIndex(lengthForm, stage)`, and `getPriorStage(lengthForm, stage)`. | `Story.js` imports `getStagePipeline` only, via its own `pipeline` getter. `getStageIndex`/`getPriorStage` are not imported anywhere in this repository. |

### Scene Template Generation

`Story.js` itself — not a separate file — builds each story's Templater scene templates.

#### Public API

| Export | Responsibility | Inputs | Returns / behavior |
| ------ | -------------- | ------ | ------------------- |
| `Story.prototype.buildSceneTemplates()` | Builds this story's Templater scene-template file specs. | None — reads `this.category`/`this.titleAbbv`/`this.storyTag`. | An array of `{ suffix, filename, content }`. A `serial`-category story gets three entries (`scene-serial`, `scene-reassembly`, `scene-editorial`); every other category gets one (`scene-editorial`). |
| `sceneTemplateSuffixForStage(stage)` | Maps a pipeline stage to the scene-template suffix that stage should use. | `stage` | `'scene-serial'` for `Scene.SERIAL_STAGE`, `'scene-reassembly'` for `'reassembly'`, `'scene-editorial'` for every other stage. |

Each template is built via a throwaway `Scene` instance, never `.create()`'d, so template output always matches `Scene`'s own field set and status-key derivation rather than duplicating that logic. Only `tags` (the story's own tag) is prefilled; `created` is overwritten with Templater's `<% tp.date.now() %>` syntax after the fact, and every other field is left blank for per-note fill-in.

### Dependency Documentation Sync

This document surfaces the structure in `module.creative/` and provides an itemized inventory of code modules, found in the [[#Appendix File Inventory|File Inventory appendix]]. The `Sync Creative Dependency Documentation` command, powered by `creative-sync-dependency-docs.js`, can be run to keep that inventory current. The command generates a table under [[#Appendix Generated Dependency Map|Appendix: Generated Dependency Map]], describing static, relative imports within `module.creative/` only — dynamic imports, re-exports, and non-relative specifiers are reported separately as unresolved rather than silently omitted.

No specification document exists yet for this command — see §7, TODO.

## 6. References
---

[[Apparatus Module Taxonomy]]
Core class and category taxonomy doc for Apparatus modules.

[[Apparatus Status Taxonomy]]
Vocabulary spec for domain-scoped statuses across the Apparatus system.

## 7. TODO
---

- [ ] Write specifications for `Story.js`, `Manuscript.js`, `Scene.js`, and `StoryArchive.js`. None exist yet.
- [ ] Decide whether `Scene`, `Manuscript`, and `Story` warrant a shared Creative-tier intermediate class, or remain three independent `BaseClass` extensions.
- [ ] Add a `Scene.categoryOptions()` override — `SceneModal` currently falls back to a free-text suggest list rather than a fixed vocabulary.
- [ ] Add `Log` tracing to the creation paths of `Scene`, `Manuscript`, `Story`, and `StoryArchive`, matching `BaseClass.create()`'s own logging pattern.
- [ ] Write a specification for `creative-sync-dependency-docs.js`, mirroring [[Documentation Sync Command Specification]].

## Appendix: File Inventory
---

Complete inventory of the JavaScript files currently contained in `module.creative/`. Export names and inheritance are recorded as implemented; `BaseClass`, `BaseModal`, and `Archive` are shared modules outside this directory.

### `objects/`

| File | Export | Extends | Specification |
| ---- | ------ | ------- | -------------- |
| `Manuscript.js` | `Manuscript` | `BaseClass` | No specification exists yet. |
| `Scene.js` | `Scene` | `BaseClass` | No specification exists yet. |
| `Story.js` | `Story`, `sceneTemplateSuffixForStage` | `BaseClass` | No specification exists yet. |
| `StoryArchive.js` | `StoryArchive` | `Archive` | No specification exists yet. |

### `modals/`

| File | Export | Extends |
| ---- | ------ | ------- |
| `SceneModal.js` | `SceneModal` | `BaseModal` |
| `StoryModal.js` | `StoryModal` | `BaseModal` |

### `core/`

| File | Exports |
| ---- | ------- |
| `manuscriptPipelines.js` | `getStagePipeline`, `getStageIndex`, `getPriorStage` |

## Appendix: Generated Dependency Map
---

<!-- BEGIN GENERATED CREATIVE DEPENDENCY TABLE -->
<!-- END GENERATED CREATIVE DEPENDENCY TABLE -->

## Appendix: Future Considerations
---

- None currently identified.

## Appendix: Change Log
---

| Date | Change |
| ---- | ------ |
| 2026-09-28 | Added the Dependency Documentation Sync subsection to §5 and the Appendix: Generated Dependency Map marker block, following `creative-sync-dependency-docs.js`'s addition — mirrors `library-sync-dependency-docs.js`/`library.md`'s existing pattern exactly. The section is empty (markers only) since the command has not yet been run. Removed the now-fulfilled Future Considerations item proposing this same addition. Added a TODO item for the new command's still-missing specification. |
| 2026-09-28 | Restructured into the Library module's folder-note shape (Classes, Class Hierarchy, Data Flow, External Dependencies and Runtime Assumptions, Creative Tooling, References, TODO, Appendices), replacing the prior narrative walkthrough (core concepts / module map / completed / next steps). Every statement re-derived directly from the current contents of `module.creative/`; nothing carried over from the prior version's prose without re-verification against the actual code. |