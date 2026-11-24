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

Mechanician is the Obsidian plugin that ships the Apparatus codex (Core, Creative, Library, Publication), registers every command, gates commands by container context, and adapts classes and modals to per-container schemas.

## Contents
---
```toc
```

## 1. Scope and Purpose
---

Mechanician builds and runs the LVNACY Apparatus without being it. It is written for the curator's own vaults and is not marketed, so nothing in it is built for third-party configurability.

| Concern | Behavior |
| --- | --- |
| Mobile | Commands are registered with `addCommand()` in a plugin with `isDesktopOnly: false`, so they run on Desktop and Mobile. |
| Distribution | One plugin install per vault, updated through the plugin lifecycle. |
| Command location | Each module registers its own commands from its own folder. No central command directory exists. |

**Not goals**

- The plugin does not depend on CodeScript Toolkit for commands. It does not remove or forbid CodeScript Toolkit.
- The plugin does not manage anything outside the objects it owns, and it does not take over the curator's explorer sorting. `Story` and `Manuscript` write a `sorting-spec` property into the notes they scaffold, for the Custom File Explorer sorting plugin to consume; no other `sorting-spec` is read or written.
- The plugin does not migrate existing notes. Frontmatter migration is Archivist's, and body reconciliation is manual (Existing Note Migration Worksheet §3 and §5). Migrating existing notes is a planned future update, preferably before `Entity` ships.

**Identity.** The display name is **Mechanician**: a builder and operator of machines, for a plugin that builds and runs the Apparatus without being it. The id is `mechanician`, final: it cannot change once the plugin is accepted into the community hub, and in practice it cannot change once generated notes exist, because the id is the handle those notes use to reach the plugin's API (§6.1).

**Development kit.** The plugin is built from the curator's plugin template:

- esbuild bundles `main.ts` to CommonJS in `dist/` with `obsidian` external.
- `tsc --noEmit` runs before every production build.
- ESLint and Vitest (against `obsidian-test-mocks`) are configured.
- The code meets the conditions for acceptance into the community plugin hub.
- The template's `package.json`, `tsconfig.json`, `eslint.config.js`, `esbuild.config.js`, and `vitest.config.js` are used as-is, apart from the edits stated in §2.1 and §5.2.
- The `package.json` files inside `.codex/` and `.commands/` carry only `type: module`, are unrelated to the template, and are ignored.

## 2. Plugin Shape
---

- One plugin. Core is always on.
- Library, Creative, and Publication are per-vault toggles. A vault may be story-only, stories plus libraries, or all three; one vault currently uses Publication.
- A vault is a container of modules, not a module. A single vault may hold many stories, libraries, and publications.
- Toggle state lives in the plugin's `data.json`, which is per-vault.
- Each module exposes a `register(plugin)` function that calls `addCommand()` for its commands. `src/runtime.ts` calls each enabled module's `register`. `main.ts` is lifecycle only.
- All code is free of Node and Electron APIs.

**Rationale for one plugin.** Library and Creative both extend `BaseClass`. Separate plugins would force either duplicate copies of Core (breaking `instanceof` and shared state) or runtime class lookup across plugins (load-order dependence, no static imports).

**Ship order**

1. The first release ships Core, without `Entity`, and Creative.
2. `Entity` has not been generated and ships in a later release.
3. The Library pass waits until `Entity` has been generated. Library is then reviewed, fixed, and shipped in a later release.
4. Publication tooling has not been started.

`Entity` is added to this spec when it ships. The Library specification is drafted as a supplement that adds on to this one.

**First-release commands:** `core-create-image`, `creative-create-story`, `creative-create-scene`, and `creative-create-scene-templates` (§6.2).

**Settings.** One settings tab with a toggle per shipped module, plus the settings named in §4.7 and §6.2. Core has no toggle. Only Creative appears in the first release. A module's commands are visible only while its toggle is on, enforced in each command's `checkCallback`.

**Bundled documentation.** Every vault and module has an `ARCHIVE/`. The documentation bundle gives a user the nomenclature and taxonomy needed to make informed decisions when naming custom category values.

