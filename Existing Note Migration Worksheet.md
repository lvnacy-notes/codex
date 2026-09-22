---
class: archive
category:
  - documentation
tags:
---
Working notes from a design conversation on migrating existing vault content into the current class/modal object shapes. Nothing here is a finalized spec — this is the problem, the choices, the hurdles, and the ideas established so far, for reference when this work actually gets picked up.

## Contents
---
```toc
```

## 1. Problem Statement
---

The class/modal system (`BaseClass` → `Works`/`Aggregate`/`Library`/`Author`, etc.) is built for **creating new notes**: a modal collects input, a constructor assigns fields, `getFrontmatterFields()`/`getBody()` render the note, `postCreate()` runs Accession pushes. None of this covers **existing notes** that predate a class, predate a field, or were classified under an old taxonomy value.

Templater's "apply template to existing note" behavior — append missing properties, insert body content at the cursor — doesn't map onto this system, because the system has no equivalent read-existing-note-then-reconcile path anywhere in its object model.

Two needs were identified, both wanted as a **recurring** capability (the taxonomy will keep evolving), not a one-time cleanup:

1. Backfill missing/new frontmatter fields onto old notes.
2. Reclassify notes into new class/category values.

## 2. Established Architecture: Three-Phase Split
---

The work splits into three phases, because each needs different tooling and only one of them is actually automatable end-to-end.

| Phase | What it does | Where it runs | Automatable? |
| --- | --- | --- | --- |
| Frontmatter | Add/remove/reorder keys, rewrite `class` value | Archivist (external CLI, git-scoped) | Yes |
| Body content | Reconcile old handwritten prose into new heading structure | Manual, possibly Templater-assisted | No — judgment call per note |
| Object-model behavior | Citation regen, Accession pushes, folder relocation | Obsidian/CodeScript (needs `app` API) | Partially — blocked on design work below |

## 3. Frontmatter Phase (Archivist)
---

### What Archivist already provides

- `archivist reclassify --from X --to Y` — rewrites only the `class:` value. Nothing else in frontmatter is touched.
- `archivist frontmatter apply-template -t <template> -c <class>` — reconciles a note's frontmatter against a template file: adds missing keys (template defaults), removes keys the template doesn't have, reorders to match, preserves existing values for retained keys.
- Both are re-runnable, `--dry-run`-able, and scoped via `--class`/`--path`/`--tag` — fits the "recurring tool" requirement.

### Hurdle: no template files exist yet

None of the class schemas (`Collection.js`, `Periodical.js`, `Author.js`, etc.) currently have a corresponding template `.md` file for `apply-template` to consume.

### Decision in progress: on-demand generation, not static files

Static template files go stale the moment a class spec changes. Preferred direction: generate a template **on demand**, from the same code that builds real notes — either a standalone "generate template for class X" tool, or a flag/option on the existing `library-create-<class>.js` commands.

**Hurdle underneath that decision:** several classes' constructors call **throwing resolvers** as part of normal construction —
- `Collection.periodical` → `resolveNoteTitle()`, throws if unresolved
- `Definition.reference-work` → `resolveNoteTitles()`, throws if unresolved
- `Author`'s creation command throws if `last-name` is empty

A template needs blank/placeholder values for these fields. Running the *normal* constructor with blank input isn't viable — it'll throw exactly where a template needs to stay empty. Template generation needs its own entry path that can enumerate a class's field list **without invoking resolution**.

This is the same underlying need as the object-model hydration problem in §4 — a class needs to expose "here are my fields and their shape" independent of a real constructor run. Worth solving once for both use cases rather than twice, if the two efforts end up co-designed.

## 4. Object-Model Phase (Obsidian/CodeScript)
---

This is the "nice to have, but would save a lot of time" piece: after a note's frontmatter is corrected, actually running the citation computation, Accession pushes, and folder relocation a normally-created note gets for free.

### Rejected approach: recreate-and-delete

Initial framing ("retrofit constructors to hydrate from an existing note") was challenged and correctly so: if hydrating means *running the constructor and regenerating everything, writing a new note, deleting the old one*, that's not a migration — it's a destructive recreate. Two concrete problems:

