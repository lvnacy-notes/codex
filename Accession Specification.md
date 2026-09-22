---
class: archive
category:
  - specification
affiliations:
created: 2026-08-22
modified: 2026-09-05
context:
  - "[[Library Accession Trigger Map]]"
tags:
---
Spec for Accession — a creation-time reverse-edge population pattern for relational fields in the Apparatus.

## Contents
---

```toc
```

## 1. Scope and Purpose
---

- A relational field is a directed edge: a note that carries a wikilink or wikilink-array value knows about the note(s) it points to, but the referenced note has no built-in awareness of being referenced back.
- Accession is the pattern of supplying that awareness automatically. When a note carrying one or more relational fields is created, the creating note itself — not the curator — writes the reverse edge into a relational array field on each note it references, at the moment of creation.
- Accession is not a code module and not centralized infrastructure. It is behavior implemented inside a class's own `postCreate()` override — the hook already defined, as a no-op, on `BaseClass`, and called automatically after a successful file write. There is no shared dispatch, registry, or trigger-map lookup; a class implementing Accession-style behavior does so entirely within its own override.
- Accession fires once, at creation time. There is no watcher and no edit-time trigger — if a relational field is edited after creation, changing the forward edge, the previously-written reverse edge does not follow automatically. Reconciling it afterward is the responsibility of whoever made the edit.

## 2. Mechanism
---

- A note is created holding one or more relational fields, each pointing at one or more other notes.
- On successful creation, the creating note resolves each populated relational field to the note(s) it targets.
- For each resolved target, the creating note pushes a value — typically a normalized reference to itself — into a relational array field on that target note.
- A single creation event may drive more than one reverse-edge write. A target field may receive pushes sourced from more than one of the creating note's own fields, and different source fields may map to different target fields rather than all landing in the same place.
- A push is not limited to notes referenced directly. If a directly-referenced note itself carries a relational field pointing further along the graph, and that field is populated, the creating note may resolve through it to push a reverse edge onto a note it never referenced directly. How far a chain like this extends is a matter of implementation, not a fixed depth this pattern requires.

## 3. Dedupe and Failure Model
---

- A push must be duplicate-safe: appending a value already present in the target field is a no-op, not a repeated entry.
- A failed push throws and logs rather than failing silently. It does not roll back the primary note, which may already exist on disk by the time a downstream push fails.
- A partially-completed Accession pass — some pushes succeeding, a later one failing — requires manual reconciliation. There is no automated retry or rollback.
- No pre-flight existence check precedes creation of the primary note. Resolution and pushing happen only after the file write has already succeeded, inside `postCreate()`.

## 4. Scope Boundaries
---

- Accession concerns only relational fields on a target note that are populated exclusively through this cascade — fields that start empty at that note's own creation and are never collected through that note's own modal or curator input.
- A relational field that a note resolves on itself, at its own construction, independent of any other note's state, is not Accession. Accession is specifically about writing into a different, already-existing note — not about a note resolving references it already holds.
- A relational field that remains exclusively curator-entered on the target note — never receiving a push from any other note's creation — is out of scope by definition, regardless of whether that same note also carries other fields that are in scope for Accession.

## 5. Change Log
---

| Date | Change |
| --- | --- |
| 2026-09-05 | Rewritten to describe Accession as a general reverse-edge population pattern with no reference to any specific class, module, or implementation. The prior trigger map, object graph, and per-class cross-references — all specific to the Library module's implementation — were extracted in full to [[Library Accession Trigger Map]]. This document now covers only the mechanism itself: what a relational field is, how a reverse edge gets written, the dedupe/failure discipline any implementation must follow, and the boundary between what counts as Accession and what doesn't. |
| 2026-08-25 | Extended §3's existing porting note to also name Library Module §3, Data Flow, which restates the trigger map in prose. No content changed. |
| 2026-08-23 | Updated cross-references from "Cascade Mechanism" to "Accession," matching the per-class specs' actual renamed section headers. Removed open items describing work now complete. |
| 2026-08-22 | Initial spec. Documented the full six-row Accession trigger map — since extracted to [[Library Accession Trigger Map]] — consolidating and superseding the separate Cascade Mechanism descriptions previously maintained independently in each class's own spec. |