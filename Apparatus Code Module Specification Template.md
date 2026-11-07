---
class: archive
category:
  - templates
affiliations:
created: 2026-08-21
modified: 2026-11-01
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
tags:
---

\[ Enter short description of module ]

<!--- Do not include INSTRUCTIONS section in spec --->

**INSTRUCTIONS**

A spec describes the guiding mechanics of a class: it's purpose and shape, and the mechanisms over which it operates. This is not a historical document. The only place a class' history and evolution may be described is the Specification Change Log appendix. A spec is kept up-to-date with how a class behaves _now_. It is factual and current.

Rationale is allowed. History is not. Rationale is the present-tense reason a member is built the way it is, and it lives only in the Rationale column of a member table. Do not describe why a decision was made in the past, what a member replaced, what was wrong before, or what changed from prior behavior, in any section.

A spec lives in the same directory as the class it describes. Specs are written for classes complex enough, or depended on enough, that a spec makes them easier to maintain. Helper and utility modules do not get specs; their members are given rows in the spec of the class that needs them, in the section where they are most relevant.

Spec shape is standardized to:
**File construction** — Frontmatter Fields, Category Vocabulary, Status, Body Content.
**Custom Behavior** — workflow, custom class mechanisms sitting between the class object and its accompanying modal if one exists.
**Modal** — class object instantiation modal.
**Command** — class object instantiation command. 
**Companion Files** — additional files and objects instantiated with class
**Open Items**
**Appendix: Member Index**
**Appendix: Specification Change Log**

Be as specific yet comprehensive as possible. A user should be able to scan the document and get a relatively complete idea of the class in a short amount of time. Do not include superfluous data or information. Do not deviate from this design. Do not make shit up.

**MEMBER TABLES**

Every member of the class and of the helper modules it depends on gets exactly one home row, in the section where it is most relevant. A member never appears in more than one section table. Members with no viable home in another section are given rows in a Custom Behavior section.

Every member table uses these columns, in this order:

| Column | Content |
| --- | --- |
| Member | Name and signature |
| Kind | One of: static, instance, getter, hook, function, internal. `hook` is a member designed to be overridden or set by subclasses (its signature shows whether it is static). `function` is an exported module-level function. `internal` is a member that is not exported. |
| Purpose | What the member does. May be explanatory. Include behavior the signature does not show: defaults, thrown errors, side effects. |
| Rationale | Present-tense reason the member is built the way it is. Default is `—`. Filled only when the reason is not obvious from the purpose. One or two sentences at most. |

A section's table may add class-specific columns between Kind and Purpose (e.g. a modal's builder table adds Control and Stored In).

Rules:

- `@param` and `@returns` detail lives in the member's JSDoc in the code, not in the spec.
- The Purpose cell may be explanatory. A member's JSDoc description is as lean as it can be while still saying what the member does.
- Code comments describe the module or function they precede and nothing else. No history, conversation context, decisions, or cross-references.

<!--- End INSTRUCTIONS section ------------------------>

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

Describe scope and class shape.

Include a member table for the constructor. Helper and utility modules the class depends on are named here, with their location.

## 2. Frontmatter Fields
---

**Describing the class object specifically**: What fields are inherited? What fields are specific to this class?

Include a member table for the members that build or render the frontmatter.

**Frontmatter fields to include in the spec**:

```yaml
class: archive
category: specification
affiliations:
created: <created date>
modified: <last modified date>
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
  - <additional docs as related to spec>
tags:
```

## 3. Category Vocabulary
---

Does the class declare a fixed category vocabulary? If so, list the valid values and cross-reference them with [[Apparatus Module Taxonomy]]. Describe how the vocabulary is consumed by the class's modal. If the class declares none, state "None."

Include a member table for the members that declare the vocabulary.

## 4. Status Field
---

What status field is in use? Status is scoped by domain and adheres to the [[Apparatus Status Taxonomy]]. New domains should be registered in [[Apparatus Status Taxonomy]]  and cross-referenced here.

## 5. Body Content
---

Concise, yet comprehensive description of what is returned by `getBody()`:

- Dataview queries are described here; their purpose, function, and code should be included
- Specific sections should be listed, with their purpose and organization
- Any other pertinent information

Include a member table for the members that build the body.

## 6-? Custom Behavior, omit if none
---

<!---
Extraneous sections describing custom behavior for this class would go here, if the custom behavior is managed between the class object and its accompanying modal, pushing the remaining sections down by however many sections needed to describe the custom behavior.
--->

Each custom behavior section includes a member table for the members that implement it. Members with no viable home in another section are tabled here.

## 6. Modal
---

§6 if no custom behavior. Is there an accompanying Modal? If so, where is its code module located? Are there any special mechanisms built into the modal that is specific to this class?

How are the fields produced on the object at creation time? Describe the Field build order. Do not discuss what is inherited versus what is specific—this information should be listed in §2.

Include a member table for the modal's members.

## 7. Command
---

What command scaffolds this class? Is there custom behavior in the class that is driven by the command and not the class or modal?

Command naming convention is `<module>-create-<class>.js` and commands are located in `.commands/`.

If the command has members worth tabling, include a member table.

## 8. Additional Companion Files, one section each
---

Some classes ship with a companion `.base` files. Others may have additional documentation or objects—images, collections, whatever—scaffolded with them. Companion files are itemized in separate sections—one section per file—and described in full within their respective sections.

Each section should be titled `<section number>. Companion <concise file description> File/Card`. Examples:

- 8. Companion `.base` File
- 9. Companion `Image` Card

## 9. Open Items
---

What remains under development? Unresolved inquiries and concepts, and planned development descriptions go here.

## Appendix: Member Index
---

Required. Alphabetical index of every member in the spec's member tables, including internal members. Member name only, no signature.

| Member | Kind | Section |
| --- | --- | --- |
| `exampleMember` | instance | §1 |

## Appendix: Specification Change Log
---

Historical record of this specification in table form. Example:

| Date       | Change       |
| ---------- | ------------ |
| 2026-08-20 | Initial spec |