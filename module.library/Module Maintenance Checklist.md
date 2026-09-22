---
class: archive
category:
  - templates
created: 2026-08-21
modified:
context:
  - "[[Library Module]]"
tags:
---

# Module Maintenance Checklist

Use this checklist whenever a file in `.obsidian/apparatus/library/` is added, removed, renamed, or behaviorally changed. Mark an item complete only after the corresponding documentation and dependent modules have been reviewed.

## Change Record

- Change summary:
- Files changed:
- Date reviewed:
- Reviewer:

## File Inventory

- [ ] Confirm every file in `.obsidian/apparatus/library/` is represented in the File Inventory appendix of [[Library Module]].
- [ ] Confirm filenames, directory paths, and exported classes/functions match the implementation.
- [ ] Update the relevant inventory table when a file is added, removed, or renamed.
- [ ] Confirm no stale references remain to renamed or removed modules.

## Class Hierarchy and Modal Pairing

- [ ] Confirm the class extends the documented superclass.
- [ ] Update the Class Hierarchy section if inheritance changes.
- [ ] Confirm the corresponding modal exists and extends the expected modal class.
- [ ] Confirm the class-to-modal pairing in the Classes table.
- [ ] Confirm any new leaf class is included in the appropriate citation and vocabulary documentation.

## Dependencies and Runtime Assumptions

- [ ] Confirm imports from shared `.obsidian/apparatus` infrastructure still resolve.
- [ ] Confirm CodeScript Toolkit remains the required execution environment.
- [ ] Confirm all required Obsidian APIs and runtime services are documented.
- [ ] Update the External Dependencies and Runtime Assumptions section when a dependency or API changes.
- [ ] Confirm Library, Works, and Collections folder-resolution assumptions remain accurate.

## Frontmatter and Note Construction

- [ ] Compare constructor fields with `getFrontmatterFields()` output.
- [ ] Confirm frontmatter keys match [[Apparatus Library Property Taxonomy]].
- [ ] Confirm controlled values match [[Apparatus Module Taxonomy]] and [[Apparatus Status Taxonomy]].
- [ ] Confirm generated body content, embeds, and linked `.base` files remain accurate.
- [ ] Update the relevant class description or specification when note shape changes.

## Citation Engine

- [ ] Confirm every citable class is registered in `FORMATTERS` for each supported style.
- [ ] Confirm the registered style list and style/class matrix remain accurate.
- [ ] Confirm formatter aliases, especially the Monograph-to-Essay alias, are documented.
- [ ] Confirm linked authors, titles, collections, and Article collection fields resolve as documented.
- [ ] Confirm citation failure behavior and required Library `citation-style` configuration remain accurate.
- [ ] Update [[citation]] when citation contracts or formatting behavior change.

## Controls and Resolution

- [ ] Confirm each control module's exported API is documented.
- [ ] Confirm strict resolvers still log and throw on required failures.
- [ ] Confirm lenient resolvers still preserve unresolved links or return `null` as documented.
- [ ] Confirm every “Used By” list reflects actual imports and call sites.
- [ ] Confirm cascade helpers still skip duplicate array values and report failures correctly.

## Cascade and Lifecycle Behavior

- [ ] Confirm modal input reaches the intended object constructor.
- [ ] Confirm citation computation occurs at the documented lifecycle stage.
- [ ] Confirm `postCreate()` behavior for Work-to-Collection and Work-to-Periodical author cascades.
- [ ] Confirm `postCreate()` behavior for Collection-to-Periodical collection cascades.
- [ ] Update the Data Flow section when lifecycle ordering or ownership changes.
- [ ] Update [[Periodical.js Specification]] or [[Collection.js Specification]] when cascade behavior changes.

## Documentation Links and Appendices

- [ ] Confirm all specification links resolve.
- [ ] Confirm taxonomy and dependency references are current.
- [ ] Confirm the File Inventory remains grouped by `lib/objects/`, `lib/modals/`, `lib/controls/`, and `citation/`.
- [ ] Add or update a Change Log entry when the documentation itself changes.
- [ ] Record unresolved questions or deferred documentation work in the module TODO.

## Completion

- [ ] Review the complete diff for unrelated changes.
- [ ] Re-read the affected sections of [[Library Module]].
- [ ] Update the `modified` field where appropriate.
- [ ] Note remaining risks, missing tests, or follow-up specifications:
