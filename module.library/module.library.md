---
class: archive
category:
affiliations:
created: 2026-08-21
modified: 2026-09-26
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - "[[Apparatus Library Property Taxonomy]]"
  - "[[citation]]"
  - "[[Library.js Specification]]"
  - "[[Periodical.js Specification]]"
  - "[[Collection.js Specification]]"
  - "[[Author.js Specification]]"
  - "[[Works.js Specification]]"
  - "[[Accession Specification]]"
  - "[[Library Accession Trigger Map]]"
tags:
---

## Contents
---
```toc
```

## 1. Classes
---

All classes currently supported in the Apparatus Library module. For field definitions and controlled values, see [[Apparatus Library Property Taxonomy]] and [[Apparatus Status Taxonomy]].

Class instantiation objects are stored in `.obsidian/apparatus/library/lib/objects`. Accompanying modals are stored in `.obsidian/apparatus/library/lib/modals`.

The classes are grouped by role:

### Library Overview

| Class | Specification | Purpose | Modal |
| ----- | ------------- | ------- | ----- |
| Library.js | [[Library.js Specification]] | Defines a library's scope, configuration, and dashboard context for Periodicals, Collections, and Works. Extends `BaseClass.js`. | `LibraryModal.js` |

### Aggregate Classes

| Class | Specification | Purpose | Modal |
| ----- | ------------- | ------- | ----- |
| Aggregate.js  | [[Aggregate.js Specification]] | Shared base class for aggregate objects, currently `Periodical` and `Collection`. Extends `BaseClass.js`. | `AggregateModal.js`  |
| Periodical.js | [[Periodical.js Specification]] | Represents a periodical's publication run and exposes its Collections through the generated Issues `.base` view. Receives authors and Collections through Accession. Extends `Aggregate.js`. | `PeriodicalModal.js` |
| Collection.js | [[Collection.js Specification]] | Represents a periodical issue or standalone volume. Generates its own note and citation, and participates in Accession to populate related aggregates and Author records. Extends `Aggregate.js`. | `CollectionModal.js` |

### Works

| Class        | Specification | Purpose | Modal |
| ------------ | ------------- | ------- | ----- |
| Works.js     | [[Works.js Specification]] | Shared base class for individual work items. Provides common fields, link normalization, citation delegation, folder resolution, and post-creation Accession behavior. Extends `BaseClass.js`. | `WorksModal.js` |
| Article.js   | scoped to [[Works.js Specification]] | Instantiates new Article objects. Extends `Works.js`.  | `ArticleModal.js` |
| Chapter.js   | scoped to [[Works.js Specification]] | Instantiates new Chapter objects. Extends `Works.js`. | `ChapterModal.js`  |
| Entry.js     | scoped to [[Works.js Specification]] | Instantiates new Entry objects. Extends `Works.js`. | `EntryModal.js` |
| Essay.js     | scoped to [[Works.js Specification]] | Instantiates new Essay objects. Extends `Works.js`. | `EssayModal.js` |
| Interview.js | scoped to [[Works.js Specification]] | Instantiates new Interview objects. Extends `Works.js`. | `InterviewModal.js` |
| Lecture.js   | scoped to [[Works.js Specification]] | Instantiates new Lecture objects. Extends `Works.js`. | `LectureModal.js`   |
| Monograph.js | scoped to [[Works.js Specification]] | Instantiates new Monograph objects. Extends `Works.js`. | `MonographModal.js` |
| Record.js    | scoped to [[Works.js Specification]] | Instantiates new Record objects. Extends `Works.js`. | `RecordModal.js`    |
| Report.js    | scoped to [[Works.js Specification]] | Instantiates new Report objects. Extends `Works.js`. | `ReportModal.js`    |
| Review.js    | scoped to [[Works.js Specification]] | Instantiates new Review objects. Extends `Works.js`. | `ReviewModal.js`    |
| Thesis.js    | scoped to [[Works.js Specification]] | Instantiates new Thesis objects. Extends `Works.js`. | `ThesisModal.js`    |