- The bundle is `Apparatus Docs/`. It holds the Module, Status, and Affiliations taxonomy guides and the vault-level schema note.
- When the plugin is enabled, it copies the bundle into the `ARCHIVE/` at the vault root, creating `ARCHIVE/` if it does not exist.
- The guides are refreshed when the plugin updates.
- Class specifications are not part of the automatic copy. A settings button, which the curator presses, copies the class specifications of the shipped modules (Core and Creative in the first release) into `ARCHIVE/Apparatus Docs/`. On a plugin update, class specifications found in that folder are updated; if none are found, nothing is copied.
- Each class specification is imported from beside its class through the same `.md` loader as the guides (§2.1).

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

- **Folders, not packages.** The plugin is one package with one `package.json` and one esbuild bundle. `api/`, `containers/`, and `core/` are plain folders. They separate concerns inside the bundle and are not workspace packages.
- **Barrels.** `core/controls`, `core/frontmatter`, `core/resolution`, and `modules/creative/objects` carry barrels. A new folder gets a barrel only when other folders import several of its members as a unit and it needs little upkeep.
- **Tests are co-located.** `thing.ts` and `thing.test.ts` sit side by side. `src/test/` holds the shared fakes, factories, and malformed-shape fixtures, and the integration tests directly, with no subfolder of their own.
- **Docs bundle.** The guides and the vault-level schema note are embedded through esbuild's `text` loader for `.md` files (`loader: { '.md': 'text' }`), with a `declare module '*.md'` type declaration and a small Vite plugin in the Vitest config so tests resolve the same imports. These are the only edits to the template's `esbuild.config.js` and `vitest.config.js`.
- **One direction of dependency.** `core` is imported by `containers` and `schema`, which are imported by `modules`, which are imported by `settings`, `api`, and `runtime.ts`. `main.ts` imports only `runtime.ts`. A module never imports another module, so Creative and Library stay independent. `no-restricted-imports` in the ESLint overlay enforces this where the rule can express it.
- **Layout in `core`, schema I/O in `schema`.** `BaseClass` composes its frontmatter from the layout (§4.5), so layout types, slot expansion, and the position rule live in `core`. `schema/` finds, parses, validates, and merges notes. A command loads the schema and passes the resolved schema to the modal and the class, so `core` never imports the loader.
- **Module registry.** `runtime.ts` calls each enabled module's `register(plugin)`. The settings tab renders one toggle per `registry.ts` entry. Only Creative is registered in the first release.
- **Class specifications** stay beside the class they describe.

## 3. Containers
---

- A **container** is a folder whose root holds a note with `class: library`, `class: story`, or `class: publication`.
- All module operations are scoped to their container, except the commands that scaffold the container itself.
- Containers nest without limit and across all module types. The container type stays correct at each level: library commands run only inside a library, story commands only inside a story, and no scene is creatable inside a library's `works` folder. A library nested in a story exposes library commands inside the library, while the story's own folder structure continues to default to story commands.
- One folder never holds two container notes. If one does, the operation is cancelled: an error is thrown and surfaced as an Obsidian `Notice`.
- Scaffolding needs only a folder containing a blank note. It is anchored on an active note (for example the README of a git-submodule folder), so a module stays portable as a self-contained folder.

### 3.1 Command visibility

| Command kind | Visible when | Examples |
| --- | --- | --- |
| Operational | The active file is inside a container of the matching type. | `library-create-article`, `creative-create-scene`, `creative-create-scene-templates` |
| Scaffold | The active note sits in the folder that will become the container, that folder holds no container note of any type, and the nearest enclosing container is not of the same type. | `library-create-library`, `creative-create-story` |
| Container-free | Always. | `core-create-image` |

- Only the nearest enclosing container decides scaffold visibility. Inside a story, `creative-create-story` is hidden and `library-create-library` is still visible. Inside a library nested in a story nested in a library, `creative-create-story` is visible, because the nearest container is a library.
- A folder that already holds a container note shows no scaffold command of any type, so the plugin cannot create a second container note in a folder.
- The check runs again when the command executes, because the folder may have changed since the palette was drawn.

