# Apparatus Retrofit Work Checklist

Status as of 2026-11-08. Built from the `.codex/` module map (`.codex.md`) and the `.commands/` module map (`.commands.md`).

A box is checked only when the work is done and was verified. An unchecked box means not done or not verified. A module line is checked when every item beneath it is.

**What each item means**

- **Spec:** the class has a specification in the current template, either written new or retrofitted. A spec file in the module map does not by itself mean it is retrofitted. Modal, helper, and utility members get rows in the spec of the class that needs them, so they have no spec item of their own.
- **Code (comments stripped, JSDoc added):** every plain comment removed; JSDoc on every member; no behavior change.
- **Logging (throws, does not log):** class, modal, control, and helper code throws on failure and never calls `Log.error`, `Log.fatal`, or `Log.warn` for it. `Log.log` for success tracing is allowed. Modules with no `Log` calls pass.
- **Logging contract (submit handler and `callback()` each catch, log once, no rethrow):** see Logging flow in `.codex.md`.
- **Documents** (`.md` files other than class specs): one box each. Checked when the document was reviewed and is current with the code and conventions. Class specs are tracked under their class.
- Configuration files (`package.json`, `.gitignore`, `apparatus-codex.code-workspace`) and barrel `index.js` files are not tracked.

**Intentional absences, not gaps**

- `Glossary` has no modal. It draws its inputs from the library.
- `Archive`, `Manuscript`, and `StoryArchive` have neither a modal nor a command.
- `Aggregate` and `Works` have modals and no commands.

## Cross-cutting
---

- [x] Specification template revised (Rationale column, member tables, Kind definitions, Category Vocabulary, appendices).
- [x] `.codex.md` Logging flow section written; error-handling contract recorded in the Handoff.
- [x] `.codex.md` module map lists every module and document, and includes `validate-expected-class.js`.
- [x] `BaseClass.js Specification.md` complete. It covers `BaseClass`, `BaseModal`, `build-frontmatter-block.js`, the four controls, and `validateExpectedClass`.
- [ ] Decide which classes without a spec warrant one. Each class's Spec item below covers writing or retrofitting it.
- [ ] Add spec home rows for the `resolution/` modules, in the spec of the class that needs them.
- [ ] Add a spec home row for `appendToFrontmatterArray`, in the spec of the class that needs it.
- [ ] Audit external projects that use `BaseClass` (ENVOY, Pulp Fiction, Victorian Mayhem) against the logging contract.
- [ ] Rewrite the command-contract prose in `.commands.md` to match the plain `callback()` pattern and the Logging flow. It currently describes `checkCallback()` and says failures "propagate".
- [ ] Add the completed control modules to the project directory, because other specs refer to them (user task).

## .codex/core/
---

### objects/

- [x] `Archive.js`
  - [x] Spec (write or retrofit to the current template)
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)
- [x] `BaseClass.js`
  - [x] Spec (write or retrofit to the current template)
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)
- [x] `Image.js`
  - [x] Spec (write or retrofit to the current template)
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)

### modals/

- [x] `BaseModal.js`
- [x] `ImageModal.js`

### documents

- [ ] `Entity.js Remediation.md`
- [ ] `Entity.js Schema.md`
- [ ] `Entity.js Specification.md`

## .codex/creative/
---

### objects/

- [x] `Manuscript.js`
  - [x] Spec (write or retrofit to the current template)
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)
- [x] `Scene.js`
  - [x] Spec (write or retrofit to the current template)
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)
- [x] `Story.js`
  - [x] Spec (write or retrofit to the current template)
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)
- [x] `StoryArchive.js`
  - [x] Spec (write or retrofit to the current template)
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)

### modals/

- [x] `SceneModal.js`
- [x] `StoryModal.js`

### controls/

- [x] `manuscript-pipelines.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)
- [x] `scene-template-helpers.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)

### documents

- [x] `creative.md`

## .codex/library/
---

### objects/