### Authors, Editors, Translators

| Class | Specification | Purpose | Modal |
| ----- | ------------- | ------- | ----- |
| Author.js | [[Author.js Specification]] | Creates an Author object to capture data on contributing authors, editors, and translators. Author objects are used in citation generation and receive `works`/`collections` membership through Accession. Extends `BaseClass.js`. | `AuthorModal.js` |

## 2. Class Hierarchy
---

> This section is the authoritative statement of class inheritance for the Library module. It is restated in prose in [[Author.js Specification]] §1, [[Periodical.js Specification]] §1, [[Collection.js Specification]] §1, and [[Works.js Specification]] §1. Update all four when a class's parent or hierarchy position changes.

Inheritance flows from base to specific and runs along three paths:

For the library root:
`BaseClass` → `Library`

For Work objects:
`BaseClass` → `Works` → leaves: `Article`, `Chapter`, `Entry`, `Essay`, `Interview`, `Lecture`, `Monograph`, `Record`, `Report`, `Review`, `Thesis`

For aggregate objects:
`BaseClass` → `Aggregate` → `Periodical`/`Collection` 

## 3. Data Flow
---

For note creation, data moves through the code modules in the following manner:
1. A modal gathers user input and passes it to the appropriate object class.
2. The object constructor assigns fields; the object's frontmatter and body methods provide the note content.
3. During construction, Work leaves and Collections compute citations where applicable. The citation engine resolves the governing Library style and linked authors, titles, and collection fields before invoking the registered formatter.
4. After the note is created, `postCreate()` resolves related notes and performs Accession pushes to related notes. Work creation pushes the Work's own wikilink into `works` on every resolved Author (across `authors`/`editors`/`translators`/`interviewer`/`interviewee`) and on every linked Collection, pushes each linked Collection's wikilink into `collections` on those same resolved Authors, pushes `authors` into each linked Collection and — when that Collection has a `periodical` set — onward into that Periodical; Collection creation pushes the Collection itself into its Periodical's `collections` field. See [[Accession Specification]] for the complete trigger map.

> This step summarizes the Accession trigger map in prose. The authoritative trigger map is [[Accession Specification]] §3; it is also reproduced as a table in [[Works.js Specification]] §5. If the trigger map changes, update all three: this paragraph, [[Accession Specification]] §3, and [[Works.js Specification]] §5.

### Lifecycle and Failure Notes

- The modal is responsible for collecting and shaping input; the object constructor is responsible for turning that input into the note's frontmatter and body. The modal does not perform the citation formatting itself.
- Work leaves and Collections may resolve links and compute citations during object construction, before `postCreate()` runs. Periodicals do not use the citation engine.
- `postCreate()` is an asynchronous follow-up to note creation. It updates related Author, Collection, and Periodical frontmatter rather than rebuilding the source note.
- Required link resolution is strict: an unresolved required note logs an error and throws. This applies to Library discovery, Author and title resolution, Collection-field resolution, and Accession targets.
- Optional or cross-reference fields can use lenient resolution. Depending on the helper, an unresolved link is preserved as raw text or represented as `null`; it is not treated as a successful resolved note.
- Accession pushes are duplicate-safe, but they are not silent best-effort operations. A failed frontmatter update is logged and re-thrown, so callers can detect that related-note state may be incomplete even when the source note was created.
- Citation failures also prevent a valid citation result: missing Library configuration, an unknown style, an unregistered class, or an unresolved required citation link is logged and thrown.
- A Periodical has no citation-generation step and receives its `authors` and `collections` values through Accession rather than direct entry in its own modal.

## 4. External Dependencies and Runtime Assumptions
---

The Library module is an Obsidian-facing JavaScript module. It is not designed to run as a standalone Node.js or browser application because object construction, note resolution, frontmatter updates, and modal rendering depend on the Obsidian application context.

### CodeScript Toolkit

The Library module depends on the **CodeScript Toolkit** Obsidian plugin. CodeScript Toolkit provides the execution and integration environment in which these scripts run, making the Library classes, modals, controls, and citation engine available to the Obsidian vault. Without the plugin, the JavaScript files in `.obsidian/apparatus/library/` are source modules only and are not an operating Library system.

