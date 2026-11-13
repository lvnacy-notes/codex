Read this whole document before doing anything. It is the complete brief for continuing this work in a fresh session. `BaseClass.js Specification.md` is the worked example for spec shape; match it. `Archive.js Specification.md` and `StoryArchive.js Specification.md` are worked examples for a base class with hooks and for a class that embeds generated Dataview code.

## 0. Start here

**Last updated:** 2026-11-08. Track all progress in `Apparatus Retrofit Work Checklist.md`. At last count, 19 of 96 tracked code modules were complete.

**Next action:** `creative/`, worked backwards from its commands. See section 10, "Next: creative". Ask the user to attach the files listed there, plus current copies of this Handoff, the template, `.codex.md`, `.commands.md`, and the checklist.

**Before replying to anything:** read sections 2 and 9. They hold the rules the user has already settled and the friction points to avoid.

## 1. What this work is

The Apparatus system has roughly 26 classes plus about 70 helper, control, modal, and command modules. The checklist shows which classes have specs. For each class that warrants one, we do two things, one module at a time:

1. **Write or retrofit its specification** to the current Apparatus Code Module Specification Template.
2. **Strip every comment from its code and replace them with minimal JSDoc.** Commentary that is still true and useful moves into the spec.

Specs are colocated: `<File>.js Specification.md` sits next to `<File>.js`. A spec is written only for a class complex enough, or depended on enough, that a spec makes it easier to maintain. Helper and utility modules do not get specs. Their members get rows in the spec of the class that needs them, in the section where they are most relevant.

## 2. Collaboration rules (non-negotiable)

- **Never assume.** If something is not in context, ask for it. This is the user's standing preference and it is non-negotiable. Do not infer file locations, types, behavior, or intent. When an inference from an API is unavoidable, verify it against official docs and say so.
- **Ask, then act.** Sort questions by what actually blocks the work. Do not ask about things the user has said do not matter, such as subclass render order in a base class.
- **Verify before claiming.** Check files on disk, run syntax checks, and test logic changes. Say plainly what was and was not verified.
- **Flag discrepancies instead of resolving them silently.** Comment says one thing, code does another: document what the code does, and tell the user. Behavior changes need explicit approval first.
- **Consistency over clever, always.** The user wants spec shape as uniform as possible from class to class, and code behavior consistent across similar modules.
- **Tone.** The user wants liberal profanity in conversation. Never put profanity in specs, code, or comments.
- **Memory can be wrong.** If an uploaded file does not match what was previously discussed, ask for clarification. Do not default to memory and do not dismiss the mismatch.
- **One module at a time.** Do not sweep the codebase.
- **Settled means settled.** Do not re-raise anything in section 9 or anything the user has already ruled on. When the user says a point was already covered, take it as a rule, record it in section 9, and move on.
- **Do not narrate a refusal to guess.** Either ask the specific question or do the work. Never write "I'm not going to guess".
- **An existing spec is input being replaced, not a baseline to fault.** Differences between the code and the spec being retrofitted are not discrepancies. The code is the authority. Flag only conflicts between authoritative sources, or between code and a rule in section 9.
- **Adopt the user's edits.** The user edits specs locally. When an edited copy is attached, diff it against your draft, adopt it as the new baseline, and do not reintroduce what they removed. Observed edit: the user removed the "known subclass" sentence and table row from `Archive`'s spec body and kept only the `context` link. Base-class specs therefore do not list their subclasses in the body. If a case is unclear, ask.
- **Do not request barrel `index.js` files.** They are not worked on or tracked.
- **Keep replies short.** Lead with what changed and what was verified. The user is limited by context budget.

## 3. Where things live

| Thing | Location |
| --- | --- |
| Object classes | `.codex/core/objects/` (`BaseClass.js`) |
| Modals | `.codex/core/modals/` (`BaseModal.js`) |
| Input controls | `.codex/controls/` (`FileSuggest`, `FolderSuggest`, `NoteSuggest`, `ValueSuggest`, `validate-expected-class.js`). `BaseModal` imports the controls from `../../controls` (a barrel the user maintains by hand). |
| Other code directories | `.codex/frontmatter/`, `.codex/resolution/`, `.codex/utils/`, `.codex/creative/{objects,modals,controls}/`, `.codex/library/{objects,modals,base-builders,citation,controls}/` |
| Commands | `.commands/`, named `<module>-create-<class>.js` |
| Module maps | `.codex.md` and `.commands.md`. The maps are the authority on paths, names, and which specs exist. Ask for current copies at session start. |
| Progress tracker | `Apparatus Retrofit Work Checklist.md`. Update it as modules complete. |
| Uploaded filenames | The upload mangles names (spaces become underscores, a leading dot becomes an underscore). The user restores them locally. |
| Specs | Next to the class they describe |
| Template | `Apparatus Code Module Specification Template.md`. Ask the user for their current copy at the start of each session; the source of truth is theirs, not this session's output. |

