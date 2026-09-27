import { BaseClass } from '../../core.apparatus/objects/BaseClass.js';

export class Scene extends BaseClass {
  static classValue = 'scene';

  // Scenes at this stage use `serial-status` instead of `editorial-status`
  // in their frontmatter -- same field/vocabulary, different key name,
  // since a serial's first-draft stage is tracked distinctly per the
  // taxonomy. Every other stage keeps `editorial-status`.
  static SERIAL_STAGE = 'serial-draft';

  // Value vocabularies for the two status domains -- distinct sets, not a
  // shared one: editorial-status tracks draft/edit progress, serial-status
  // tracks a serialized post's own publication lifecycle.
  static EDITORIAL_STATUS_VALUES = ['not-started', 'in-progress', 'revision', 'complete'];
  static SERIAL_STATUS_VALUES = ['backlog', 'active', 'ready', 'published'];

  constructor(app, options = {}) {
    super(app, options);
    this.stage = options.stage ?? '';
    this.editorialStatus = options.editorialStatus ?? '';
    this.chapter = options.chapter ?? '';
    this.context = options.context ?? '';
  }

  // Frontmatter key for this scene's status field, derived from `stage`
  // rather than tracked separately -- `stage` is the single source of
  // truth, so there's nothing that can drift out of sync with it.
  get statusFieldKey() {
    return this.stage === Scene.SERIAL_STAGE ? 'serial-status' : 'editorial-status';
  }

  // Valid values for this scene's status field, matching statusFieldKey.
  get statusValues() {
    return this.stage === Scene.SERIAL_STAGE
      ? Scene.SERIAL_STATUS_VALUES
      : Scene.EDITORIAL_STATUS_VALUES;
  }

  getFrontmatterFields() {
    const base = this.baseFrontmatterFields();
    return {
      class: base.class,
      category: base.category,
      affiliations: base.affiliations,
      created: base.created,
      modified: base.modified,
      stage: this.stage,
      [this.statusFieldKey]: this.editorialStatus,
      chapter: this.chapter,
      context: this.context,
      tags: base.tags,
    };
  }

  getBody() {
    return `## comments
---
\`\`\`dataviewjs
const file = app.vault.getAbstractFileByPath(dv.current().file.path);
const content = await app.vault.read(file);

const openFence = content.indexOf("\`\`\`dataviewjs");
const closeFence = content.indexOf("\`\`\`", openFence + 13);
const scanned = content.slice(closeFence + 3);

const lineOffset = content.substring(0, closeFence + 3).split("\\n").length - 1;
const lines = scanned.split("\\n");

function lineOf(str, index) {
	return str.substring(0, index).split("\\n").length;
}

function nearestHeading(lines, fromLine) {
	for (let i = fromLine; i >= 0; i--) {
		if (/^#{1,6}\\s/.test(lines[i])) {
			return lines[i].replace(/^#+\\s*/, "").trim();
		}
	}
	return "—";
}

const open = "<" + "!--";
const close = "--" + ">";
const commentRegex = new RegExp(open + "([\\\\s\\\\S]*?)" + close, "g");

const results = [];
for (const match of scanned.matchAll(commentRegex)) {
	const line = lineOf(scanned, match.index) - 1;
	results.push([
		line + 1 + lineOffset,
	    nearestHeading(lines, line),
	    match[1].trim()
	]);
}

if (results.length === 0) {
	dv.paragraph("✓ No comments found.");
} else {
	dv.table(["Line", "Section", "Comment"], results);
}
\`\`\`
## text
---



## reference
---
\`\`\`
${ this.statusFieldKey }
----------------
${ this.statusValues.join(' | ') }
\`\`\``;
  }
}