### Shared Internal Dependencies

Library scripts import shared infrastructure from outside `.obsidian/apparatus/library/`:

| Dependency | Used for |
| ---------- | -------- |
| `BaseClass.js` | Common object state and base frontmatter behavior inherited by `Library`, `Aggregate`, `Work`, and `Author`. |
| `BaseModal.js` | Common modal lifecycle and editor behavior inherited by the Library modal classes. |
| `logger.js` | `Log.error()` reporting before resolver and citation failures are thrown. |
| `links.js` | Wikilink target normalization used by `resolve-note-file.js`. |

These modules are part of the surrounding `.obsidian/apparatus` infrastructure and must remain available at the import paths used by the Library module.

### Obsidian API Requirements

The module expects an Obsidian `App` instance and uses the following services:

| API | Runtime role |
| --- | ------------ |
| `app.vault` | Finds Markdown files and updates frontmatter arrays during Accession operations. |
| `app.metadataCache` | Reads parsed frontmatter, resolves wikilinks to `TFile` objects, and locates Library, Author, Collection, and Periodical metadata. |
| `app.workspace` | Identifies the active file and its parent folder when resolving Library, Works, and Collections destinations. |
| `TFile` and file metadata | Supplies note paths, parent folders, and basenames for resolution and citation input. |
| Obsidian modal and `Setting` APIs | Renders creation forms and collects user input in the modal classes. |

### Repository and Rendering Assumptions

- A Library note is identified by frontmatter `class: library` and is located in the nearest qualifying ancestor folder. Exactly one such note must exist at that level.
- Work notes are created in the Library's configured `works-folder-name`, falling back to `works` when the field is blank or missing.
- Aggregate notes are created in the Library's `collections` folder.
- Citation generation requires the enclosing Library note to provide a valid `citation-style` value registered in `citation-engine.js`.
- Strict note resolvers throw after logging when a required link cannot be resolved; lenient resolvers preserve unresolved links or return `null` according to their API contract.
- Generated Library and Periodical bodies expect Obsidian to render `toc`, Dataview, and `.base` embeds. The corresponding plugins, features, or view files must be available for those sections to display correctly.
- Frontmatter field names are part of the module contract. Changes to names such as `citation-style`, `works-folder-name`, `periodical`, `collections`, or `authors` must be reflected in the relevant objects, controls, modals, and taxonomy documents.

## 5. Library Tooling
---

This section will grow as more tooling is added to this module's construction.

### Library Vocabulary

A single code module storing all contained category and status vocabularies relevant to the Apparatus Library module. Stored in `.obsidian/apparatus/library/lib/controls`.

| File | Description  | Used By |
| ---- | ------------ | ------- |
| `library-vocab.js` | Controlled vocabularies for Library, Aggregate, Work, and leaf fields in the Apparatus Library module. Mirrors [[Apparatus Module Taxonomy]]. Modals import from here rather than defining their own copies, and this file is updated whenever the taxonomy document changes. | `AggregateModal.js`<br>`CollectionModal.js`<br>`LibraryModal.js`<br>`PeriodicalModal.js`<br>`RecordModal.js`<br>`ThesisModal.js`<br>`WorksModal.js` |


### Object Resolution

> This table restates resolver semantics. The authoritative source is [[citation]] §2. It is also restated in [[Author.js Specification]] §6, [[Collection.js Specification]] §7, [[Periodical.js Specification]] §7, and [[Works.js Specification]] §6. Update all of these, including this table, when resolver behavior changes.

Object resolution modules are stored in `.obsidian/apparatus/library/lib/controls`.

