---
class: archive
category:
  - templates
affiliations:
created: 2026-08-21
modified:
context:
  - "[[Apparatus Module Taxonomy]]"
  - "[[Apparatus Status Taxonomy]]"
tags:
---

\[ Enter short description of module ]

<!--- Do not include INSTRUCTIONS section in spec --->

**INSTRUCTIONS**

A spec describes the guiding mechanics of a class: it's purpose and shape, and the mechanisms over which it operates. This is not a historical document. The only section in which descriptions of a class' history and evolution are allowed are in the change log. When filling out other sections, do not describe why a decision was made or what changed from prior behavior. A spec is kept up-to-date with how a class behaves _now_. It is factual and current.

Spec shape is standardized to:
**File construction** — Frontmatter Fields, Status, Body Content.
**Custom Behavior** — workflow, custom class mechanisms sitting between the class object and its accompanying modal if one exists.
**Modal** — class object instantiation modal.
**Command** — class object instantiation command. 
**Companion Files** — additional files and objects instantiated with class
**Open Items**
**Change Log**

Be as specific yet comprehensive as possible. A user should be able to scan the document and get a relatively complete idea of the class in a short amount of time. Do not include superfluous data or information. Do not deviate from this design. Do not make shit up.

<!--- End INSTRUCTIONS section ------------------------>

## Contents
---
```toc
```

## 1. Scope and Class Shape
---

Describe scope and class shape. Category vocabulary, if relevant, is included in this section and cross-referenced with [[Apparatus Module Taxonomy]].

## 2. Frontmatter Fields
---

**Describing the class object specifically**: What fields are inherited? What fields are specific to this class?

**Frontmatter fields to include in the spec**:

```yaml
class: archive
category: specification
affiliations:
created: <created date>
modified: <last modified date>
context:
  - [[Apparatus Module Taxonomy]]
  - [[Apparatus Status Taxonomy]]
  - <additional docs as related to spec>
tags:
```

## 3. Status Field
---

What status field is in use? Status is scoped by domain and adheres to the [[Apparatus Status Taxonomy]]. New domains should be registered in [[Apparatus Status Taxonomy]]  and cross-referenced here.

## 4. Body Content
---

Concise, yet comprehensive description of what is returned by `getBody()`:

- Dataview queries are described here; their purpose, function, and code should be included
- Specific sections should be listed, with their purpose and organization
- Any other pertinent information

## 5-? Custom Behavior, omit if none
---

<!---
Extraneous sections describing custom behavior for this class would go here, if the custom behavior is managed between the class object and its accompanying modal, pushing the remaining sections down by however many sections needed to describe the custom behavior.
--->
## 5. Modal
---

§5 if no custom behavior. Is there an accompanying Modal? If so, where is its code module located? Are there any special mechanisms built into the modal that is specific to this class?

How are the fields produced on the object at creation time? Describe the Field build order. Do not discuss what is inherited versus what is specific—this information should be listed in §2.

## 6. Command
---

What command scaffolds this class? Is there custom behavior in the class that is driven by the command and not the class or modal?

Command naming convention is `<module>-create-<class>.js` and commands are located in `.obsidian/commands`.

## 7. Additional Companion Files, one section each
---

Some classes ship with a companion `.base` files. Others may have additional documentation or objects—images, collections, whatever—scaffolded with them. Companion files are itemized in separate sections—one section per file—and described in full within their respective sections.

Each section should be titled `<section number>. Companion <concise file description> File/Card`. Examples:

- 7. Companion `.base` File
- 8. Companion `Image` Card

## 8. Open Items
---

What remains under development? Unresolved inquiries and concepts, and planned development descriptions go here.

## 9. Change Log
---

Historical record of this specification in table form. Example:

| Date       | Change       |
| ---------- | ------------ |
| 2026-08-20 | Initial spec |
