import { BaseClass } from '../../core/objects/BaseClass.js';

/**
 * Manuscript note for one stage of a story. Carries the stage, its status, the Longform configuration, and a scene sorting specification, and supplies the stage's editorial dashboard.
 */
export class Manuscript extends BaseClass {
	/**
	 * Value written to the `class` frontmatter field.
	 * @type {string}
	 */
	static classValue = 'manuscript';

	/**
	 * Stores the manuscript fields and builds the `longform` object.
	 * @param {import('obsidian').App} app
	 * @param {Object} [options]
	 * @param {string} [options.stage] Stage name. Defaults to `''`.
	 * @param {string} [options.editorialStatus] Status of the stage. Defaults to `''`.
	 * @param {?string} [options.priorStage] Stage before this one, or `null` for the first stage. Defaults to `null`.
	 * @param {string[]} [options.context] Cross-reference links. Defaults to `[]`.
	 * @param {string} [options.storyTag] Vault tag scoping the story's notes. Defaults to `''`.
	 * @param {string} [options.format] Defaults to `'scenes'`.
	 * @param {string} [options.title] Defaults to `''`.
	 * @param {string} [options.draftTitle] Defaults to the stage name.
	 * @param {string} [options.workflow] Defaults to `'Default Workflow'`.
	 * @param {string} [options.sceneFolder] Defaults to `'/'`.
	 * @param {string} [options.sceneTemplate] Vault-relative path of the stage's scene template. Defaults to `''`.
	 * @param {string[]} [options.scenes] Ordered scene filenames. Defaults to `[]`.
	 */
	constructor(app, options = {}) {
		super(app, options);
		this.stage = options.stage ?? '';
		this.editorialStatus = options.editorialStatus ?? '';
		this.priorStage = options.priorStage ?? null;
		this.context = options.context ?? [];
		this.storyTag = options.storyTag ?? '';
		this.longform = {
			format: options.format ?? 'scenes',
			title: options.title ?? '',
			draftTitle: options.draftTitle ?? this.stage,
			workflow: options.workflow ?? 'Default Workflow',
			sceneFolder: options.sceneFolder ?? '/',
			sceneTemplate: options.sceneTemplate ?? '',
			scenes: options.scenes ?? [],
		};
	}

	/**
	 * Returns the manuscript's frontmatter fields in render order.
	 * @returns {Object<string, *>}
	 */
	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();
		const tags = this.storyTag ? Array.from(new Set([this.storyTag, ...base.tags])) : base.tags;
		return {
			class: base.class,
			category: base.category,
			affiliations: base.affiliations,
			created: base.created,
			modified: base.modified,
			stage: this.stage,
			[statusFieldFor(this.stage)]: this.editorialStatus,
			longform: this.longform,
			context: this.context,
			'sorting-spec': SCENE_SORTING_SPEC,
			tags,
		};
	}

	/**
	 * Returns the editorial dashboard for this manuscript's stage.
	 * @returns {string}
	 */
	getBody() {
		return buildManuscriptDashboard({
			stage: this.stage,
			priorStage: this.priorStage,
			storyTag: this.storyTag,
		});
	}
}

/**
 * Sorting specification that orders the scenes in the stage folder by `chapter`.
 * @type {string}
 */
const SCENE_SORTING_SPEC = '< a-z by-metadata: chapter\n';

/**
 * Returns the status field key for a stage: `serial-status` at `serial-draft`, otherwise `editorial-status`.
 * @param {string} stage
 * @returns {string}
 */
function statusFieldFor(stage) {
	return stage === 'serial-draft' ? 'serial-status' : 'editorial-status';
}

/**
 * Returns the dashboard body: queries scoped to one stage of one story, with a cross-stage lineage section when a prior stage is given.
 * @param {Object} params
 * @param {string} params.stage
 * @param {?string} params.priorStage
 * @param {string} params.storyTag
 * @returns {string}
 */
