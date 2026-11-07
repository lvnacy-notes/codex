---
class: archive
category:
  - specification
created: 2026-08-31
modified: 2026-08-31
context:
  - "[[Entity.js Specification]]"
tags:
---
Capture of a confirmed design decision affecting `NoteSuggest.js`, surfaced while planning Entity's implementation. To be applied when the Entity implementation checklist is drafted — not a spec in its own right, and not yet a change to `NoteSuggest.js Specification` (no such document currently exists; `NoteSuggest.js` is documented inline in `README.md` only).

## Contents
---
```toc
```

## 1. The Decision
---

`NoteSuggest.js`'s `expectedClass` constructor option changes from a single string to an array of strings. This is a revision to the existing class, not an additive extension — `expectedClass` is array-shaped everywhere going forward, and every current call site passing a bare string must be updated to pass a single-element array instead.

**Driving need**: `Entity.js Specification` §9 defines several fields with a dual- or triple-class allowance — `founder` (`Person`/`Organization`/`Belief-System`), `participants`/`possessor` (`Person`/`Organization`), `origin` (`Person`/`Place`/`Organization`). None of these can be built against `NoteSuggest`'s current single-class filter without either under-scoping the field (accepting any note, discarding what the spec actually says the field allows) or duplicating the control.

## 2. Required Code Change
---

`NoteSuggest.js`'s `getSuggestions()` currently filters with a single equality check:

```js
if (this.expectedClass) {
	const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
	if (frontmatter?.class !== this.expectedClass) {
		return false;
	}
}
```

This becomes a membership check against an array:

```js
if (this.expectedClass) {
	const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
	if (!this.expectedClass.includes(frontmatter?.class)) {
		return false;
	}
}
```

No other part of `NoteSuggest.js` needs to change — `folderPath`/`resolveFolderPath` handling is untouched.

## 3. Existing Call Sites Requiring Migration
---

Every current caller passes `expectedClass` as a bare string. Each needs to become a single-element array (`'author'` → `['author']`) to keep working under the revised signature.

| Caller | Field(s) | Current value |
| --- | --- | --- |
| `WorksModal.buildWorksFields()` | Authors, Editors, Translators | `'author'` |
| `WorksModal.buildWorksFields()` | Collections | `'collection'` |
| `InterviewModal.onOpen()` | Interviewer, Interviewee | `'author'` |
| `ThesisModal.onOpen()` | Advisor | `'author'` |
| `CollectionModal.onOpen()` | Periodical | `'periodical'` |
| `CollectionModal.onOpen()` | Cover card | `'image'` |
| `CollectionModal.onOpen()` | Translators | `'author'` |
| `AggregateModal.buildEditorsSetting()` | Editors (shared by `CollectionModal`/`PeriodicalModal`) | `'author'` |
| `DefinitionModal.onOpen()` | Related | `'definition'` |

`BaseModal.js`'s `buildNoteLinkSetting()`, `buildNoteListSetting()`, and `buildNoteSuggestSetting()` all pass `expectedClass` through to `NoteSuggest` unchanged — no logic change needed there, only the type expectation of what they're handed.

Fields already unscoped (no `expectedClass` at all — `Chapter.parentWork`, `Entry.referenceWork`, `Review.subjectWork`, `Thesis.institution`, `Report.commissioningBody`, `Lecture.event`) are unaffected.

## 4. New Call Sites This Revision Unlocks
---

Not migrations — new usage, once the revision lands, per `Entity.js Specification` §9:

| Field | Leaf | Target classes |
| --- | --- | --- |
| `founder` | `Organization`, `Belief-System` | `['person', 'organization', 'belief-system']` |
| `participants` | `Event` | `['person', 'organization']` |
| `possessor` | `Artifact` | `['person', 'organization']` |
| `origin` | `Artifact` | `['person', 'place', 'organization']` |

## 5. Change Log
---

| Date | Change |
| ---- | ------ |
| 2026-08-31 | Initial capture. `NoteSuggest.expectedClass` confirmed as a revision (string → array), not an additive extension. Nine existing call sites identified for migration; four new Entity-tier call sites identified as the driving need. |