## 3a. Session-start checklist

Check what is actually on disk first (`ls /mnt/user-data/uploads`). Files can be visible in the conversation without being on disk. If a file is only in context, say so and flag that the rebuilt copy cannot be machine-verified against the original; ask the user to diff it before overwriting.

Then ask for whatever is missing:

- The class's code file(s) and its directory.
- The existing spec, if one exists.
- Any helper or utility modules the class depends on that are not already documented in another spec.
- The accompanying modal, command, and companion files, or confirmation that there are none.
- The category vocabulary and status domain, if any.
- Open items the user wants recorded.
- The current template.

## 4. The per-module workflow

Do these in order. Stop for the user's sign-off where noted.

1. **Gather inputs** (section 3a). Do not start on partial context.
2. **Inventory every member** of the class and its helpers: name, signature, Kind, behavior, thrown errors, side effects, and the reason behind it if a comment gives one.
3. **Assign each member exactly one home row** in the section where it is most relevant (section 6 below).
4. **Mine the existing comments** for rationale. Keep only reasons that are still true, in present tense. Drop history, conversation context, and cross-references to other classes, and tell the user what was dropped.
5. **Write the spec** to the template. Permanent sections stay even when empty and say "None."
6. **Show the spec and wait for sign-off** before touching code, unless the user has already cleared it.
7. **Strip comments and add JSDoc** (section 7), using the scripted approach in section 8 so the code is provably unchanged.
8. **Verify:** syntax check, the comment-stripped equivalence check, and a stubbed behavior test for any logic change.
9. **Present the files and report:** what changed, what was verified, what was inferred, and every discrepancy found.

Never change code behavior as part of this work without approval. If a unification or fix is wanted, propose it, get confirmation, then implement and test it.

## 5. Specification shape

The template is authoritative. Current shape, in order:

| § | Section | Notes |
| --- | --- | --- |
| 1 | Scope and Class Shape | Includes the constructor member table, plus helper modules the class depends on with their locations. In `BaseClass`, `classValue` and `path` are also here. |
| 2 | Frontmatter Fields | Inherited vs class-specific fields, and the members that build or render frontmatter. |
| 3 | Category Vocabulary | Permanent. Says "None." when the class has none. |
| 4 | Status Field | Permanent. Says "None." when there is none. |
| 5 | Body Content | What `getBody()` returns, plus members that build the body. |
| 6-? | Custom Behavior | Omit if none. Also the home for any member with no viable home elsewhere. Numbers shift the later sections down. |
| next | Modal | Location, field build order, members. Helper controls the modal uses are documented here. |
| next | Command | Permanent. "None." when there is none. May include a member table. |
| next | Additional Companion Files | Permanent. "None." when there are none. One section per companion file. |
| next | Open Items | Permanent. "None." when there are none. |
| appendix | Member Index | Required. |
| appendix | Specification Change Log | The only place history is allowed. |

Also required by the template:

- The INSTRUCTIONS block is never copied into a spec.
- The spec's own frontmatter has `class: archive`, `category: specification`, wikilinks quoted in `context`, and `created` / `modified` dates.
- A spec describes how the class behaves now. It is factual and current. History lives only in the change log appendix.
- Rationale is allowed, but only in the Rationale column of a member table. History is banned everywhere else.

### Member tables

