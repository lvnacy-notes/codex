---
class: archive
category:
  - specification
affiliations:
created: 2026-11-23
modified: 2026-11-23
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[Apparatus Affiliations Taxonomy]]"
  - "[[Accession Specification]]"
  - "[[.codex]]"
  - "[[.commands]]"
tags:
---

Design worksheet for the Apparatus Obsidian plugin: a single plugin that ships the codex (Core, Creative, Library, Publication), registers every command, gates commands by container context, and adapts classes and modals to per-container schemas.

Status markers used throughout: **Decided** (stated by the curator), **Proposed** (derived from the codex and awaiting confirmation), **Open** (unresolved), **Parked** (deliberately deferred).

## Contents
---
```toc
```

## 1. Scope and Purpose
---

The plugin replaces the CodeScript Toolkit command layer (`.commands/`) and the git-submodule distribution of `.codex/`. It is for the curator's own vaults; it is not marketed, so nothing in it is built for third-party configurability.

**Decided: problems the plugin solves**

| Problem | Current state | Plugin outcome |
| --- | --- | --- |
| Mobile commands | CodeScript Toolkit has a bug where commands do not run on mobile. | `addCommand()` in a plugin with `isDesktopOnly: false`. |
| Distribution | `git submodule add` and `git pull` in every vault that carries `.codex`. | One plugin install per vault, updated through the plugin lifecycle. |
| Command location | CodeScript Toolkit requires all commands in a single directory, which conflicts with module logic living alongside its module. | Each module registers its own commands from its own folder. |

**Decided: not goals**

- CodeScript Toolkit is not being removed on principle; the plugin only has to stop depending on it for commands.
- The plugin does not manage anything outside the objects it owns, and it does not take over the curator's explorer sorting. `Story` and `Manuscript` write a `sorting-spec` property into the notes they scaffold, for the Custom File Explorer sorting plugin to consume; no other `sorting-spec` is read or written.

**Decided: development kit.** The plugin is built from the curator's plugin template: esbuild bundles `main.ts` to CommonJS in `dist/` with `obsidian` external, `tsc --noEmit` runs before every production build, ESLint and Vitest (against `obsidian-test-mocks`) are configured, and the code must meet the conditions for acceptance into the community plugin hub. The template's `package.json`, `tsconfig.json`, `eslint.config.js`, `esbuild.config.js`, and `vitest.config.js` are used as-is. The `package.json` files inside `.codex/` and `.commands/` carry only `type: module`, are unrelated to the template, and are ignored.

## 2. Plugin Shape
---

**Decided**

- One plugin. Core is always on.
- Library, Creative, and Publication are per-vault toggles. A vault may be story-only, stories plus libraries, or all three; one vault currently uses Publication.
- A vault is a container of modules, not a module. A single vault may hold many stories, libraries, and publications.
- **Ship order.** The first release ships Core, without `Entity`, and Creative. `Entity` has not been generated and ships in a later release. The Library pass waits until `Entity` has been generated; Library is then reviewed, fixed, and shipped in a later release. Publication tooling has not been started.
- **Bundled documentation.** Every vault and module has an `ARCHIVE/`. When the plugin is enabled, it copies its `Apparatus Docs/` bundle into the `ARCHIVE/` at the vault root, creating `ARCHIVE/` if it does not exist. The bundle holds the Module, Status, and Affiliations taxonomy guides and the vault-level schema note; class specifications are imported from beside their classes (§4.7). The guides are refreshed when the plugin updates. A settings button copies the class specifications. They give a user the nomenclature and taxonomy to make informed decisions when naming custom category values.

**Decided**

- Toggle state lives in the plugin's `data.json`, which is already per-vault.
- Each module exposes a `register(plugin)` function that calls `addCommand()` for its commands. `src/runtime.ts` calls each enabled module's `register`. `main.ts` is lifecycle only.
- All code stays free of Node and Electron APIs.
- **Identity.** The display name is **Mechanician**: a builder and operator of machines, for a plugin that builds and runs the Apparatus without being it. The id is `mechanician`, final: it cannot change once the plugin is accepted into the community hub. The id is the handle generated notes use to reach the plugin's API (§6.1), so in practice it cannot change once notes exist. The plugin facilitates the LVNACY Apparatus and is not the Apparatus itself.
- **Settings.** One settings tab with a toggle per shipped module. Core has none. Only Creative appears in the first release. A module's commands are visible only while its toggle is on, enforced in each command's `checkCallback`.
- **First-release commands:** `core-create-image`, `creative-create-story`, `creative-create-scene`, and `creative-create-scene-templates` (§6.2). `creative-sync-dependency-docs` is not carried forward, because it documents the `creative/` source tree, which the vault no longer holds.
- **Existing notes.** ~~The plugin does not migrate existing notes~~. Frontmatter migration is Archivist's, and body reconciliation is manual (Existing Note Migration Worksheet §3 and §5). Migrating existing notes will be a future update. Preferably before `Entity` ships.

**Decided.** The class specifications are copied by a button in the settings, which the curator presses to get them. The button copies the class specifications of the shipped modules (Core and Creative in the first release) directly into `ARCHIVE/Apparatus Docs/`. On a plugin update, class specifications found in that folder are updated; if none are found, nothing is copied. Each specification is imported from beside its class through the same `.md` loader (§2.1).

**Rationale for one plugin.** Library and Creative both extend `BaseClass`. Separate plugins would force either duplicate copies of Core (breaking `instanceof` and shared state) or runtime class lookup across plugins (load-order dependence, no static imports).

### 2.1 Source layout

The template expects `main.ts` at the root and code under `src/`. Vitest and coverage both target `src/`.