### 3.2 Gate resolver

The gate resolver is a separate function that:

1. Starts at the active file's parent folder and walks toward the vault root, at any depth.
2. At each folder, looks only at that folder's direct children through `metadataCache`.
3. Returns `{ type, note }` for the nearest folder holding a container note of any module class, or `null`.
4. Never throws and never reads file contents.

Operational commands compare the returned `type` to their own. The throwing resolvers remain for use after a command has already passed its gate.

A `checkCallback` can neither throw nor show a `Notice`. So the resolver reports a folder holding two container notes as a conflict result rather than throwing. The command stays visible, and running it throws the one-note error and shows the `Notice`, so the failure is explained instead of silently hiding commands. The scaffold check in §3.1 stops the plugin from creating this state; a second container note added by hand, or a folder merged in from elsewhere, still produces it.

## 4. Module Schemas
---

A container's customizations are data, not code. A context library such as Pulp Fiction or Victorian Mayhem adds frontmatter properties and category vocabulary to the base classes; the plugin reads a schema from the container and the classes and modals adapt. One command set serves every container. This applies to any module's container, not only Library.

Schema-driven values travel in a nested object named `schemaFields` on class options and on modal results, and are rendered flat into frontmatter at write time. The typed core keys stay strictly typed; `schemaFields` is the only open-ended part.

`Works` reads `library-tag`, `works-folder-name`, and `citation-style` off the library note. A schema applies the same container-carried configuration to field and vocabulary customization, and travels with the container folder.

### 4.1 Schema note

- A schema is a note at the root of the container, named `{module-name}-schema.md`, where `{module-name}` is the module instance's own name and not its type. A Pulp Fiction library's schema is `pulp-fiction-schema.md`. It is generated at scaffold time with schema blocks populated with existing fields.
- The plugin loads the first `*-schema.md` at the container root, in path order, and applies what it finds to the matching classes in that container. A note matching the pattern that holds no schema block is ignored.
- Schemas are written in YAML, inside fenced code blocks. The plugin reads only those blocks and ignores the rest of the note, so the note can carry instructions and documentation.
- Scaffolding a container creates its `*-schema.md`, pre-filled with one block per class the module ships, each listing that class' fields. The Core `Entity` classes a module extends are included once `Entity` ships. The curator edits a block to add fields where desired. The note carries instructions for the curator outside the blocks.
- Each block names its class in the fence's info string as `apparatus: <class>`, so one note can customize several classes with one block each. The plugin parses the fence line itself, so its own reading does not depend on how Obsidian renders the block. The form is provisional: if it fails in practice, it changes.
- **First wins.** The first note consumed wins, and within a note the first block for a class wins. Notes are consumed in path order, so "first" is deterministic. Duplicate schema notes and duplicate class blocks are curator error; the note's instructions say not to create them.
- **Base properties are immutable.** A customized class takes all of its base frontmatter and adds its own. A base field deleted from a block's list is ignored and the field is still written.
- **Category.** A schema can add category values to a class that declares a fixed category vocabulary. On a class with none, the added values have nothing to join.
- **Position rule.** The schema lists the field order. Any field, base fields included, can be reordered. An omitted base field keeps its base position and added fields interleave around it. Given base fields a, b, c, d and a block listing a, x, c, the written order is a, b, x, c, d.
- A block whose class does not belong to the container's module cancels the operation with a Notice. The Notice opens with "Shinji, you idiot!" and then explains why the operation was cancelled: the block's class does not belong to the container's module.
- A schema is untrusted runtime data, validated by handwritten type guards that fail loudly on a bad shape. No validation package is added; zod is reconsidered only if handwritten guards become unwieldy.
- Schemas are read asynchronously when a command runs. Command gating never reads them.
- Class validity is checked when a schema loads, so every command in the container cancels until an invalid block is fixed.
- The Obsidian API's `parseYaml` parses the block without a new dependency.

