import { BaseClass } from '../../core/objects/BaseClass.js';

/**
 * Scene note. Carries a manuscript stage, a stage-dependent status, a chapter, and context.
 */
export class Scene extends BaseClass {
	/**
	 * Value written to the `class` frontmatter field.
	 * @type {string}
	 */
	static classValue = 'scene';

	/**
	 * Stage name whose scenes use `serial-status`.
	 * @type {string}
	 */
	static SERIAL_STAGE = 'serial-draft';

	/**
	 * Valid `editorial-status` values.
	 * @type {string[]}
	 */
	static EDITORIAL_STATUS_VALUES = [
		'not-started',
		'in-progress',
		'revision',
		'complete'
	];
	
	/**
	 * Valid `serial-status` values.
	 * @type {string[]}
	 */
	static SERIAL_STATUS_VALUES = [
		'backlog',
		'active',
		'ready',
		'published'
	];

	/**
	 * Stores the scene fields.
	 * @param {import('obsidian').App} app
	 * @param {Object} [options]
	 * @param {string} [options.stage] Manuscript stage name. Defaults to `''`.
	 * @param {string} [options.editorialStatus] Status value, written under the key from `statusFieldKey`. Defaults to `''`.
	 * @param {string} [options.chapter] Chapter number. Defaults to `''`.
	 * @param {string} [options.context] Context value. Defaults to `''`.
	 */
	constructor(app, options = {}) {
		super(app, options);
		this.stage = options.stage ?? '';
		this.editorialStatus = options.editorialStatus ?? '';
		this.chapter = options.chapter ?? '';
		this.context = options.context ?? '';
	}

	/**
	 * Frontmatter key of the status field: `serial-status` at the serial stage, otherwise `editorial-status`.
	 * @returns {string}
	 */
	get statusFieldKey() {
		return this.stage === Scene.SERIAL_STAGE ? 'serial-status' : 'editorial-status';
	}

	/**
	 * Valid values for the status field named by `statusFieldKey`.
	 * @returns {string[]}
	 */
	get statusValues() {
		return this.stage === Scene.SERIAL_STAGE
		? Scene.SERIAL_STATUS_VALUES
		: Scene.EDITORIAL_STATUS_VALUES;
	}

	/**
	 * Returns the scene's frontmatter fields in render order.
	 * @returns {Object<string, *>}
	 */
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

	/**
	 * Returns the scene body: a comment-listing Dataview script, an empty text area, and a status reference.
	 * @returns {string}
	 */
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