```text
main.ts                                  Plugin subclass; lifecycle only: onload and onunload delegate to runtime.ts
src/
├── api/
│   ├── v1/
│   │   ├── index.ts                     builds api.v1
│   │   └── types.ts                     the v1 interfaces
│   └── index.ts                         assembles the object served at app.plugins.plugins['mechanician'].api
├── containers/
│   ├── resolve-container.ts             gate resolver: synchronous, metadataCache only, never throws
│   ├── scaffold-visibility.ts           operational and scaffold visibility rules (§3.1)
│   └── types.ts                         ContainerType, ContainerResult (found, none, conflict)
├── core/
│   ├── commands/
│   │   └── core-create-image.ts
│   ├── controls/
│   │   ├── FileSuggest.ts
│   │   ├── FolderSuggest.ts
│   │   ├── NoteSuggest.ts
│   │   ├── ValueSuggest.ts
│   │   ├── index.ts
│   │   └── validate-expected-class.ts
│   ├── frontmatter/
│   │   ├── append-to-frontmatter-array.ts
│   │   ├── build-frontmatter-block.ts
│   │   ├── index.ts
│   │   └── read-frontmatter.ts          the one narrowing function for Obsidian's `any` frontmatter
│   ├── layout/
│   │   ├── field-layout.ts              FieldLayoutEntry, SlotName
│   │   ├── order-fields.ts              applies a schema's order to a layout (§4.2 position rule)
│   │   └── slots.ts                     slot resolver registry and expansion
│   ├── modals/
│   │   ├── BaseModal.ts
│   │   ├── ImageModal.ts
│   │   └── build-schema-fields.ts       renders schema-defined fields through BaseModal's builders
│   ├── objects/
│   │   ├── Archive.ts
│   │   ├── BaseClass.ts
│   │   └── Image.ts
│   ├── resolution/
│   │   ├── index.ts
│   │   ├── resolve-note-file.ts
│   │   └── resolve-titles.ts
│   └── types/
│       ├── frontmatter.ts               FrontmatterValue
│       ├── modal.ts                     ModalResult, KeysOfType
│       └── schema.ts                    ControlName, SchemaFieldDefinition, ResolvedSchema
├── docs/
│   ├── assets/                          taxonomy guides and the vault-level schema note
│   └── sync-docs.ts                     copies the guides, the vault-level schema note, and (when the curator has pressed the button) the class specifications into ARCHIVE/Apparatus Docs/; writes vault-schema-update.md
├── modules/
│   ├── creative/
│   │   ├── commands/
│   │   │   ├── creative-create-scene-templates.ts
│   │   │   ├── creative-create-scene.ts
│   │   │   └── creative-create-story.ts
│   │   ├── controls/
│   │   │   ├── manuscript-pipelines.ts
│   │   │   └── scene-template-helpers.ts
│   │   ├── modals/
│   │   │   ├── SceneModal.ts
│   │   │   └── StoryModal.ts
│   │   ├── objects/
│   │   │   ├── Manuscript.ts
│   │   │   ├── Scene.ts
│   │   │   ├── Story.ts
│   │   │   ├── StoryArchive.ts
│   │   │   └── index.ts
│   │   ├── api-v1.ts                    the `creative` namespace of api.v1 (getStagePipeline)
│   │   └── register.ts                  register(plugin)
│   ├── library/                         later, same shape
│   ├── publication/                     later, same shape
│   └── registry.ts                      id, label, and register for each shipped module
├── schema/
│   ├── fence.ts                         parses `apparatus: <class>` fence lines
│   ├── load-schema.ts                   finds and reads the vault-level and container schema notes
│   ├── merge-schemas.ts                 vault-level plus container merge (§4.7)
│   └── validate-schema.ts               handwritten guards
├── settings/
│   ├── MechanicianSettingTab.ts
│   └── settings.ts                      settings interface and defaults
├── test/                                shared fakes, factories, malformed fixtures, and integration tests
└── runtime.ts                           wiring: settings, module registration, API, settings tab
```

**Decided**

- **Folders, not packages.** The plugin is one package with one `package.json` and one esbuild bundle. `api/`, `containers/`, and `core/` are plain folders. They separate concerns inside the bundle and are not workspace packages.
- **Barrels where useful.** The barrels the codex already has carry over (`core/controls`, `core/frontmatter`, `core/resolution`, `modules/creative/objects`). A new folder gets a barrel only when other folders import several of its members as a unit and it needs little upkeep.
- **Tests are co-located.** `thing.ts` and `thing.test.ts` sit side by side. `src/test/` holds the shared fakes, factories, and malformed-shape fixtures, and the integration tests directly, with no subfolder of their own.
- **Docs bundle.** The guides and the vault-level schema note are embedded through esbuild's `text` loader for `.md` files (`loader: { '.md': 'text' }`), with a `declare module '*.md'` type declaration and a small Vite plugin in the Vitest config so tests resolve the same imports. This is a small edit to the template's `esbuild.config.js` and `vitest.config.js`.
- **One direction of dependency.** `core` is imported by `containers` and `schema`, which are imported by `modules`, which are imported by `settings`, `api`, and `runtime.ts`. `main.ts` imports only `runtime.ts`. A module never imports another module, so Creative and Library stay independent.
- **Layout in `core`, schema I/O in `schema`.** `BaseClass` composes its frontmatter from the layout (§4.5), so layout types, slot expansion, and the position rule live in `core`. `schema/` finds, parses, validates, and merges notes. A command loads the schema and passes the resolved schema to the modal and the class, so `core` never imports the loader.
- **Module registry.** `runtime.ts` calls each enabled module's `register(plugin)`. The settings tab renders one toggle per `registry.ts` entry. Only Creative is registered in the first release.
- **Class specifications** stay beside the class they describe.

**Decided**

- `no-restricted-imports` in the ESLint overlay enforces the dependency direction where the rule can express it.

## 3. Containers
---

**Decided**

- A **container** is a folder whose root holds a note with `class: library`, `class: story`, or `class: publication`.
- All module operations are scoped to their container, except the commands that scaffold the container itself.
- Containers nest without limit and across all module types. The container type stays correct at each level: library commands run only inside a library, story commands only inside a story, and no scene is creatable inside a library's `works` folder. A library nested in a story exposes library commands inside the library, while the story's own folder structure continues to default to story commands.
- One folder never holds two container notes. If one does, the operation is cancelled: an error is thrown and surfaced as an Obsidian `Notice`.
- Scaffolding needs only a folder containing a blank note.

### 3.1 Command visibility

| Command kind | Visible when | Examples |
| --- | --- | --- |
| Operational | The active file is inside a container of the matching type. | `library-create-article`, `creative-create-scene`, `creative-create-scene-templates` |
| Scaffold | The active note sits in the folder that will become the container, that folder holds no container note of any type, and the nearest enclosing container is not of the same type. | `library-create-library`, `creative-create-story` |
| Container-free | Always. | `core-create-image` |

