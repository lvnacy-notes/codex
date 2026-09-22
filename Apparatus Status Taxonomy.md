---
class: archive
category:
  - specification
affiliations:
created: 2026-07-17
modified: 2026-08-20
tags:
---
This document is the authoritative reference for all domain-scoped status properties in the Calamity Apparatus. It defines the status properties, their scope, and the canonical vocabulary for each domain.

This document is paired with [Apparatus Module Taxonomy.md](Apparatus%20Module%20Taxonomy.md). That document remains authoritative for `class`, `category`, and `affiliations`; this document is authoritative for domain status properties and their vocabulary.

---
```toc
```

## 1. Core Rule
---

The generic property `status` is retired as a primary metadata field.

All state-like metadata must use a domain-scoped property of the form `*domain*-status`:

- `catalog-status`
- `release-status`
- `editorial-status`
- `serial-status`
- `story-status`
- `archive-status`
- `workflow-status`
- `library-status`

Each property has one meaning within its domain and must not be reused for another domain.

## 2. Authority and Scope
---

Use this document as the normative source whenever a status property or value must be defined, queried, or extended. Do not create ad hoc variants such as `project-status`, `publication-state`, or local-only status fields unless this document is revised.

## 3. Relationship to Stage
---

`stage` remains a separate concept and must not be treated as a substitute for status.

- Use `stage` for pipeline position.
- Use `*domain*-status` for the current state of a note within its domain.

Examples:
- `stage: serial-draft`
- `editorial-status: in-progress`

## 4. Canonical Status Properties
---

| Property | Applies to | Purpose | Canonical values |
| -------- | ---------- | ------- | ---------------- |
| `catalog-status`   | library records, work indexes, ingest-oriented notes | cataloging and processing state           | `raw`, `active`, `processed`, `archived`, `placeholder`, `shelved`           |
| `release-status`   | `edition`, `column`                                  | publication readiness                     | `backlog`, `planned`, `ready`, `published`, `archived`                       |
| `editorial-status` | `manuscript`, `scene` except serial-draft            | drafting and revision state               | `backlog`, `in-progress`, `revision`, `ready`, `complete`, `abandoned`       |
| `serial-status`    | `manuscript`, `scene` in `serial-draft` workflow     | serial drafting state                     | `backlog`, `in-progress`, `revision`, `ready`, `complete`, `abandoned`       |
| `story-status`     | `story`                                              | project lifecycle for the work as a whole | `backlog`, `active`, `paused`, `complete`, `abandoned`                       |
| `archive-status`   | archive/system notes                                 | preservation and lifecycle state          | `active`, `archived`, `retained`, `deprecated`                               |
| `workflow-status`  | admin/ops container notes and project boards         | operational lifecycle                     | `backlog`, `active`, `paused`, `processing`, `ready`, `complete`, `archived` |
| `library-status`   | library root/dashboard notes (`Library.js`)          | lifecycle state of the library itself, distinct from `catalog-status` on the works within it | `unbound`, `active`, `dormant`, `musty`, `archived`                          |

## 5. Usage Guidance
---

- Use `catalog-status` for library and cataloging workflows.
- Use `release-status` for edition- and column-level publication readiness.
- Use `editorial-status` for manuscript- and scene-level creative drafting and revision.
- Use `serial-status` for manuscript- and scene-level creative drafting in the serial stage.
- Use `story-status` for the overall lifecycle of a story project.
- Use `archive-status` for archival or preservation contexts.
- Use `workflow-status` for admin/ops project tracking outside any specific content domain.
- Use `library-status` for the lifecycle of a context library's own root/dashboard note. `dormant` is reachable only from `active`, never directly from `unbound`.
- Do not use generic `status` as a fallback.

## 6. Mapping by Note Class
---

| Note class | Recommended property |
| --- | --- |
| `edition` | `release-status` |
| `column` | `release-status` |
| `manuscript` | `editorial-status` or `serial-status` depending on stage |
| `scene` | `editorial-status` or `serial-status` depending on stage |
| `story` | `story-status` |
| `archive` | `archive-status` |
| workflow/project container | `workflow-status` |
| `periodical` | `catalog-status` |
| `collection` | `catalog-status` |
| library/catalog note | `catalog-status` |
| `library` (root/dashboard note) | `library-status` |

## 7. Cross-Reference to the Main Taxonomy
---

The Apparatus Module Taxonomy defines the vocabulary of `class`, `category`, and `affiliations`. This status document defines the vocabulary of domain-scoped status properties. Together they provide the complete metadata grammar for the Calamity Apparatus.