1. **Filename collision risk** at the new note's target path.
2. **Body destruction** — `getBody()` methods return scaffolded headings meant to be filled in *after* creation (`Works.js`'s `## Summary`/`## catalog queries`/`## notes`, `Author.js`'s `### Authored`/`### Edited`/etc.). An existing note being migrated almost certainly has handwritten prose under headings already. Regenerating the body wholesale destroys it.
3. Wikilinks pointing at the old filename would break unless something explicitly repoints them.

### Preferred direction: in-place hydrate-and-rewrite

- Read the existing note's current frontmatter into instance state (new entry path, not the modal-input path).
- Regenerate **only the frontmatter block** — never touch the body (see §5).
- Move the file to the new class's `resolveFolder()` target via Obsidian's rename API (e.g. `fileManager.renameFile()`), which repoints links automatically, rather than creating a second file.
- A same-name collision at the destination becomes a normal, surfaced error condition — not a silent side effect of the design.

### Blocking dependency: `BaseClass.js` is undocumented

No spec exists yet for `BaseClass.js` — how a class's constructor currently writes a note to disk (fixed new-file creation only, vs. something that could target an existing `TFile`) is unknown. **This design cannot proceed until `BaseClass.js` has a spec** (planned, not yet started, per the person building this).

## 5. Body Content Phase — Findings
---

### Why this can't be automated

`getBody()` methods define **semantically named sections**, not generic containers. Matching an old note's ad hoc headings onto a new class's specific heading structure (which may rename, split, or drop sections) has no safe generic algorithm — getting it wrong means silently misfiling or destroying a curator's own writing. This is worse than doing nothing, so it stays a human judgment call, at least until every note belonging to an Apparatus has been migrated once.

### Templater's actual behavior (confirmed, not assumed)

Templater does **pure cursor-position insertion**, not a heading-aware merge. Given a note with existing content and the cursor placed at the top (under frontmatter), applying a template pushes all existing content down and inserts the template's body at the cursor. It has no awareness that an old note's `## Notes` and the new template's `## Notes` are "the same" section — reconciliation (cutting/pasting old content into the right new headings) is entirely manual, every time.

**Conclusion:** there's no clever automation hiding in Templater to route around here. The manual cut-paste step is inherent to the problem, not a tooling gap.

## 6. Archivist-Side Ideas (tracked separately — not part of this system's own roadmap)
---

These came up in conversation but belong to Archivist's own project, not this vault's object-model code. Noted here only so they aren't lost; decisions on these happen outside this thread.

1. **Augment `reclassify`** so that migrating a note's class value pulls in "the whole kit and kaboodle" of the new class's schema in one pass — not just the bare `class:` rewrite it does today. (Already on the Archivist roadmap.)
2. **Companion command** to batch-prepend a class's current body scaffold under the frontmatter of every note matching a given `--class`/`--path`, across the whole vault in one pass — so notes arrive already scaffolded and ready for manual cut-paste, instead of running Templater note-by-note first. (Already on the Archivist roadmap, as a companion to #1.)
3. **Backup/restore feature set** — already in active development for Archivist; the above two ideas are currently queued behind it.

## 7. Open Items
---

- [ ] `BaseClass.js` needs a specification before the hydrate-and-rewrite object-model path can be designed at all.
- [ ] Decide the mechanism for a class to expose its field list without invoking throwing resolvers — needed by both on-demand template generation (§3) and existing-note hydration (§4). Candidate: a shared "field introspection" mode distinct from the real constructor path, rather than two divergent definitions of a class's field set.
- [ ] Once `BaseClass.js` is specced: confirm whether the current create flow could support writing frontmatter to an already-existing `TFile`, or whether that capability needs to be added.
- [ ] Filename-collision handling at relocation time (surfaced error vs. some resolution strategy) — not yet designed, just identified as needing to be a real, visible failure rather than silent behavior.
- [ ] Body reconciliation tooling (Archivist companion command, §6.2) will reduce prep work but does not remove the manual cut-paste step itself.