Only the nearest enclosing container decides scaffold visibility. Inside a story, `creative-create-story` is hidden and `library-create-library` is still visible. Inside a library nested in a story nested in a library, `creative-create-story` is visible, because the nearest container is a library. A folder that already holds a container note shows no scaffold command of any type, so the plugin cannot create a second container note in a folder. The check runs again when the command executes, because the folder may have changed since the palette was drawn.

Scaffolding is anchored on an active note (for example the README of a git-submodule folder) so a module stays portable as a self-contained folder.

### 3.2 Gate resolver

**Decided.**

The gate resolver is a separate function that:

1. Starts at the active file's parent folder and walks toward the vault root, at any depth.
2. At each folder, looks only at that folder's direct children through `metadataCache`.
3. Returns `{ type, note }` for the nearest folder holding a container note of any module class, or `null`.
4. Never throws and never reads file contents.

Operational commands compare the returned `type` to their own. The existing throwing resolvers remain for use after a command has already passed its gate.

A `checkCallback` can neither throw nor show a `Notice`. So the resolver reports a folder holding two container notes as a conflict result rather than throwing. The command stays visible, and running it throws the one-note error and shows the `Notice`, so the failure is explained instead of silently hiding commands. The scaffold check in §3.1 stops the plugin from creating this state; a second container note added by hand, or a folder merged in from elsewhere, still produces it.

## 4. Module Schemas
---

**Decided (concept).** A container's customizations are data, not code. A context library such as Pulp Fiction or Victorian Mayhem adds frontmatter properties and category vocabulary to the base classes; the plugin reads a schema from the container and the classes and modals adapt. One command set serves every container. This applies to any module's container, not only Library.

**Decided (shape).** Schema-driven values travel in a nested object named `schemaFields` on class options and on modal results, and are rendered flat into frontmatter at write time. The typed core keys stay strictly typed; `schemaFields` is the only open-ended part.

### 4.1 Precedent

`Works` already reads configuration off its container: `library-tag`, `works-folder-name`, and `citation-style` are read off the library note. A schema is the same mechanism at larger scale, and it travels with the container folder.

### 4.2 Schema note

**Decided**

- A schema is a note at the root of the container, named `{module-name}-schema.md`, where `{module-name}` is the module instance's own name and not its type. A Pulp Fiction library's schema is `pulp-fiction-schema.md`. This is generated at scaffold time with schema blocks populated with existing fields, see below.
- The plugin loads the first `*-schema.md` at the container root, in path order, and applies what it finds to the matching classes in that container. A note matching the pattern that holds no schema block is ignored.
- Schemas are written in YAML, inside fenced code blocks. The plugin reads only those blocks and ignores the rest of the note, so the note can carry instructions and documentation.
- Scaffolding a container creates its `*-schema.md`, pre-filled with one block per class the module ships, each listing that class' fields. The Core `Entity` classes a module extends are included once `Entity` ships. The curator edits a block to add fields where desired. The note carries instructions for the curator outside the blocks.
- Base properties are immutable. A customized class takes all of its base frontmatter and adds its own. A schema cannot eliminate a base field: a base field deleted from a block's list is ignored and the field is still written.
- A schema can add category values to a class.
- The schema lists the field order. Any field, base fields included, can be reordered. No base field can be deleted: an omitted base field keeps its base position and added fields interleave around it. Given base fields a, b, c, d and a block listing a, x, c, the written order is a, b, x, c, d.
- Each block names its class in the fence's info string as `apparatus: <class>`, so one note can customize several classes with one block each. The plugin parses the fence line itself, so its own reading does not depend on how Obsidian renders the block. The form is provisional: if it fails in practice, it changes.
- First wins. The first note consumed wins, and within a note the first block for a class wins. Duplicate schema notes and duplicate class blocks are curator error; the note's instructions say not to create them.
- A block whose class does not belong to the container's module cancels the operation with a Notice that calls the user an idiot.
- A schema is untrusted runtime data, validated by handwritten type guards that fail loudly on a bad shape. No validation package is added; zod is reconsidered only if handwritten guards become unwieldy.
- In a block's field list, a bare name is a base field and a mapping defines an added field as `{ label, control }` plus `options` where the control needs them. `control` names a `BaseModal` builder: text, dropdown, multi-select, list, list-suggest, note-link, note-list, or toggle. Category additions sit under a `category` key.
- Notes are consumed in path order, so "first" is deterministic.
- Schemas are read asynchronously when a command runs. Command gating never reads them.
- Class validity is checked when a schema loads, so every command in the container cancels until an invalid block is fixed.
- The Obsidian API's `parseYaml` parses the block without a new dependency.

Illustrative block as the curator would edit it (base fields abbreviated; `cover-artist` added by the curator):

````markdown
```apparatus: monograph
category:
  - pulp-novel
fields:
  - class
  - category
  - affiliations
  - sort-title
  - created
  - modified
  - authors
  - isbn
  - cover-artist:
      label: Cover artist
      control: note-list
  - publisher
  - context
  - tags
```
````

**Block grammar**

```ts
type ControlName =
	| 'text'
	| 'dropdown'
	| 'multi-select'
	| 'list'
	| 'list-suggest'
	| 'note-link'
	| 'note-list'
	| 'toggle';

interface SchemaFieldDefinition {
	label: string;
	control: ControlName;
	options?: string[];
	expectedClass?: string[];
}

type SchemaFieldEntry = string | { [key: string]: SchemaFieldDefinition };

interface SchemaBlock {
	category?: string[];
	fields: SchemaFieldEntry[];
}
```

| Control | `BaseModal` builder | Value type | Extra keys |
| --- | --- | --- | --- |
| `text` | `buildTextSetting` | `string` | none |
| `dropdown` | `buildDropdownSetting` | `string` | `options` required |
| `multi-select` | `buildMultiSelectSetting` | `string[]` | `options` required |
| `list` | `buildListSetting` | `string[]` | none |
| `list-suggest` | `buildListSuggestSetting` | `string[]` | none; suggestions come from the field's own key |
| `note-link` | `buildNoteLinkSetting` | `string` | `expectedClass` optional |
| `note-list` | `buildNoteListSetting` | `string[]` | `expectedClass` optional |
| `toggle` | `buildToggleSetting` | `boolean` | none |

A bare string in `fields` is a base field or a slot (§4.5). A mapping defines an added field. `category` adds values to a class that declares a fixed category vocabulary; on a class with none, the added values have nothing to join.

### 4.3 Schema note template