| File | Description | Used By |
| ---- | ----------- | ------- |
| `resolve-authors.js` | Resolves author/editor/translator/interviewer/interviewee wikilinks against Author notes and reads `prefix`, `first-name`, `last-name`, and `suffix` from frontmatter.<br><br>Exports `resolveAuthor(app, sourcePath, rawWikilink)`, which returns one `{ prefix, first, last, suffix }` object, and `resolveAuthors(app, sourcePath, rawWikilinks)`, which returns an array of those objects. Required unresolved links throw through `resolveNoteFile()`. | `citation-engine.js` |
| `resolve-collection-fields.js` | Resolves the first Collection wikilink on an Article to the `periodical`, `volume`, and `issue` fields the Article formatter needs at citation time. It returns the linked Periodical's note title rather than the Collection's own title. Exports `resolveCollectionFields(app, sourcePath, rawWikilink)`, which returns `{ periodical, volume, issue }`. Required unresolved links throw through the strict resolvers. | `citation-engine.js` |
| `resolve-library.js` | Resolves the enclosing library for a given starting folder: walks upward from `startFolderPath` to the nearest ancestor folder whose direct contents include a note with frontmatter `class: library`, returning that folder's path. Throws if none is found before the vault root, or if a folder contains more than one such note.<br><br>Exports `resolveLibraryFolder()` and `resolveLibraryNote()`. | `Aggregate.js`<br>`Author.js`<br>`AuthorModal.js`<br>`ChapterModal.js`<br>`citation-engine.js`<br>`CollectionModal.js`<br>`InterviewModal.js`<br>`LectureModal.js`<br>`PeriodicalModal.js`<br>`ReportModal.js`<br>`ReviewModal.js`<br>`ThesisModal.js`<br>`Work.js`<br>`WorksModal.js` |
| `resolve-note-file.js` | Resolves a wikilink to the TFile it points at. The shared core used by every `resolve-*.js` module in this directory, and by any caller (e.g. a postCreate Accession push) that needs the note itself rather than a specific field pulled off of it.<br><br>Exports `resolveNoteFile(app, sourcePath, rawWikilink)`, which returns a `TFile` and logs then throws when resolution fails; and `resolveNoteFileLenient(app, sourcePath, rawWikilink)`, which returns a `TFile` or `null` without throwing. | `Collection.js`<br>`resolve-authors.js`<br>`resolve-collection-fields.js`<br>`resolve-titles.js`<br>`Work.js` |
| `resolve-titles.js` | Resolves a wikilink pointing at another note to that note's title, or to a normalized wikilink pointing at it. Class-agnostic—used for Work-to-Work references (parent-work, subject-work, etc.), Periodical references, and any other note-to-note link, since resolution itself never depends on what class the linked note is. Built on the shared file lookup in `resolve-note-file.js`.<br><br>Exports `toWikilink(basename)`, `resolveNoteTitle(app, sourcePath, rawWikilink)`, and `resolveNoteTitles(app, sourcePath, rawWikilinks)` for strict title/link conversion; the strict resolvers return strings and throw when a required link cannot resolve. It also exports `resolveOptionalNoteTitle()`, `resolveNoteLinkLenient()`, and `resolveNoteLinksLenient()`, which preserve bare or unresolved values according to their API contracts. | `Collection.js`<br>`citation-engine.js`<br>`resolve-collection-fields.js`<br>`Work.js` |

### Accession

Accession is described in detail in [[Accession Specification]]. Makes use of the `append-to-frontmatter-array.js` code module. This mechanism automates the population of relational array fields on Author, Collection, and Periodical notes at the creation time of a referencing Work or Collection — see the linked specification for the full six-row trigger map.