In a block's field list, a bare name is a base field or a slot (§4.4), and a mapping defines an added field as `{ label, control }` plus `options` or `expectedClass` where the control takes them. `control` names a `BaseModal` builder. Category additions sit under a `category` key.

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

### 4.2 Schema note template

The scaffolded `*-schema.md` carries instructions outside its blocks covering:

- Only `apparatus` blocks are read; everything else in the note is ignored.
- One schema note per container and one block per class. Duplicates are ignored in favor of the first, and the curator should not create them.
- A base field cannot be removed. Deleting its line has no effect.
- How to add a field: where to place the line, and the `label` and `control` keys with the list of controls.
- How to add category values.
- A block's class must belong to the container's module, or the operation is cancelled.

### 4.3 Class and modal contract

A class and its modal support schemas through the following behavior.

| Requirement | Behavior |
| --- | --- |
| Schema fields held on the instance | Class options accept `schemaFields`, and the instance holds it. |
| Frontmatter composed from the layout | A class's `getFrontmatterFields()` is composed from `fieldLayout()` (§4.4), which places `schemaFields` according to the schema. |
| Container-aware category vocabulary | `static categoryOptions()` receives the container note, so a per-container vocabulary can apply. `buildCategorySetting(containerEl, ObjectClass)` takes the same input. |
| Modal fields rendered from the schema | A modal renders schema fields through the existing `BaseModal` builders into `schemaFields`. |
| Base field order without construction | Each class exposes its base field order without running its constructor, so a scaffold can write the schema note before any note of that class exists. |

### 4.4 Field layout

Each class exposes its field order as data, without running its constructor or any resolver. The same layout serves template generation and note hydration (Existing Note Migration Worksheet §3, §7).

- `static fieldLayout()` returns an ordered list. A fixed entry is `{ key }`. A dynamic entry is `{ slot }`, a position whose keys are decided at write time.
- The slot list is closed. Two slots exist:
  - `status`, on `Scene` and `Manuscript`, resolves to `serial-status` when `stage` is `serial-draft` and to `editorial-status` otherwise.
  - `manuscript-links`, on `Story`, expands to one key per stage in the story's pipeline.
- A schema block writes a slot as its name in angle brackets, `<status>` or `<manuscript-links>`. The marker cannot collide with a property, because the Apparatus Status Taxonomy retires plain `status`. The position rule in §4.1 applies to a slot as it does to a base field, so a schema cannot remove one.
- The scaffolded schema note is generated from `fieldLayout()`.
- `getFrontmatterFields()` is composed from the layout. The class supplies the layout and a value for each key, and `BaseClass` assembles them in order, so a class's field order is defined once.

**Write-time sequence**

1. The class supplies its layout.
2. The schema loader supplies the block's order, if the container has a block for the class.
3. The two merge by the position rule in §4.1.
4. Slots expand from the instance's own state.
5. Values come from the instance for layout keys and from `schemaFields` for added keys, and `buildFrontmatterBlock` renders the result.

**Adding a slot.** The closed list grows by these steps:

1. Add the slot's name to the `SlotName` union.
2. Register a resolver for it, a function from a class instance to the ordered list of keys the slot expands to. The `status` resolver returns `[scene.statusFieldKey]`; the `manuscript-links` resolver returns the story's `pipeline`.
3. Put `{ slot }` at the right position in the layout of each class that uses it.
4. Add the `<n>` marker to the instructions in the scaffolded schema note.
5. Add a test that the slot expands as intended and that a schema cannot remove it.

### 4.5 When a schema takes effect

A container schema note is created with its container, so it cannot be edited before the container's own scaffold writes its notes. A block therefore affects only notes created afterward.

- **Container classes.** The container note (`story`, `library`, `publication`) is written during the scaffold, so a block for its own class has no effect in the container schema. Scaffolded container schema notes omit container-class blocks. The vault-level schema (§4.6) reaches these notes.
- **Creative.** `story`, `manuscript`, and the story's archive note are all written by the story scaffold, so the container schema can customize only `scene`. The vault-level schema can customize all four. Scaffolded container schema notes omit every class the scaffold itself writes.
- **Scene templates.** Schema fields reach the Longform scene templates. A command generates the templates from the scene's effective layout (§6.2).