**Decided.** The scaffolded `*-schema.md` carries instructions outside its blocks covering:

- Only `apparatus` blocks are read; everything else in the note is ignored.
- One schema note per container and one block per class. Duplicates are ignored in favor of the first, and the curator should not create them.
- A base field cannot be removed. Deleting its line has no effect.
- How to add a field: where to place the line, and the `label` and `control` keys with the list of controls.
- How to add category values.
- A block's class must belong to the container's module, or the operation is cancelled.

**Open:** the full wording.

### 4.4 Code changes the schema depends on

Observed in `BaseClass.js`, `Works.js`, `Monograph.js`, `BaseModal.js`, `WorksModal.js`, and `MonographModal.js`:

| Gap                                         | Where                                                                                               | Required change                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unknown options are dropped                 | `Works` constructor copies only named options                                                       | Accept `schemaFields` in options and hold it on the instance.                                                                                                                                                                                                                                                                                                                     |
| Frontmatter key list is hardcoded | Leaf `getFrontmatterFields()` builds an explicit object                                             | Compose the output from `fieldLayout()` (§4.5), which places `schemaFields` according to the schema. |
| Category vocabulary is container-blind      | `static categoryOptions()` takes no arguments                                                       | Pass the container note so per-container vocabulary can apply; `buildCategorySetting(containerEl, ObjectClass)` changes with it.                                                                                                                                                                                                                                                  |
| Modal fields are hardcoded                  | Each modal's `onOpen()` lists its builders                                                          | Render schema fields through the existing builders into `schemaFields`.                                                                                                                                                                                                                                                                                                           |
| Base field order exists only on an instance | `getFrontmatterFields()` is an instance method, and a `Works` constructor resolves its library note | Each class exposes its base field order without running its constructor, so a scaffold can write the schema note before any note of that class exists. `Scene`, `Manuscript`, and `Story` have conditional or dynamic keys (§9.1), which a static list cannot express. The Existing Note Migration Worksheet identifies the same need for template generation and note hydration. |

### 4.5 Field layout

**Decided.** Each class exposes its field order as data, without running its constructor or any resolver. The Existing Note Migration Worksheet (§3, §7) needs the same thing for template generation and note hydration.

- `static fieldLayout()` returns an ordered list. A fixed entry is `{ key }`. A dynamic entry is `{ slot }`, a position whose keys are decided at write time.
- The slot list is closed. The reviewed classes have two. `status`, on `Scene` and `Manuscript`, resolves to `serial-status` when `stage` is `serial-draft` and to `editorial-status` otherwise. `manuscript-links`, on `Story`, expands to one key per stage in the story's pipeline.
- A schema block writes a slot as its name in angle brackets, `<status>` or `<manuscript-links>`. The marker cannot collide with a property, because the Apparatus Status Taxonomy retires plain `status`. The position rule in §4.2 applies to a slot as it does to a base field, so a schema cannot remove one.
- The scaffolded schema note is generated from `fieldLayout()`.
- `getFrontmatterFields()` is composed from the layout. The class supplies the layout and a value for each key, and `BaseClass` assembles them in order, so a class's field order is defined once.

**Write-time sequence**

1. The class supplies its layout.
2. The schema loader supplies the block's order, if the container has a block for the class.
3. The two merge by the position rule in §4.2.
4. Slots expand from the instance's own state.
5. Values come from the instance for layout keys and from `schemaFields` for added keys, and `buildFrontmatterBlock` renders the result.

**Adding a slot (Proposed).** The closed list can grow by documented steps:

1. Add the slot's name to the `SlotName` union.
2. Register a resolver for it, a function from a class instance to the ordered list of keys the slot expands to. The `status` resolver returns `[scene.statusFieldKey]`; the `manuscript-links` resolver returns the story's `pipeline`.
3. Put `{ slot }` at the right position in the layout of each class that uses it.
4. Add the `<name>` marker to the instructions in the scaffolded schema note.
5. Add a test that the slot expands as intended and that a schema cannot remove it.

A general computed-keys mechanism may replace the closed list at a later time.

### 4.6 When a schema takes effect

A container schema note is created with its container, so it cannot be edited before the container's own scaffold writes its notes. A block therefore affects only notes created afterward.

- **Container classes.** The container note (`story`, `library`, `publication`) is written during the scaffold, so a block for its own class has no effect in the container schema. **Decided:** scaffolded container schema notes omit container-class blocks. The vault-level schema (§4.7) reaches these notes.
- **Creative.** `story`, `manuscript`, and the story's archive note are all written by the story scaffold. The container schema can therefore customize only `scene`, which the curator accepts. The vault-level schema can customize all four. The recurring objects (scenes, works, collections, columns) are what matter.
- **Scene templates.** **Decided:** schema fields reach the Longform scene templates. A command generates the templates from the scene's effective layout (§6.2).

### 4.7 Vault-level schema

A vault-level schema lets the curator add fields to a module's notes across every container in the vault, including the notes a scaffold writes. It is specified for Creative. The same mechanism can serve Library and Publication.

**Decided**

- **Bundle and location.** The vault-level schema note ships in the `Apparatus Docs/` bundle (§2). When the plugin is enabled, the bundle is copied into `ARCHIVE/` at the vault root. The curator can name the note and place it anywhere, and tells the plugin where it is through a file-suggest setting.
- **What it reaches.** It can provide properties for any class of its module. For the classes a scaffold writes (for Creative, `story`, `manuscript`, and the archive note), it is the only schema that can reach them, because a container schema does not exist yet when they are written. For a class created afterward (`scene`), both schemas can define blocks, and the merge rules below apply.
- **Scaffold copies.** The story scaffold copies the vault-level schema's properties into the new container schema note.
- **Merge.** The vault-level and container schemas merge whenever a schema loads, so a property added to the vault-level schema after a scaffold still reaches existing containers.
  - All properties from both schemas are added, with the vault-level properties interleaved before the container properties.
  - A property that is identical in both, across name, object, keys, and values, is added once.
  - Where the two define the same property differently, the closest schema wins, which is the container schema, and a Notice calls out the discrepancy.
- **No overwrite.** The vault-level schema note is copied only when absent and is never overwritten. When a plugin update changes the shape of a class, the plugin writes a `vault-schema-update.md` into `Apparatus Docs/`, so the curator can see the new shapes and apply them by hand.
- **Container schema contents.** Scaffolded container schema notes omit the classes the scaffold itself writes (the container class, `manuscript`, and the archive note). A block for them could never take effect there, and the vault-level schema carries them.

**Decided**

- A vault-level property absent from the container block is placed immediately after its nearest preceding field in the vault-level list that the container block contains, ahead of container-added fields that follow that field. This is the §4.2 position rule applied to two schemas. The curator has accepted it.
- A difference in position alone is not a conflict. The container schema's position wins.
- Category additions from both schemas are combined.
- `vault-schema-update.md` is written when a plugin update changes any class's layout, and holds the current layouts in schema-block form so they can be compared with the vault-level schema.

## 5. Typing and Strictness
---

**Decided**

- The codebase migrates to TypeScript. Classes stay classes; interfaces describe shapes (options, results, frontmatter values, gate and schema structures) and do not replace classes.
- A class and its modal are typed against one shared contract, and the compiler checks the pairing.
- Compiler strictness is a **floor**: the template's configuration is the minimum, and the code is held to more where that is reasonable to manage.
- The strictness configuration (`tsconfig.json` and `eslint.config.js`) is not edited; the overlay extends it. The build configuration takes the docs loader edit (§2.1).

### 5.1 Typing model

**Decided**

```ts
type FrontmatterValue =
	| string
	| number
	| boolean
	| null
	| FrontmatterValue[]
	| { [key: string]: FrontmatterValue };

interface BaseOptions {
	filename: string;
	folder?: string;
	category?: string[];
	affiliations?: string[];
	context?: string[];
	tags?: string[];
	schemaFields?: Record<string, FrontmatterValue>;
}

type ModalResult<TOptions extends BaseOptions> = Required<Omit<TOptions, 'folder'>>;

type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
```

- Even if no values are provided, the fields are still populated in the instantiated object.
- Each class has an options interface that extends its parent class's options interface: `WorksOptions extends BaseOptions`, and `MonographOptions extends WorksOptions`. Nothing extends a leaf's interface.
- `BaseModal<TResult>` is generic. Builders constrain their key by value type: `buildTextSetting` accepts `KeysOfType<TResult, string>`, `buildListSetting` accepts `string[]` keys, `buildToggleSetting` accepts `boolean` keys.
- A command joins the two sides with `new Leaf(app, { ...result, folder })`, so a field a modal collects and a class ignores is a compile error.
- Each modal tier exports a typed default-result factory in place of `Object.assign(this.result, {...})`.
- A builder writes `this.result[resultKey] = value` for a key it receives as a generic type. TypeScript cannot prove the value matches whichever key was passed, so each builder contains one type assertion at that write. The assertion is safe because the builder's key parameter is already limited to keys whose value type matches (`KeysOfType`), which the compiler checks at every call site.
- `this.constructor.classValue` needs a typed constructor reference. TypeScript has no `abstract static`, so the requirement that every leaf declares `classValue` is enforced where classes are registered, through a static-side type (`classValue`, `categoryOptions()`, `resolveFolder()`, constructor signature).
- `BaseClass` and `Works` become `abstract`.
- Obsidian types frontmatter as `any`: `FrontMatterCache` is `{ [key: string]: any }`, and `processFrontMatter` hands its callback an `any`. All frontmatter reads go through one narrowing function at the boundary.
- Catch variables are narrowed with `instanceof Error` before use.

### 5.2 Strictness floor and local overlay

The template enables `noImplicitAny`, `strictNullChecks`, `strictPropertyInitialization`, `strictFunctionTypes`, `noUnusedLocals`, and `noUnusedParameters`, but not `strict: true`. It lints at `warn` for `no-explicit-any` and `no-non-null-assertion`, has no `no-unsafe-*` rules, and has no `no-floating-promises` or `no-misused-promises`.

**Decided.** The template's ESLint configuration enforces list style through `@stylistic/list-style` on TypeScript files: lists of more than two items break one per line, and interface bodies are always multi-line. No suitable lint rule for alphabetizing exists, so grouping and alphabetizing declarations, as the Code Style Guide requires, is done by hand. The display name "Mechanician" goes in the `brands` option of `obsidianmd/ui/sentence-case` in `eslint.config.js`, where the template currently lists its own plugin's name.

**Decided.** Flexibility outranks maximum strictness: a flag that makes the codebase hard to evolve stays out of the overlay. Optional function parameters are unaffected by the overlay. `exactOptionalPropertyTypes` is the one flag that changes how optional properties behave (an optional property could no longer be assigned `undefined` explicitly), so it is left out.

**Decided:** a local overlay, leaving the template files untouched:

| Overlay | Contents |
| --- | --- |
| `tsconfig.strict.json` extending `tsconfig.json` | `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` |
| ESLint overlay | `no-explicit-any` and `no-non-null-assertion` at `error`; the `no-unsafe-assignment`, `-member-access`, `-argument`, `-return`, and `-call` rules; `no-floating-promises`; `no-misused-promises`; `no-restricted-globals` for `Buffer`, `global`, `__dirname`, `__filename`, and `require` in `src/`; `no-restricted-imports` for the dependency direction in §2.1 |

Consequences already visible in the reviewed code:

- `noImplicitOverride` requires `override` on every `getBody`, `getFrontmatterFields`, `postCreate`, and `onOpen` override.
- `noUnusedParameters` rejects `BaseClass.postCreate(file) {}`, whose base implementation is empty. No underscore-prefixed identifiers are used anywhere. Privacy is expressed in code with `private`, `protected`, or a non-exported module member, not by naming convention. The empty hook is typed without an unused parameter, or the base implementation uses it; the mechanism is verified against the compiler during development.
- `no-misused-promises` flags `BaseModal.buildSubmitButton()` calling `onSubmit(this.result)` without awaiting it. Expect further `async` call sites to need the same correction.
- `noUncheckedIndexedAccess` affects `part[0].toUpperCase()` in `name-format.js` `initials()`, `formatted[0]` in `joinNamesNormal()`, and every `this.result[resultKey][index]` access in `buildNoteListSetting()`.
- `lib` is `ES2020`, so `replaceAll` and `Array.prototype.at` do not typecheck.
- `src/` contains no JavaScript files. The template's ESLint configuration lints the config files, and `tsconfig.json` includes only `**/*.ts`.
- `"types": ["node"]` lets Node globals typecheck. A search of the reviewed code found no Node globals or Node imports in use. `process.env.*` is compile-time substitution in the template's build (`define` in `esbuild.config.js`). The ESLint overlay restricts Node globals in `src/` so a stray use fails lint.