function buildManuscriptDashboard({ stage, priorStage, storyTag }) {
	const statusField = statusFieldFor(stage);

	const lineageSection = priorStage
		? `\n\n\n### cross-stage lineage: ${ priorStage } → ${ stage }
\`\`\`dataview
TABLE WITHOUT ID
	source as "${ priorStage } Scene",
	rows.file.link as "${ stage } Scenes"
FROM
	#${ storyTag }
WHERE
	contains(class, "scene") AND
	contains(stage, "${ stage }") AND
	context
FLATTEN
	context as source
GROUP BY
	source
SORT
	source ASC
\`\`\``
		: '';

	return `# contents

\`\`\`toc
\`\`\`

# ${ stage } editorial dashboard
Tracking ${ stage } workflow, scene metadata integrity, and readiness for stage advancement.

## inline comments

\`\`\`dataviewjs
const pages = dv.pages("#${ storyTag }")
	.where(p => \`\${p.class}\`.includes("scene"))
	.where(p => \`\${p.stage}\`.includes("${ stage }"));

const results = [];
for (const page of pages) {
	const file = app.vault.getAbstractFileByPath(page.file.path);
	if (!file) continue;
	const content = await app.vault.read(file);
	if (!content) continue;
	const matches = [...content.matchAll(/<!--\\s*([\\s\\S]*?)-->/g)];
	for (const match of matches) {
		const raw = match[1].trim();
		const named = raw.match(/^([A-Za-z][\\w'-]*)\\s*:\\s*([\\s\\S]*)$/);
		const author = named ? named[1] : "author";
		const comment = (named ? named[2] : raw).trim();
		results.push([page.file.link, author, comment]);
	}
}

if (results.length === 0) {
	dv.paragraph("✓ No inline comments.");
} else {
	dv.table(["Scene", "Author", "Comment"], results);
}
\`\`\`

## scene metadata management
Validates that all draft scenes have required metadata fields: stage, ${ statusField }, chapter, and context.

### incomplete metadata
\`\`\`dataviewjs
const stageScenes = dv.pages('#${ storyTag }')
	.where(p => p.class === "scene")
	.where(p => p.stage === "${ stage }");

const statusField = \"${ statusField }\";
	const stageIncomplete = [];

for (const scene of stageScenes) {
	const hasStage = scene.stage !== undefined && scene.stage !== null;
	const hasStatus = scene[statusField] !== undefined && scene[statusField] !== null;
	const hasChapter = scene.chapter !== undefined && scene.chapter !== null;
	const hasContext = scene.context !== undefined && scene.context !== null;

	if (!(hasStage && hasStatus && hasChapter && hasContext)) {
		const missing = [];
		if (!hasStage) missing.push("stage");
		if (!hasStatus) missing.push(statusField);
		if (!hasChapter) missing.push("chapter");
		if (!hasContext) missing.push("context");

		stageIncomplete.push({
			link: scene.file.link,
			missing: missing.join(", ")
		});
	}
}

if (stageIncomplete.length === 0) {
	dv.paragraph("All ${ stage } scenes have complete metadata.");
} else {
	dv.table(
		["Scene", "Missing Fields"],
		stageIncomplete.map(s => [s.link, s.missing])
	);
}
\`\`\`

### ${ stage } scene metadata completeness
\`\`\`dataviewjs
const stageScenes = dv.pages('#${ storyTag }')
	.where(p => p.class === "scene")
	.where(p => p.stage === "${ stage }");

let complete = 0;
let incomplete = 0;

for (const scene of stageScenes) {
	const hasStage = scene.stage !== undefined && scene.stage !== null;
	const hasStatus = scene[statusField] !== undefined && scene[statusField] !== null;
	const hasChapter = scene.chapter !== undefined && scene.chapter !== null;
	const hasContext = scene.context !== undefined && scene.context !== null;

	if (hasStage && hasStatus && hasChapter && hasContext) {
		complete++;
	} else {
		incomplete++;
	}
}

if (complete === 0 && incomplete === 0) {
	dv.paragraph("No ${ stage } scenes found.");
} else {
	let mermaidCode = "pie title ${ stage } scene metadata completeness\\n";
	mermaidCode += \`    "complete" : \${complete}\\n\`;
	mermaidCode += \`    "incomplete" : \${incomplete}\\n\`;
	dv.paragraph("\`\`\`mermaid\\n" + mermaidCode + "\`\`\`");
}

dv.paragraph(\`**Complete**: \${complete} | **Incomplete**: \${incomplete} | **Total**: \${complete + incomplete}\`);
\`\`\`

## status distribution
Breakdown of ${ statusField } values across all draft scenes.

\`\`\`dataviewjs
const stageScenes = dv.pages('#${ storyTag }')
	.where(p => p.class === "scene")
	.where(p => p.stage === "${ stage }");

const statusField = \"${ statusField }\";
	const statusCounts = {};
for (const scene of stageScenes) {
	const status = scene[statusField] || "unset";
	statusCounts[status] = (statusCounts[status] || 0) + 1;
}

const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

if (total === 0) {
	dv.paragraph("No ${ stage } scenes found.");
} else {
	let mermaidCode = "pie title ${ stage } status distribution\\n";
	for (const [status, count] of Object.entries(statusCounts)) {
		mermaidCode += \`    "\${status}" : \${count}\\n\`;
	}
	dv.paragraph("\`\`\`mermaid\\n" + mermaidCode + "\`\`\`");
}
\`\`\`

## scene lineage
Tracking scenes across revision stages. The Story Spec contains the full set of tables to track scenes from their inception through the workflow. Each draft tracks its specific scene mapping from the prior revision stage.

### lineage completeness

\`\`\`dataviewjs
const stageScenes = dv.pages('#${ storyTag }')
	.where(p => p.class === "scene")
	.where(p => p.stage === "${ stage }");

const scenesByLineage = { documented: [], undocumented: [] };

for (const scene of stageScenes) {
	if (scene.context && (Array.isArray(scene.context) ? scene.context.length > 0 : true)) {
		scenesByLineage.documented.push(scene.file.link);
	} else {
		scenesByLineage.undocumented.push(scene.file.link);
	}
}

if (scenesByLineage.undocumented.length === 0) {
	dv.paragraph("✓ All ${ stage } scenes have documented lineage.");
} else {
	dv.paragraph(\`**Lineage Documented**: \${scenesByLineage.documented.length} scenes | **Lineage Pending**: \${scenesByLineage.undocumented.length} scenes\`);
}
\`\`\`${ lineageSection }`;
}