### 4.6 Vault-level schema

A vault-level schema adds fields to a module's notes across every container in the vault, including the notes a scaffold writes. It is specified for Creative. The same mechanism can serve Library and Publication.

- **Bundle and location.** The vault-level schema note ships in the `Apparatus Docs/` bundle (§2). When the plugin is enabled, the bundle is copied into `ARCHIVE/` at the vault root. The curator can name the note and place it anywhere, and tells the plugin where it is through a file-suggest setting.
- **What it reaches.** It can provide properties for any class of its module. For the classes a scaffold writes (for Creative, `story`, `manuscript`, and the archive note), it is the only schema that can reach them. For a class created afterward (`scene`), both schemas can define blocks, and the merge rules below apply.
- **Scaffold copies.** The story scaffold copies the vault-level schema's properties into the new container schema note.
- **No overwrite.** The vault-level schema note is copied only when absent and is never overwritten.
- **`vault-schema-update.md`.** The plugin writes this note into `Apparatus Docs/` when a plugin update changes any class's layout. It holds the current layouts in schema-block form, so the curator can compare them with the vault-level schema and apply changes by hand.

**Merge.** The vault-level and container schemas merge whenever a schema loads, so a property added to the vault-level schema after a scaffold still reaches existing containers.

- All properties from both schemas are added, with the vault-level properties interleaved before the container properties.
- A property that is identical in both, across name, object, keys, and values, is added once.
- Where the two define the same property differently, the closest schema wins, which is the container schema, and a Notice calls out the discrepancy.
- A vault-level property absent from the container block is placed immediately after its nearest preceding field in the vault-level list that the container block contains, ahead of container-added fields that follow that field. This is the §4.1 position rule applied to two schemas.
- A difference in position alone is not a conflict. The container schema's position wins.
- Category additions from both schemas are combined.

## 5. Typing and Strictness
---

- The codebase is TypeScript. Classes stay classes; interfaces describe shapes (options, results, frontmatter values, gate and schema structures) and do not replace classes.
- A class and its modal are typed against one shared contract, and the compiler checks the pairing.
- Compiler strictness is a **floor**: the template's configuration is the minimum, and the code is held to more where that is reasonable to manage.
- The strictness configuration (`tsconfig.json` and `eslint.config.js`) is not edited; the overlay extends it. The build configuration takes the docs loader edit (§2.1).

### 5.1 Typing model

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
- A builder writes `this.result[resultKey] = value` for a key it receives as a generic type. TypeScript cannot prove the value matches whichever key was passed, so each builder contains one type assertion at that write. The assertion is safe because the builder's key parameter is limited to keys whose value type matches (`KeysOfType`), which the compiler checks at every call site.
- `this.constructor.classValue` needs a typed constructor reference. TypeScript has no `abstract static`, so the requirement that every leaf declares `classValue` is enforced where classes are registered, through a static-side type (`classValue`, `categoryOptions()`, `resolveFolder()`, constructor signature).
- `BaseClass` and `Works` are `abstract`.
- Obsidian types frontmatter as `any`: `FrontMatterCache` is `{ [key: string]: any }`, and `processFrontMatter` hands its callback an `any`. All frontmatter reads go through one narrowing function at the boundary.
- Catch variables are narrowed with `instanceof Error` before use.

### 5.2 Strictness floor and local overlay

The template enables `noImplicitAny`, `strictNullChecks`, `strictPropertyInitialization`, `strictFunctionTypes`, `noUnusedLocals`, and `noUnusedParameters`, but not `strict: true`. It lints at `warn` for `no-explicit-any` and `no-non-null-assertion`, has no `no-unsafe-*` rules, and has no `no-floating-promises` or `no-misused-promises`.