**Decided:** the overlay is invoked through two scripts beside the template's own. `build` gates on `typecheck` (`tsc`) only, so the strict scripts do not block a release.

```json
// package.json
"scripts": {
	"dev": "node esbuild.config.js",
	"typecheck": "tsc --noEmit --skipLibCheck",
	"typecheck:fast": "tsgo --noEmit --skipLibCheck",
	"typecheck:strict": "tsgo --noEmit --skipLibCheck -p tsconfig.strict.json",
	"lint": "eslint .",
	"lint:strict": "eslint -c eslint.strict.config.js",
	"test": "vitest run",
	"test:coverage": "vitest run --coverage",
	"test:ratchet": "pnpm test:coverage && node .coverage/check-coverage-ratchet.js",
	"build": "pnpm typecheck && node esbuild.config.js production",
	"version": "node version-bump.js && git add manifest.json versions.json"
}
```

## 6. Commands
---

- Command ids and the `<module>-create-<class>` naming convention carry over from `.commands/`.
- Each command stays a thin entrypoint: gate, open modal, resolve folder, instantiate, `create()`, open the file.
- Visibility logic lives in each command's `checkCallback`, using the gate resolver in §3.2.
- Any module's `register(plugin)` can add commands from the module's own folder; no central command directory exists.

### 6.1 Plugin API

**Decided.** The API is the extension point, and it is built to be robust. It exposes enough of the system that a script can extend a class and instantiate the result. Mechanician does not load, register, or run code from outside itself. Extension scripts run in CodeScript Toolkit and reach the plugin through the API. For example, a script extends `Monograph` into a Pulp Fiction monograph class and creates notes with it. The API also serves querying and normal use: generated DataviewJS and the plugin's own commands.

**Decided.** The API is versioned by namespace from the first release: `app.plugins.plugins['mechanician'].api.v1`. Within a version, changes are additive only. A breaking change ships as a new namespace, `api.v2`, while `api.v1` stays served, so nothing written against an older version breaks. Generated notes and extension scripts call `api.v1`.

**Decided.** Each version serves, typed with `obsidian-typings`:

- `core`: `BaseClass`, `BaseModal`, `Archive`, `Image`, `ImageModal`, the controls, the frontmatter helpers, the resolvers, and `reportError`.
- `containers`: the gate resolver.
- `schema`: schema loading and merging (§4.2, §4.7).
- `layout`: the field layout types and ordering (§4.5).
- One namespace per shipped module. `creative` holds `Story`, `Scene`, `Manuscript`, `StoryArchive`, their modals, and `getStagePipeline`, the only function any generated note calls today. `getStageIndex` and `getPriorStage` stay internal. `library` follows when Library ships.

**What a subclass overrides (Decided).** The hooks an extending script relies on are part of the contract:

- `static classValue`, `static categoryOptions()`, `static fieldLayout()`, and `static resolveFolder()`.
- A per-key value hook, `fieldValue(key)`, which `BaseClass` calls for each key in the layout (§4.5). A subclass overrides `fieldLayout()` to add keys and `fieldValue(key)` to supply their values, calling `super` for the rest.
- `getBody()` and the section hooks beneath it, and `postCreate()`.
- A subclass keeps its parent's `classValue`, so schema blocks and Dataview queries that key off `class` continue to apply. A monograph is a monograph in any library, and the library tag provides the differentiation.
- A script that instantiates a class loads the schema first, through `api.v1.schema`, and passes the resolved schema in the options, as the plugin's own commands do.

Every function a generated note calls, and every exported class and hook, is a contract with the version that serves it. A note created today stays in the vault, so a change that removes or alters a function a generated note calls is a breaking change and ships as a new version.

New `Story` and `StoryArchive` bodies call `api.v1.creative.getStagePipeline` in place of `requireAsync('/.codex/creative/controls/manuscript-pipelines.js')`.

### 6.2 Scene template command

Schema fields reach the Longform scene templates. The story scaffold does not create templates. A command generates them after the curator has filled out the schema, for use with Templater or the core Templates plugin. A curator can skip templates entirely and use `creative-create-scene`.

**Decided**

- The command is `creative-create-scene-templates`, an operational command visible inside a story container.
- The placeholder for the created date follows a template-engine setting: Templater (`<% tp.date.now() %>`, the default) or the core Templates plugin (`{{date:YYYY-MM-DD}}`).
- The `titleAbbv` check moves from the story scaffold to this command, since the scaffold no longer uses it.
- When a template is generated, the command writes its path into the Longform `sceneTemplate` of the matching stage's manuscript. Until a template is generated, `sceneTemplate` stays blank.
- Collisions throw, per the governing constraint. To regenerate a template, the curator deletes the existing one.

**Decided**

- Output location and naming are as `Story.buildSceneTemplates()` produces them today: the story folder's root, as `<titleAbbv>-<suffix>.md`.
- Each template holds frontmatter from the scene's effective layout with blank values, `tags` holding the story tag, and the created-date placeholder, followed by the scene body.

## 7. Logging
---

`utils/logger.js` exists only in the Apparatus; the template has no logger. It exposes seven levels (`fatal`, `error`, `warn`, `log`, `info`, `debug`, `trace`), each firing an Obsidian `Notice` and the matching `console` method. It conflicts with the template's lint configuration: it opens with an `eslint-disable` comment, which the template forbids, and it calls `console.log`, `info`, `debug`, and `trace`, which `no-console` does not allow.

**Decided.** The Logging flow in `.codex.md` is respected. Class, modal, control, and helper code throws. The command's handler is the error boundary: it reports a failure exactly once and does not rethrow.

**Observed in Tab Candy and Word Census.** Neither has a logger module.

- Both call `console.error` and `console.warn` directly, which the template's lint allows. The plugin's name prefixes the message and the caught error is the second argument.
- Both show a Notice, also prefixed with the plugin's name, only for failures the user can act on, such as a failed settings save or a failed export.
- Some non-critical failures log with `console.error` and degrade to a safe default.
- Neither logs successes, and neither uses a debug or info level.
- Word Census injects its Notice function into services as `notify`, which keeps them testable.

**Decided**