- [ ] `Aggregate.js`
  - [ ] Spec (write or retrofit to the current template) — spec exists in the map; retrofit status not verified
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Article.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Author.js`
  - [ ] Spec (write or retrofit to the current template) — spec exists in the map; retrofit status not verified
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Chapter.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Collection.js`
  - [ ] Spec (write or retrofit to the current template) — spec exists in the map; retrofit status not verified
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Definition.js`
  - [ ] Spec (write or retrofit to the current template) — spec exists in the map; retrofit status not verified
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Entry.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Essay.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Glossary.js`
  - [ ] Spec (write or retrofit to the current template) — spec exists in the map; retrofit status not verified
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Interview.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Lecture.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Library.js`
  - [ ] Spec (write or retrofit to the current template) — spec exists in the map; retrofit status not verified
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Monograph.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Periodical.js`
  - [ ] Spec (write or retrofit to the current template) — spec exists in the map; retrofit status not verified
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Record.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Report.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Review.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Thesis.js`
  - [ ] Spec (write or retrofit to the current template) — no spec in the map
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `Works.js`
  - [ ] Spec (write or retrofit to the current template) — spec exists in the map; retrofit status not verified
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)

### modals/

- [ ] `AggregateModal.js`
- [ ] `ArticleModal.js`
- [ ] `AuthorModal.js`
- [ ] `ChapterModal.js`
- [ ] `CollectionModal.js`
- [ ] `DefinitionModal.js`
- [ ] `EntryModal.js`
- [ ] `EssayModal.js`
- [ ] `InterviewModal.js`
- [ ] `LectureModal.js`
- [ ] `LibraryModal.js`
- [ ] `MonographModal.js`
- [ ] `PeriodicalModal.js`
- [ ] `RecordModal.js`
- [ ] `ReportModal.js`
- [ ] `ReviewModal.js`
- [ ] `ThesisModal.js`
- [ ] `WorksModal.js`

### base-builders/

- [ ] `build-bibliography.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `build-glossary-index.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)

### citation/

- [ ] `apa.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `chicago.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `citation-engine.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `mla.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `name-format.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `citation.md`

### controls/

- [ ] `library-vocab.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)

### documents

- [ ] `Apparatus Library Property Taxonomy.md`
- [ ] `Documentation Sync Command Specification.md`
- [ ] `Library Accession Trigger Map.md`
- [ ] `library.md`

## .codex/controls/
---

- [x] `FileSuggest.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log) — no `Log` calls
- [x] `FolderSuggest.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log) — no `Log` calls
- [x] `NoteSuggest.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log) — no `Log` calls
- [x] `ValueSuggest.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log) — no `Log` calls
- [x] `validate-expected-class.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)

## .codex/frontmatter/
---

- [x] `append-to-frontmatter-array.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)
- [x] `build-frontmatter-block.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log) — no `Log` calls

## .codex/resolution/
---

- [x] `resolve-authors.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log) — no `Log` calls
- [x] `resolve-collection-fields.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log) — no `Log` calls
- [x] `resolve-library.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)
- [x] `resolve-note-file.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log)
- [x] `resolve-titles.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging (throws, does not log) — no `Log` calls

## .codex/utils/
---

- [ ] `inputValidation.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `links.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)
- [ ] `logger.js`
- [ ] `romanNumeralConversion.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging (throws, does not log)

## .codex/ documents
---

- [x] `.codex.md` — module map refreshed; Logging flow current
- [ ] `Accession Specification.md`
- [ ] `Apparatus Affiliations Taxonomy.md`
- [x] `Apparatus Code Module Specification Template.md` — revised in this work
- [ ] `Apparatus Module Taxonomy.md`
- [x] `Apparatus Retrofit Work Checklist.md` — this file
- [x] `Apparatus Spec Workflow Handoff.md` — maintained in this work
- [ ] `Apparatus Status Taxonomy.md`
- [ ] `Code Style Guide.md`
- [ ] `Existing Note Migration Worksheet.md`
- [ ] `Module Maintenance Checklist.md`
- [ ] `Publication Module Implementation.md`

## .commands/
---

- [x] `core-create-image.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [x] `creative-create-scene.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [x] `creative-create-story.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [x] `creative-sync-dependency-docs.js`
  - [x] Code (comments stripped, JSDoc added)
  - [x] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-article.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-author.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-chapter.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-collection.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-definition.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-entry.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-essay.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-glossary.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-interview.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-lecture.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-library.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-monograph.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-periodical.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-record.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-report.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-review.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-create-thesis.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)
- [ ] `library-sync-dependency-docs.js`
  - [ ] Code (comments stripped, JSDoc added)
  - [ ] Logging contract (submit handler and `callback()` each catch, log once, no rethrow)