- The template's ESLint configuration enforces list style through `@stylistic/list-style` on TypeScript files: lists of more than two items break one per line, and interface bodies are always multi-line. No suitable lint rule for alphabetizing exists, so grouping and alphabetizing declarations, as the Code Style Guide requires, is done by hand.
- The display name "Mechanician" goes in the `brands` option of `obsidianmd/ui/sentence-case` in `eslint.config.js`.
- Flexibility outranks maximum strictness: a flag that makes the codebase hard to evolve stays out of the overlay. Optional function parameters are unaffected by the overlay. `exactOptionalPropertyTypes` is left out, because it would prevent assigning `undefined` explicitly to an optional property.

The overlay is local and leaves the template files untouched:

| Overlay | Contents |
| --- | --- |
| `tsconfig.strict.json` extending `tsconfig.json` | `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` |
| ESLint overlay | `no-explicit-any` and `no-non-null-assertion` at `error`; the `no-unsafe-assignment`, `-member-access`, `-argument`, `-return`, and `-call` rules; `no-floating-promises`; `no-misused-promises`; `no-restricted-globals` for `Buffer`, `global`, `__dirname`, `__filename`, and `require` in `src/`; `no-restricted-imports` for the dependency direction in §2.1 |

Consequences of the overlay:

- `noImplicitOverride` requires `override` on every `getBody`, `getFrontmatterFields`, `postCreate`, and `onOpen` override.
- `noUnusedParameters` rejects a base `postCreate(file) {}` with an empty body. No underscore-prefixed identifiers are used anywhere. Privacy is expressed in code with `private`, `protected`, or a non-exported module member, not by naming convention. The empty hook is typed without an unused parameter, or the base implementation uses it.
- `no-misused-promises` requires every `async` call site, including `BaseModal.buildSubmitButton()` calling `onSubmit(this.result)`, to await or otherwise handle the returned promise.
- `noUncheckedIndexedAccess` applies to every indexed access, such as `this.result[resultKey][index]` in `buildNoteListSetting()`.
- `lib` is `ES2020`, so `replaceAll` and `Array.prototype.at` do not typecheck.
- `src/` contains no JavaScript files. The template's ESLint configuration lints the config files, and `tsconfig.json` includes only `**/*.ts`.
- `"types": ["node"]` lets Node globals typecheck. `process.env.*` is compile-time substitution in the template's build (`define` in `esbuild.config.js`). The ESLint overlay restricts Node globals in `src/` so a stray use fails lint.

The overlay is invoked through two scripts beside the template's own. `build` gates on `typecheck` (`tsc`) only, so the strict scripts do not block a release.

`package.json` scripts:

```json
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

- Command ids follow the `<module>-create-<class>` naming convention.
- Each command is a thin entrypoint: gate, open modal, resolve folder, instantiate, `create()`, open the file.
- Visibility logic lives in each command's `checkCallback`, using the gate resolver in §3.2.
- Any module's `register(plugin)` can add commands from the module's own folder; no central command directory exists.

### 6.1 Plugin API

The API is the extension point, and it is built to be robust. It exposes enough of the system that a script can extend a class and instantiate the result. For example, a script extends `Monograph` into a Pulp Fiction monograph class and creates notes with it. The API also serves querying and normal use: generated DataviewJS and the plugin's own commands.

Mechanician does not load, register, or run code from outside itself. Loading code from vault files would need `eval`-style loading, which the template's lint forbids (`no-eval`, `no-implied-eval`). Extension scripts run in CodeScript Toolkit and reach the plugin through the API. The schema mechanism (§4) covers extra frontmatter properties and vocabulary.

**Versioning.** The API is versioned by namespace from the first release: `app.plugins.plugins['mechanician'].api.v1`. Within a version, changes are additive only. A breaking change ships as a new namespace, `api.v2`, while `api.v1` stays served, so nothing written against an older version breaks. Generated notes and extension scripts call `api.v1`. Every function a generated note calls, and every exported class and hook, is a contract with the version that serves it. A note created today stays in the vault, so a change that removes or alters a function a generated note calls is a breaking change and ships as a new version.

**Namespaces.** Each version serves, typed with `obsidian-typings`:

| Namespace | Contents |
| --- | --- |
| `core` | `BaseClass`, `BaseModal`, `Archive`, `Image`, `ImageModal`, the controls, the frontmatter helpers, the resolvers, and `reportError` |
| `containers` | The gate resolver |
| `schema` | Schema loading and merging (§4.1, §4.6) |
| `layout` | The field layout types and ordering (§4.4) |
| `creative` | `Story`, `Scene`, `Manuscript`, `StoryArchive`, their modals, and `getStagePipeline`, the only function any generated note calls. `getStageIndex` and `getPriorStage` stay internal. |
| `library` | Added when Library ships |

**Subclass contract.** The hooks an extending script relies on are part of the contract:

- `static classValue`, `static categoryOptions()`, `static fieldLayout()`, and `static resolveFolder()`.
- A per-key value hook, `fieldValue(key)`, which `BaseClass` calls for each key in the layout (§4.4). A subclass overrides `fieldLayout()` to add keys and `fieldValue(key)` to supply their values, calling `super` for the rest.
- `getBody()` and the section hooks beneath it, and `postCreate()`.
- A subclass keeps its parent's `classValue`, so schema blocks and Dataview queries that key off `class` continue to apply. A monograph is a monograph in any library, and the library tag provides the differentiation.
- A script that instantiates a class loads the schema first, through `api.v1.schema`, and passes the resolved schema in the options, as the plugin's own commands do.

Generated `Story` and `StoryArchive` bodies call `api.v1.creative.getStagePipeline`. This covers three `Story` dashboard blocks and `StoryArchive`'s `sceneIntegrityScript` and `snapshotExistenceScript`. The stage list stays in the plugin, so a pipeline change reaches every note.

### 6.2 Scene template command

Schema fields reach the Longform scene templates. The story scaffold does not create templates. A command generates them after the curator has filled out the schema, for use with Templater or the core Templates plugin. A curator can skip templates entirely and use `creative-create-scene`.

- The command is `creative-create-scene-templates`, an operational command visible inside a story container.
- The placeholder for the created date follows a template-engine setting: Templater (`<% tp.date.now() %>`, the default) or the core Templates plugin (`{{date:YYYY-MM-DD}}`).
- The command performs the `titleAbbv` check.
- Output location and naming are as `Story.buildSceneTemplates()` produces them: the story folder's root, as `<titleAbbv>-<suffix>.md`.
- Each template holds frontmatter from the scene's effective layout with blank values, `tags` holding the story tag, and the created-date placeholder, followed by the scene body.
- When a template is generated, the command writes its path into the Longform `sceneTemplate` of the matching stage's manuscript. Until a template is generated, `sceneTemplate` stays blank.
- Collisions throw. To regenerate a template, the curator deletes the existing one.

## 7. Error Reporting
---

Class, modal, control, and helper code throws. The command's handler is the error boundary: it reports a failure exactly once and does not rethrow. There is no `Log` object and no log levels.

| Member | Kind | Purpose | Rationale |
| --- | --- | --- | --- |
| `reportError(context, error)` | function | In `core/`, called by each command's error boundary. Calls `console.error('Mechanician: <context>', error)` and shows one `Notice` prefixed `Mechanician:`. | The prefix and the exactly-once rule live in one place. |

- Errors thrown by class, modal, control, and helper code carry messages written for the user, because the Notice shows them.
- Non-fatal conditions (a schema conflict, §4.6) show a Notice, with `console.warn` when the detail helps.
- Success needs no Notice. A command opens the note it created.
- No catch is silent. A catch reports through the boundary, or logs with `console.error` and degrades to a safe default.
- `BaseClass.create()`, `validateExpectedClass`, and `appendToFrontmatterArray` only throw. None of them logs.
- A modal's submit callback is awaited inside the click handler, so the command's `catch` receives its failures.

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
| CodeScript Toolkit | Extension scripts (§6.1). Notes generated before the plugin call `requireAsync`. | Extension scripts do not run. Those older blocks fail. New notes use the plugin API. |

## 9. Open Items
---

- The full wording of the instruction text in the scaffolded schema note (§4.2).

## Appendix: Specification Change Log
---

| Date | Change |
| --- | --- |
| 2026-11-23 | Initial spec |