- No `Log` object and no levels. The seven levels, the success Notices, and the tracing calls are not carried forward.
- One helper, `reportError(context, error)`, in `core/`, called by each command's error boundary. It calls `console.error('Mechanician: <context>', error)` and shows one `Notice` prefixed `Mechanician:`, so the prefix and the exactly-once rule live in one place.
- Errors thrown by class, modal, control, and helper code carry messages written for the user, because the Notice shows them.
- Non-fatal conditions (a schema conflict, §4.7) show a Notice, with `console.warn` when the detail helps.
- Success needs no Notice. A command opens the note it created.
- No catch is silent. A catch reports through the boundary, or logs with `console.error` and degrades.
- `BaseClass.create()`, `validateExpectedClass`, and `appendToFrontmatterArray` only throw. `validateExpectedClass` stops logging before it throws.
- A modal's submit callback is awaited inside the click handler, so the command's `catch` receives its failures (`BaseModal.buildSubmitButton()` does not await `onSubmit` today, §5.2).

## 8. Dependencies
---

The plugin depends on no other plugin and no runtime package. Validation is handwritten, and the `package.json` carries no runtime dependencies.

Generated notes reference other plugins. These are references, not dependencies: without one, the note loses that function and the plugin still works.

| Plugin | Referenced by | Without it |
| --- | --- | --- |
| Dataview (DataviewJS) | Query and dashboard blocks in generated bodies | The blocks do not render. |
| Templater | The scene template command writes `<% tp.date.now() %>` into the generated scene templates when the template engine setting is Templater (§6.2) | The placeholder stays literal, and the curator enters the created date manually. |
| Longform | `Manuscript` writes a `longform` configuration | The property has no effect. |
| Custom File Explorer sorting | `Story` and `Manuscript` write `sorting-spec` | The property has no effect. |
| CodeScript Toolkit | Existing generated notes call `requireAsync` (§9.1) | Those blocks fail. New notes use the plugin API. |

## 9. Code Review Outcomes: Core and Creative
---

Reviewed from `lvnacy-notes/codex` at commit `87cd5af`. The `.commands/` files are not in the repository; the class specifications describe them (`Story.js Specification` §8, `Scene.js Specification` §7, `Image.js Specification` §7).

### 9.1 Required changes

| Change | Reason |
| --- | --- |
| Generated DataviewJS calls the plugin API in place of `await requireAsync('/.codex/creative/controls/manuscript-pipelines.js')`: three `Story` dashboard blocks, and `StoryArchive`'s `sceneIntegrityScript` and `snapshotExistenceScript`. Existing notes keep the `requireAsync` form until rewritten. | A bundled plugin ships no `.codex/` folder, and new notes should not need CodeScript Toolkit. The stage list stays in the plugin, so a pipeline change reaches every note (§6.1). |
| `Scene` and `Manuscript` declare a `status` slot, and `Story` a `manuscript-links` slot, in their field layouts (§4.5). | `Scene` and `Manuscript` write `editorial-status` or `serial-status` by `stage`. `Story` writes one key per pipeline stage, so its key set depends on `category[0]`, and its constructor throws on a category with no pipeline. A field list cannot come from running a constructor. |
| `context` is a `string[]` of wikilinks on `Scene`, `Manuscript`, and `SceneModal`, and the commands pass `[]` in place of `''`. | `BaseClass` and its spec define it that way. `Scene.js Specification` §1 and §6 document a string and change. Existing notes that carry a string are a migration matter. |
| One source each for the stage lists and the status-key rule. `Story`'s dashboard derives its cross-stage lineage sections from the pipeline. | Stage lists appear in `SceneModal` and `manuscript-pipelines.js`. The status-key rule appears in `Scene.statusFieldKey`, `Manuscript`'s `statusFieldFor`, and dashboards. The lineage sections are hardcoded for shitty-first-draft through 3rd-edit regardless of pipeline. |

### 9.2 Taxonomy alignment

The taxonomies win wherever the code differs from them.

| Item | Resolution |
| --- | --- |
| Scene `editorial-status` | Takes the Status Taxonomy list (`backlog`, `in-progress`, `revision`, `ready`, `complete`, `abandoned`), and `not-started` goes. The `Story` dashboard, the `Story` documentation text, and the status lists in `StoryModal` and `SceneModal` conform. |
| `serial-status` | `Story`'s documentation text conforms to the taxonomy (`backlog`, `active`, `ready`, `published`). `Scene` already matches. |
| `story-status` | `StoryModal` drops `archived`. |
| Story `category` | `flash-fiction` stays in the taxonomy and gains a stage pipeline when it is developed. |
| `cycle` | Stays both a stackable `category` value and a separate property. `StoryModal`, which offers only a pick-one length/form, gains the stackable value. |

## 10. Parked
---

**Library module.** Library has not had a full pass and likely has holes. The pass waits until `Entity` has been generated. It ships after Core and Creative. These Library observations are recorded for that pass:

- Every Works leaf (`Monograph`, `Interview` reviewed) omits `cites`, `related`, and `part-of` from `getFrontmatterFields()`, although `WorksModal` collects them and `getBodyDashboard()` queries `cites` and `related`. The curator confirms this is intentional and is open to a better option in the plugin.
- `Works.postCreate()` reads `this.interviewer` and `this.interviewee`, which only `Interview` declares. A protected hook on `Works` returning the accession contributors, overridden by `Interview`, would remove the dependency; the `?? []` fallbacks go with it.
- Accession pushes only `this.authors` into a Collection's and Periodical's `authors`, so an `Interview` (empty `authors`) never propagates its interviewees.
- `citation-engine.js` passes all five role fields to `resolveAuthors` on every call; `resolveAuthors` treats a missing array as empty, so this is tolerated.
- Formatter inputs (`mla.js`) are documented per leaf in each function's JSDoc and become `CitationFields` types per leaf.
- The citation engine's logging follows the old rules; it is revisited once the logging setup is decided (§7).

**Idempotent commands.** A future update lets the setup and Create commands be re-run against existing notes to apply a changed class shape, and leave notes that gain nothing unchanged. An example is iterating existing `Story` notes after the shape of `Story` changes. This relates to note migration (§2).

**Extension code loading.** Mechanician does not load code from vault files, which would need `eval`-style loading that the template's lint forbids (`no-eval`, `no-implied-eval`). Extension scripts run in CodeScript Toolkit and reach the plugin through the API (§6.1). The schema approach in §4 covers extra frontmatter properties and vocabulary.