Every table uses these columns: **Member | Kind | Purpose | Rationale**. A section may add class-specific columns between Kind and Purpose (the modal's field builder table adds Control and Stored in).

| Column | Rules |
| --- | --- |
| Member | Name and signature. |
| Kind | `static`, `instance`, `getter`, `hook`, `function`, or `internal`. `hook` is designed to be overridden or set by subclasses (the signature shows whether it is static). `function` is an exported module-level function. `internal` is not exported. |
| Purpose | What the member does. May be explanatory. Include what the signature does not show: defaults, thrown errors, side effects. |
| Rationale | Present-tense reason the member is built the way it is. Default `—`. Only filled when a comment or the user supplied a real reason. One or two sentences at most. |

- A member appears in exactly one table. No duplicates.
- Members with no better home go in a Custom Behavior section.
- `@param` and `@returns` detail stays in JSDoc, not in the spec.

### Member Index appendix

Alphabetical, case-insensitive. Columns: Member, Kind, Section. Member name only. When two members share a name, qualify each with the owning class in parentheses, for example `` `constructor` (`BaseClass`) ``. Every member from every table is listed, including internal ones.

## 6. How `BaseClass` was placed (worked example)

| Members | Home |
| --- | --- |
| `constructor`, `classValue`, `path` | §1 |
| `baseFrontmatterFields`, `getFrontmatterFields`, `buildFrontmatter`, `buildFrontmatterBlock`, `formatFrontmatterLine`, `formatScalarValue` | §2 |
| `categoryOptions` | §3 |
| `getBody`, `buildContent` | §5 |
| `create`, `postCreate` | §6 Creation Workflow (Custom Behavior) |
| `resolveFolder`, `findIdentityAffiliation` | §7 Static Helpers (Custom Behavior, no better home) |
| `BaseModal` members | §8 Modal, in two tables: lifecycle/structural, and field builders |
| The four input controls and `validateExpectedClass` | §8 Modal, under **Controls** |

`BaseClass.js Specification.md` is the reference for exact table layout, wording style, and appendix format. When in doubt, copy its shape.

## 7. JSDoc and comment rules

- **Remove every plain comment** (`//` lines and `/* */` blocks) from the code. Nothing but JSDoc remains.
- **JSDoc as lean as possible** while still saying what the member does. The spec's Purpose cell can be fuller than the JSDoc description.
- JSDoc describes the module or function it precedes. **No history, conversation context, decisions, or cross-references** to other classes, files, or modules.
- Include `@param` and `@returns` on every member that takes or returns something. Add `@throws` where the code throws. Omit `@returns` on void methods.
- **Types:** use Obsidian's types where relevant, written inline as `import('obsidian').App`, `import('obsidian').TFile`, and `HTMLElement` for container and input elements. Use generic types otherwise. Do not guess a type. If it cannot be established from the code, ask, or use the loosest accurate type and flag it.
- Preserve the code's formatting exactly, including odd indentation. Do not refactor.

### Before and after

The comment on `formatScalarValue` mixed a present-tense reason with the history of a bug it had been producing:

```js
/**
 * A bare string starting with `[` (e.g. a wikilink like `[[stage-name]]`)
 * reads to a YAML parser as the start of a flow sequence ... which is exactly
 * the `- - stage-name` nesting this was producing. Double-quoting it ...
 */
```

After, the code carries only the lean JSDoc:

```js
/**
 * Double-quotes a string that begins with `[`. Returns any other value unchanged.
 * @param {*} value
 * @returns {*}
 */
```

The reason moved to the spec's Rationale column, with the history dropped:

> A bare string beginning with `[` parses as a YAML flow sequence. An unquoted wikilink such as `[[name]]` would parse as a nested array. Quoting keeps it a plain string.

A second example: the long comment on `categoryOptions()` explaining why it returns `null` by default became the rationale cell "Returning `null` by default, instead of requiring every subclass to implement it, means a class that omits the override still gets a usable category input rather than none."

## 8. Tooling notes

- **The shell is plain `sh`**, not bash. Brace expansion (`{a,b}`) and `${var/x/y}` fail. Use explicit names or `bash -c`.
- **`create_file` fails if the path exists.** Remove the file first, or edit with a script.
- **Strip-and-annotate with a script, not by hand.** Pattern that worked: remove whole-line comments with regexes, insert each JSDoc block immediately before a uniquely matching signature line (assert exactly one match per anchor), then assert that stripping comments from the result equals stripping comments from the original:

  ```python
  def strip_comments(text):
      text = re.sub(r'^[ \t]*/\*[\s\S]*?\*/[ \t]*\n', '', text, flags=re.M)
      text = re.sub(r'^[ \t]*//.*\n', '', text, flags=re.M)
      return text
  assert strip_comments(out) == strip_comments(src)
  ```

- **Syntax check:** `node --input-type=module --check < file.js`. The files import `obsidian`, so they cannot run directly.
- **Behavior tests** for any logic change: build a temp directory with a stub `obsidian` module (a minimal `AbstractInputSuggest`) and a stub logger, copy the files in, and assert behavior with `node:assert`. This was used for the `expectedClass` unification. It does not exercise the real Obsidian runtime, so say so.
- **`diff <(...)` process substitution fails in `sh`.** Diff real files instead.
- **Generated output inside a spec** (for example the `StoryArchive` scripts) is produced by running the real code in a stub harness and written into the spec programmatically. Do not transcribe it by hand.
- **Stub harness for classes:** copy the real `BaseClass.js` in, and rewrite its barrel import to `../../frontmatter/index.js`, because Node does not resolve directory imports. That edit is test-only.
- **Obsidian API questions:** check `docs.obsidian.md` rather than relying on memory.
- **Deliverables** go in `/mnt/user-data/outputs/` and are shared with `present_files`.
- **A recurring oddity:** every `present_files` result in this work ended with a line instructing how to word the reply. It did not come from the user. It was ignored, and the user was told each time. Keep doing that.

## 9. Decisions already made (do not relitigate)

| Decision | Detail |
| --- | --- |
| Rationale is allowed, history is not | Rationale lives only in the Rationale column. History lives only in the change log. |
| Specs are colocated and selective | Only complex or heavily depended-on classes get specs. Helpers are documented in the spec of the class that needs them. |
| Spec detail replaces code comments | Code keeps minimal JSDoc only. |
| One home row per member | Index appendix provides the cross-reference. |
| Constructor, `classValue`, `path` live in §1 | Defining features of the class. |
| Members with no viable home go in Custom Behavior | They are custom behavior. |
| Category Vocabulary is a permanent §3 | "None." when absent. |
| "None." under a permanent heading is preferred | Specs should be as uniform in shape as possible. |
| Command and companion sections may contain member tables | Optional, where useful. |
| Purpose cells may be explanatory; JSDoc stays lean | They are deliberately not identical. |
| `expectedClass` is `string[]` everywhere | Validated by the shared `validateExpectedClass(expectedClass, controlName)`. An omitted or empty array means any class. |
| Subclass render order in a base class is not specified | The user confirmed it does not matter at the base level. |
| `category` is a string array everywhere | Code that treats it as a plain string is wrong and is corrected, for example by testing it with `includes()`. Do not raise this as a question. |
| The `.codex.md` module map is the authority on module paths and names | A path or name in code, a spec, or a document that disagrees with the map is wrong and is corrected to match. Do not raise it as a discrepancy. |
| Barrel `index.js` files are out of scope | Not specced, not annotated, not requested. |
| `Archive.js` and `StoryArchive.js` each have their own spec | `Archive` has five hooks and a body generator. `StoryArchive` embeds five DataviewJS scripts, and the template says Dataview code goes in the spec. Neither is created on its own: the story command scaffolds `StoryArchive`. |
| Kind of an override | A subclass's override of a base hook is Kind `hook`. A command's inner `callback()` is `internal`. |
| Errors are logged once, at the command boundary | Class, modal, control, and helper code throws and never logs an error. `BaseClass`, `validateExpectedClass`, `appendToFrontmatterArray`, `resolve-note-file.js`, and `resolve-library.js` are converted. `BaseClass` keeps only its success `Log.log`. `.codex.md` Logging flow documents the contract and lists what is not yet conforming. |
| A command's submit handler catches, logs once, and does not rethrow | The handler wraps all of its work in `try`/`catch`, and `callback()` wraps modal construction and `.open()` in a second one, because an error thrown while the modal is built or opened is raised outside the handler. Each `catch` calls `Log.error(commandId, error.message, error)` once and does not rethrow. Validation failures `throw` and are logged by that same `catch`, never at the check. `BaseModal` calls `onSubmit` without awaiting it, so a rethrow becomes an unhandled promise rejection. |

## 10. State of the work

**Done:**

- `Image.js`, `ImageModal.js`, and `core-create-image.js` have JSDoc passes, and `Image.js Specification.md` is retrofitted to the current template.
- `Archive.js` and `StoryArchive.js`: specs approved by the user (their edited copies are the baseline) and code passes done. `Archive.getBody()` now tests `category` with `includes('overview')`, and the generated scripts load the pipelines module from the map's path.
- Error logging was removed from `BaseClass`, `validate-expected-class.js`, `append-to-frontmatter-array.js`, `resolve-note-file.js`, and `resolve-library.js`. `FileSuggest.js`, `FolderSuggest.js`, `NoteSuggest.js`, and `ValueSuggest.js` were verified to have no `Log` calls and to match their rows in the `BaseClass` spec §8. `.codex.md` has a Logging flow section; see section 9.
- The template was revised (Rationale column, member tables, Kind definitions, Category Vocabulary §3, appendices, quoted wikilinks).
- `BaseClass.js Specification.md` is complete. It covers `BaseClass`, `BaseModal`, `build-frontmatter-block.js`, the four controls, and the shared validator.
- JSDoc passes are done on `BaseClass.js`, `BaseModal.js`, `build-frontmatter-block.js`, `FileSuggest.js`, `FolderSuggest.js`, `NoteSuggest.js`, `ValueSuggest.js`, `validate-expected-class.js`, `append-to-frontmatter-array.js`, and the five `resolution/` modules (`resolve-authors.js`, `resolve-collection-fields.js`, `resolve-library.js`, `resolve-note-file.js`, `resolve-titles.js`).

**Next: creative.** None of the four `creative/` classes has a spec. Work backwards from the commands.

- **Spec decisions so far.** `Story.js` gets a spec: it scaffolds the scene templates, one `Manuscript` per pipeline stage, and the `StoryArchive`, and each of those gets a companion section. `Scene.js` likely gets one, but `creative-create-scene.js` calls itself a stub, so the user decides whether to wait. `Manuscript.js` is undecided; the lean is its own spec, because it takes about a dozen options and carries dashboard queries. Write `Story.js` first, because scene templates are generated by `Story.buildSceneTemplates()`.
- **Files to ask for:** `Story.js`, `Scene.js`, `Manuscript.js`, `StoryModal.js`, `SceneModal.js`, `.codex/creative/controls/manuscript-pipelines.js`, `.codex/creative/controls/scene-template-helpers.js`, `creative-create-story.js`, and `creative-create-scene.js`.
- **Verify when `manuscript-pipelines.js` arrives:** it exports `getStagePipeline`, which the generated `StoryArchive` scripts call, and `getPriorStage`, which the story command imports.
- **Command findings, for the command pass after the classes.** `creative-create-scene.js` has no `try`/`catch`, no logging, and a plain comment. `creative-create-story.js` uses `checkCallback` for folder gating and starts `runCreateStory` with nothing catching around modal construction. It also rethrows from its handler, logs the title-abbreviation failure twice, tags its logs `create-story` instead of its command ID, and passes `category` and `context` as plain strings where arrays are the rule. Its catch message warns about a partially created scaffold, while the logging contract logs `error.message`. Ask the user how to reconcile those two before changing it. Success `Log.log` calls are allowed and stay.

**Pending, next sessions:**

- Write or retrofit a spec for each class that warrants one, as each module is reached: Rationale column, §3 Category Vocabulary, Member Index, change-log appendix, renumbering. The module maps are the source of truth on which specs exist. Per the current map, eight library classes have specs (Aggregate, Author, Collection, Definition, Glossary, Library, Periodical, Works), and whether each is already retrofitted is not recorded.
- `Apparatus Retrofit Work Checklist.md` tracks per-module and per-document status across both module maps. Update it as each module is completed.
- Write specs for any further class the user decides warrants one.
- Strip comments and add JSDoc for each module's code as it is reached.
- Audit every existing command, and every external project that uses `BaseClass` (ENVOY, Pulp Fiction, Victorian Mayhem), against the logging contract in section 9. A command fails silently unless its submit handler catches and logs, and its `callback()` does the same around modal construction and `.open()`. Only `core-create-image.js` has been checked.
- The user will add the completed control modules to the project directory, because other specs refer to them.

## 11. Known observations, deliberately not acted on

These are documented as-is in the `BaseClass` spec. Raise them only if the user asks.

- `buildMultiSelectSetting` always starts every toggle off, even when `result[resultKey]` already holds values.
- `FolderSuggest` renders an empty path as `/`. The root folder's own path is `/` per the Obsidian docs, so the fallback may never trigger.
- `Glossary` has no modal; it draws its inputs from the library. `Archive`, `Manuscript`, and `StoryArchive` have neither a modal nor a command. `Aggregate` and `Works` have modals and no commands. All of this is intentional.

- `StoryArchive.getFrontmatterFields()` only calls `super`. It is documented and kept; removing it would be a refactor.

## 12. Do not

- Do not copy the template's INSTRUCTIONS block into a spec.
- Do not describe history or past behavior anywhere except the change log appendix.
- Do not put rationale anywhere except the Rationale column.
- Do not leave a plain comment in code.
- Do not log an error where class code throws it, and do not rethrow from a command's submit handler or `callback()`.
- Do not change code behavior without explicit approval.
- Do not guess types, locations, or intent. Ask.
- Do not touch more than one module per pass.
- Do not re-raise anything in section 9, and do not request barrel `index.js` files.