| File | Description | Used By |
| ---- | ----------- | ------- |
| `append-to-frontmatter-array.js` | Appends a value to a frontmatter array field on a note, skipping it if already present (string-diff against the field's current contents). Throws and logs on failure—callers must not treat a failed append as safe to ignore. | `Collection.js`<br>`Work.js` |


### Citation Engine

> The file/path layout for the citation engine's modules is authoritative in [[citation]] §1 and restated in the file table below. Update both when a file's path changes or a file is added/removed.

The citation engine generates citations for Works and Collections and leans heavily on [[#Object Resolution]]. Its resolution layer uses the Obsidian API; its style formatter modules receive resolved structured data and remain pure functions.

#### Public API

| Export | Responsibility | Inputs | Returns / behavior |
| ------ | -------------- | ------ | ------------------ |
| `FORMATTERS` | Registry of citation styles and citable class formatters. | None | Object keyed by `mla`, `apa`, and `chicago-author-date`. Consumed by `library-vocab.js` to derive citation-style options. |
| `computeCitation()` | Resolves the governing Library citation style, then delegates to `generateCitation()`. | `app`, note `path`, note `folder`, class value, and citation fields. | Formatted citation string; can log and throw if the Library, citation style, linked notes, or formatter cannot be resolved. |
| `generateCitation()` | Resolves linked authors, titles, and Article collection fields, then invokes the registered formatter. | `app`, source path, leaf class, style, and structured bibliographic fields. | Formatted citation string; can log and throw for an unknown style, unregistered class, or required link that cannot be resolved. |
| `resolveCitationStyle()` | Finds the enclosing Library note and reads its `citation-style` field. | `app` and note folder. | Citation style key; logs and throws when no Library can be resolved or the Library has no citation style. |

#### Registered Style/Class Matrix

Every registered style supports the same 12 citable classes. `formatMonograph` is an alias of `formatEssay` in each style module; Collection has a registered formatter, while Periodical, Author, Aggregate, and Work do not.

| Class        | MLA 9th ed.            | APA 7th ed.            | Chicago 17th ed. author-date |
| ------------ | ---------------------- | ---------------------- | ---------------------------- |
| `article`    | `mla.formatArticle`    | `apa.formatArticle`    | `chicago.formatArticle`      |
| `chapter`    | `mla.formatChapter`    | `apa.formatChapter`    | `chicago.formatChapter`      |
| `collection` | `mla.formatCollection` | `apa.formatCollection` | `chicago.formatCollection`   |
| `entry`      | `mla.formatEntry`      | `apa.formatEntry`      | `chicago.formatEntry`        |
| `essay`      | `mla.formatEssay`      | `apa.formatEssay`      | `chicago.formatEssay`        |
| `interview`  | `mla.formatInterview`  | `apa.formatInterview`  | `chicago.formatInterview`    |
| `lecture`    | `mla.formatLecture`    | `apa.formatLecture`    | `chicago.formatLecture`      |
| `monograph`  | `mla.formatMonograph` (Essay alias) | `apa.formatMonograph` (Essay alias) | `chicago.formatMonograph` (Essay alias) |
| `record`     | `mla.formatRecord`     | `apa.formatRecord`     | `chicago.formatRecord`       |
| `report`     | `mla.formatReport`     | `apa.formatReport`     | `chicago.formatReport`       |
| `review`     | `mla.formatReview`     | `apa.formatReview`     | `chicago.formatReview`       |
| `thesis`     | `mla.formatThesis`     | `apa.formatThesis`     | `chicago.formatThesis`       |

| File                 | Description     | Used By     |
| -------------------- | --------------- | ----------- |
| `citation-engine.js` | The engine's entry point. Two jobs, kept in separate files:<br><br>1. "Grab" — resolve author/editor/translator/interviewer/interviewee wikilinks against their own Author notes (`resolve-authors.js`), collections/Work-reference/Periodical wikilinks against the linked note's own title (`resolve-titles.js`), and—for Article—the periodical/volume/issue fields carried on its linked Collection note (`resolve-collection-fields.js`). These are the only files in the citation module that touch the Obsidian API.<br><br>2. "Parse" (format) — hand resolved, structured data to the right per-style, per-leaf formatter (`mla.js`/`apa.js`/`chicago.js`). Those stay pure functions with no Obsidian dependency. Called from the Work/Collection modal at note-creation time.<br><br>Adding a leaf class means adding one function per style module, then registering it in FORMATTERS—no changes to this dispatcher itself. | `Collection.js`<br>`library-vocab.js`<br>`Work.js` |
| `name-format.js`     | Pure formatting helpers—no Obsidian API, no note resolution. Everything here operates on already-resolved data: { prefix, first, last, suffix } Author objects and resolved Collection titles. | `apa.js`<br>`chicago.js`<br>`mla.js` |
| `apa.js`             | APA (7th ed.) formatters, one formatter per registered citable class. Includes Collection, with Monograph as an Essay formatter alias. Pure functions. | `citation-engine.js` |
| `chicago.js`         | Chicago (17th ed.) author-date formatters, one formatter per registered citable class. Includes Collection, with Monograph as an Essay formatter alias. Notes-bibliography is not yet implemented. Pure functions. | `citation-engine.js` |
| `mla.js`             | MLA (9th ed.) formatters, one formatter per registered citable class. Includes Collection, with Monograph as an Essay formatter alias. Pure functions. | `citation-engine.js` |

### Dependency Documentations Sync

This document surfaces the structure in `.obsidian/apparatus/library/` and provides an itemized inventory of code modules and their respective imports and exports, found in the [[#Appendix File Inventory|File Inventory appendix]]. The `Sync Library Dependency Documentation` command, powered by `library-sync-dependency-docs.js`, can be run to keep the inventory and tables current. The command generates a table under [[#Appendix Generated Dependency Map|Appendix: Generated Dependency]], which can be used as a reference to update the rest of the document.

For details on the command, see the [[Documentation Sync Command Specification]].

## 6. References
---

[[Apparatus Module Taxonomy]]
Core class and category taxonomy doc for Apparatus modules.

[[Apparatus Status Taxonomy]]
Vocabulary spec for domain-scoped statuses across the Apparatus system.

[[Apparatus Library Property Taxonomy]]
Defines property fields for all classes in the Apparatus Library module.

[[Accession Specification]]
Defines the full cross-object relational field population mechanism spanning Works, Collection, Periodical, and Author.

[[Documentation Sync Command Specification]]
Defines the mechanics underlying the `Library Sync Dependency Docs` command.

## 7. TODO
---

- [x] Generate missing specifications {{operonId:: 0ul7kch}} {{status:: Project.Finished}} {{priority:: C}} {{dateCompleted:: 2026-08-28}} {{progress:: 100}} {{directSubtaskCount:: 3}} {{directDoneSubtaskCount:: 3}} {{directOpenSubtaskCount:: 0}} {{treeDescendantCount:: 3}} {{treeDoneDescendantCount:: 3}} {{treeOpenDescendantCount:: 0}} {{datetimeCreated:: 2026-08-21T11:58:24}} {{datetimeModified:: 2026-09-09T22:14:47}}
	- [x] `Author.js` Specification {{operonId:: 2cmre7j}} {{status:: Project.Finished}} {{priority:: C}} {{dateCompleted:: 2026-08-22}} {{parentTask:: 0ul7kch}} {{datetimeCreated:: 2026-08-21T12:06:39}} {{datetimeModified:: 2026-08-22T16:44:43}}
	- [x] `Aggregate.js` Specification {{operonId:: cdie5gl}} {{status:: Project.Finished}} {{priority:: B}} {{dateCompleted:: 2026-08-28}} {{parentTask:: 0ul7kch}} {{datetimeCreated:: 2026-08-21T12:03:25}} {{datetimeModified:: 2026-08-28T14:16:26}}
	- [x] `Works.js` Specification {{operonId:: egeaywf}} {{status:: Project.Finished}} {{priority:: A}} {{dateCompleted:: 2026-08-25}} {{parentTask:: 0ul7kch}} {{datetimeCreated:: 2026-08-21T12:00:05}} {{datetimeModified:: 2026-08-25}}

## Appendix: File Inventory
---

Complete inventory of the JavaScript files currently contained in `.obsidian/apparatus/library/`. Export names and inheritance are recorded as implemented; `BaseClass` and `BaseModal` are shared modules outside this directory.

### `objects/`

| File            | Export       | Extends     | Specification                        |
| --------------- | ------------ | ----------- | ------------------------------------ |
| `Aggregate.js`  | `Aggregate`  | `BaseClass` | [[Aggregate.js Specification]]       |
| `Article.js`    | `Article`    | `Works`     | scoped to [[Works.js Specification]] |
| `Author.js`     | `Author`     | `BaseClass` | [[Author.js Specification]]          |
| `Chapter.js`    | `Chapter`    | `Works`     | scoped to [[Works.js Specification]] |
| `Collection.js` | `Collection` | `Aggregate` | [[Collection.js Specification]]      |
| `Entry.js`      | `Entry`      | `Works`     | scoped to [[Works.js Specification]] |
| `Essay.js`      | `Essay`      | `Works`     | scoped to [[Works.js Specification]] |
| `Interview.js`  | `Interview`  | `Works`     | scoped to [[Works.js Specification]] |
| `Lecture.js`    | `Lecture`    | `Works`     | scoped to [[Works.js Specification]] |
| `Library.js`    | `Library`    | `BaseClass` | [[Library.js Specification]]         |
| `Monograph.js`  | `Monograph`  | `Works`     | scoped to [[Works.js Specification]] |
| `Periodical.js` | `Periodical` | `Aggregate` | [[Periodical.js Specification]]      |
| `Record.js`     | `Record`     | `Works`     | scoped to [[Works.js Specification]] |
| `Report.js`     | `Report`     | `Works`     | scoped to [[Works.js Specification]] |
| `Review.js`     | `Review`     | `Works`     | scoped to [[Works.js Specification]] |
| `Thesis.js`     | `Thesis`     | `Works`     | scoped to [[Works.js Specification]] |
| `Works.js`      | `Works`      | `BaseClass` | [[Works.js Specification]]           |

### `modals/`

| File | Export | Extends |
| ---- | ------ | ------- |
| `AggregateModal.js` | `AggregateModal` | `BaseModal` |
| `ArticleModal.js` | `ArticleModal` | `WorksModal` |
| `AuthorModal.js` | `AuthorModal` | `BaseModal` |
| `ChapterModal.js` | `ChapterModal` | `WorksModal` |
| `CollectionModal.js` | `CollectionModal` | `AggregateModal` |
| `EntryModal.js` | `EntryModal` | `WorksModal` |
| `EssayModal.js` | `EssayModal` | `WorksModal` |
| `InterviewModal.js` | `InterviewModal` | `WorksModal` |
| `LectureModal.js` | `LectureModal` | `WorksModal` |
| `LibraryModal.js` | `LibraryModal` | `BaseModal` |
| `MonographModal.js` | `MonographModal` | `WorksModal` |
| `PeriodicalModal.js` | `PeriodicalModal` | `BaseModal` |
| `RecordModal.js` | `RecordModal` | `WorksModal` |
| `ReportModal.js` | `ReportModal` | `WorksModal` |
| `ReviewModal.js` | `ReviewModal` | `WorksModal` |
| `ThesisModal.js` | `ThesisModal` | `WorksModal` |
| `WorksModal.js` | `WorksModal` | `BaseModal` |

### `controls/`

| File | Exports |
| ---- | ------- |
| `append-to-frontmatter-array.js` | `appendToFrontmatterArray` |
| `library-vocab.js` | `CITATION_STYLE_OPTIONS`, `CATALOG_STATUS_OPTIONS`, `CIRCULATION_OPTIONS`, `CONTENT_WARNING_GROUPS`, `CONTENT_WARNINGS`, `FREQUENCY_OPTIONS`, `LIBRARY_STATUS_OPTIONS`, `RECORD_FORMAT_OPTIONS`, `THESIS_DEGREE_OPTIONS`, `WORK_LENGTH` |
| `resolve-authors.js` | `resolveAuthor`, `resolveAuthors` |
| `resolve-collection-fields.js` | `resolveCollectionFields` |
| `resolve-library.js` | `resolveLibraryFolder`, `resolveLibraryNote` |
| `resolve-note-file.js` | `resolveNoteFile`, `resolveNoteFileLenient` |
| `resolve-titles.js` | `toWikilink`, `resolveNoteTitle`, `resolveNoteTitles`, `resolveOptionalNoteTitle`, `resolveNoteLinkLenient`, `resolveNoteLinksLenient` |

### `citation/`

| File | Exports |
| ---- | ------- |
| `apa.js` | `joinAuthorsAPA`, `formatArticle`, `formatChapter`, `formatCollection`, `formatEntry`, `formatEssay`, `formatInterview`, `formatLecture`, `formatMonograph`, `formatRecord`, `formatReport`, `formatReview`, `formatThesis` |
| `chicago.js` | `joinAuthorsChicagoAuthorDate`, `formatArticle`, `formatChapter`, `formatCollection`, `formatEntry`, `formatEssay`, `formatInterview`, `formatLecture`, `formatMonograph`, `formatRecord`, `formatReport`, `formatReview`, `formatThesis` |
| `citation-engine.js` | `FORMATTERS`, `computeCitation`, `generateCitation`, `resolveCitationStyle` |
| `mla.js` | `joinAuthorsMLA`, `formatArticle`, `formatChapter`, `formatCollection`, `formatEntry`, `formatEssay`, `formatInterview`, `formatLecture`, `formatMonograph`, `formatRecord`, `formatReport`, `formatReview`, `formatThesis` |
| `name-format.js` | `formatNameAPA`, `formatNameInverted`, `formatNameNormal`, `formatPageRange`, `initials`, `joinNamesNormal` |

## Appendix: Generated Dependency Map
---

<!-- BEGIN GENERATED LIBRARY DEPENDENCY TABLE -->
<!-- END GENERATED LIBRARY DEPENDENCY TABLE -->

## Appendix: Future Considerations
---

- [ ] If the Object Resolution table becomes difficult to maintain, split it into smaller API and dependency tables. An API table could document each module's exports, inputs, outputs, and failure behavior, while a dependency table could document the modules and callers that use each resolver. {{operonId:: z3owsei}} {{status:: Project.Brainstorming}} {{priority:: F}} {{datetimeCreated:: 2026-08-22T16:45:27}} {{datetimeModified:: 2026-08-22T16:45:46}}

## Appendix: Change Log
---

| Date       | Change        |
| ---------- | ------------- |
| 2026-08-25 | Aligned the document with the completed [[Works.js Specification]]: renamed every `Work.js`/`Work` reference to `Works.js`/`Works` (§1 Works table, §2 Class Hierarchy, Appendix File Inventory `lib/objects/` table, §6 References' Accession blurb); linked the Works row in §1 and every leaf's "scoped to" cell to [[Works.js Specification]] in place of the placeholder "required"/"scoped to Work.js spec" text; added [[Works.js Specification]] to frontmatter `context` and `sorting-spec`; marked the `Works.js` Specification TODO complete and updated its parent task's subtask/progress counters. |
| 2026-08-25 | Added inline cross-reference notes marking duplicated content and where it must also be updated: §2 Class Hierarchy (restated in Author.js/Periodical.js/Collection.js/Works.js §1), §3 Data Flow's Accession trigger-map paragraph (restated in Accession Specification §3 and Works.js §5), §5 Object Resolution (restated in Citation Engine Specification §2 and Author.js/Collection.js/Periodical.js/Works.js §6-or-§7), §5 Citation Engine file table (restated in Citation Engine Specification §1). No content changed, only cross-reference notes added. |
| 2026-08-22 | Renamed the "Cascade Mechanism" tooling subsection (§5) to "Accession" and repointed it at [[Accession Specification]] in place of [[Periodical.js Specification]]. Updated every other "cascade"/"Cascade Mechanism" reference in the doc (§1 class-purpose descriptions, §3 Data Flow, §3 Lifecycle and Failure Notes, §6 References) to use "Accession" terminology and reflect the full six-row trigger map (Author `works`/`collections`, Collection `works`) rather than only the original authors-to-Collection/Periodical push. Added [[Author.js Specification]] and [[Accession Specification]] to frontmatter `context` and `sorting-spec`, and a corresponding entry to §6 References. |
| 2026-08-21 | Initial Spec. |