## 11. Testing

Tests follow the LVNACY Testing Philosophy. The development session writes the project's `docs/TESTING.md`, which applies it: the load-bearing behaviors below, the trust boundaries specific to this plugin, deviations, known gaps, and open implementation items. There is no deviation from the philosophy so far. Tests are co-located, with integration tests and shared helpers in `src/test/` (§2.1). The coverage Ratchet in the template enforces the floor, and its baseline starts at zero.

**Load-bearing behaviors.** The development session confirms them when it writes `docs/TESTING.md`. All are pending the code that does not exist yet.

**Silent and wrong**

- Container resolution returns the nearest container of any type through unbounded nesting, and command visibility follows §3.1.
- Field ordering follows the position rule and honors a schema's reordering, and slots and `<name>` markers expand correctly (§4.2, §4.5).
- Schema merging adds a property that is identical in both schemas once, interleaves vault-level before container properties, and lets the container schema win a conflict with a Notice (§4.7).
- Frontmatter rendering handles arrays, nested objects, multi-line strings, and strings that begin with `[`.
- Stage pipelines resolve for every length/form, `flash-fiction` throws, and the status key follows the stage.
- A failure inside a command is reported exactly once and cancels the operation (§7).

**Destructive**

- The vault-level schema note is never overwritten, the guides refresh, and `vault-schema-update.md` is written when a layout changes.
- A create that collides with an existing note or template throws and never overwrites.
- `appendToFrontmatterArray` appends without duplicating and leaves other keys intact, and writing a manuscript's Longform `sceneTemplate` touches only that key on the matching stage.

**Fatal to the host**

- The gate resolver never throws and stays cheap, because it runs whenever the palette opens.
- A malformed schema note (bad YAML, wrong shape, unknown control, a class outside the module) produces a Notice and a cancelled operation, never an uncaught error.

**Cumulative**

- Modals and suggest controls release their listeners on close.

**Outside our control**

- Reaching the API through `app.plugins.plugins['mechanician'].api.v1`, which relies on undocumented internals and is the contract generated notes depend on.
- The `api.v1` exported classes, constructor options, and override hooks, which extension scripts depend on and which only grow within a version (§6.1).
- Frontmatter reads from `metadataCache` and writes through `processFrontMatter`, where Obsidian types values as `any`.
- Code paths that differ on mobile, exercised through the template's `EMULATE_MOBILE` hook.

Whether `obsidian-test-mocks` implements `metadataCache.getFileCache` and `vault.getMarkdownFiles` well enough for the gate resolver is unverified.

## 12. Open Items
---

No design items are open. One piece of content remains to be written: the instruction text for the scaffolded schema note (§4.3).

**Documentation before the first release.** The taxonomy guides ship inside the plugin, and the class specifications are copied by the settings button (§2), so whatever they say ships.

1. The Affiliations Taxonomy referenced the removed World-Building module and a `character` class. A corrected copy is prepared.
2. The Module Taxonomy's status list omitted `library-status`. A corrected copy is prepared.
3. The Core and Creative class specifications come current during the port: `.js` filenames and paths become `.ts`, `Scene.js Specification` §1 and §6 take the `context` decision, the status vocabularies take §9.2, `Story`'s documentation text conforms, and generated DataviewJS calls the API (§9.1).
4. `creative.md` documents a `core/manuscriptPipelines.js` path that does not match the code (`creative/controls/manuscript-pipelines.js`), and describes the `requireAsync` call that the API replaces. It is updated with the port.

**Documentation before the development session starts.**

5. `.codex.md` and `.commands.md` describe the CodeScript Toolkit-era codex. They contradict each other on loading (`requireAsync()` against static `import`) and on error handling, and `.codex.md` carries stale paths (`/.codex/objects/BaseClass.js`, `frontmatter-helpers/`). The plugin replaces both. Mark each superseded by this spec, or retire them, so the session does not read an old convention as current.

**Documentation with the Library pass.**

6. `Author`, `Glossary`, `Definition`, and `Library` appear in the module map and the code but not in the Module Taxonomy's vocabulary tables. Whether `Author` becomes the Core `person` class once `Entity` ships is not settled in the Entity documents, so the tables wait for that decision.

## Appendix: Source Review Status
---

| Source | Status |
| --- | --- |
| `BaseClass.js`, `BaseModal.js`, `Archive.js`, `Image.js`, `ImageModal.js` | Reviewed |
| `controls/` (all files), `frontmatter/` (all files), `resolution/` (all files), `utils/` (all files) | Reviewed |
| Creative code: `Story`, `Scene`, `Manuscript`, `StoryArchive`, `StoryModal`, `SceneModal`, `manuscript-pipelines.js`, `scene-template-helpers.js`, `objects/index.js` | Reviewed |
| `Works.js`, `Monograph.js`, `Interview.js`, `WorksModal.js`, `MonographModal.js`, `citation-engine.js`, `mla.js`, `name-format.js` | Reviewed (Library, parked) |
| Template configs (`package.json`, `tsconfig.json`, `eslint.config.js`, `esbuild.config.js`, `vitest.config.js`) | Reviewed |
| `creative.md`, `Code Style Guide.md`, `Existing Note Migration Worksheet.md` | Read |
| Class specifications: `Story.js`, `Scene.js`, `Manuscript.js`, `StoryArchive.js`, `Archive.js`, `Image.js` (sections on scope, frontmatter, status, modal, command, open items), and `BaseClass.js` (scope, creation workflow, static helpers, command) | Read |
| Tab Candy and Word Census (`lvnacy-notes/tabcandy`, `lvnacy-notes/wordcensus`): logging and notice call sites, and the `src/test/` layout | Reviewed. Word Census's `docs/TESTING.md` is a worked example of the file the development session writes. |
| `.commands/` files | Not in the repository. Their behavior is specified in the class specifications above; the files themselves are not needed for design. |
| `Apparatus Retrofit Work Checklist.md`, `Apparatus Spec Workflow Handoff.md`, `Module Maintenance Checklist.md`, `Publication Module Implementation.md`, the Library specifications | Present in the repository; not read |
| `Entity` and `Constituent` | Not yet generated; ships in a later release. `Entity.js Specification.md`, `Schema.md`, and `Remediation.md` are present and not read. |