import { BaseClass } from '../../../lib/objects/BaseClass.js';

export class Manuscript extends BaseClass {
	static classValue = 'manuscript';

	constructor(app, options = {}) {
		super(app, options);
		this.stage = options.stage ?? '';
		this.editorialStatus = options.editorialStatus ?? '';
		// Prior stage in this story's pipeline, or null for the first stage
		// (e.g. shitty-first-draft, serial-draft). Passed in directly by the
		// caller rather than looked up here -- Manuscript itself doesn't know
		// about the full stage pipeline for a given length/form; that lookup
		// lives in core/manuscriptPipelines.js and is the orchestration
		// layer's job (Phase 2), not this class's.
		this.priorStage = options.priorStage ?? null;
		this.context = options.context ?? '';
		// The vault tag scoping this story's notes (e.g. "my-story-name"),
		// used to filter the dashboard queries below to just this story.
		this.storyTag = options.storyTag ?? '';
		this.longform = {
			format: options.format ?? 'scenes',
			title: options.title ?? '',
			draftTitle: options.draftTitle ?? this.stage,
			workflow: options.workflow ?? 'Default Workflow',
			sceneFolder: options.sceneFolder ?? '/',
			// Vault-relative path (with .md extension) to this stage's
			// scene Templater template -- e.g. Story.buildSceneTemplates()'
			// output, wired in by calamity-create-story.js via
			// sceneTemplateSuffixForStage(). Blank when the caller doesn't
			// supply one (e.g. a Manuscript created outside the story
			// scaffold flow).
			sceneTemplate: options.sceneTemplate ?? '',
			scenes: options.scenes ?? [],
		};
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
			// This manuscript note's own status field describes the entire
			// pipeline stage/container as a whole, independent of any
			// individual scene's own status -- but it resolves to the same
			// key name a scene at that stage would use: editorial-status
			// normally, serial-status when this manuscript's own stage is
			// serial-draft. serial-draft sits in a separate publication
			// pipeline from every other stage, not a variant of the
			// standard editorial one, so it gets a genuinely different
			// status domain rather than just a different value within the
			// same one. Reuses statusFieldFor(), the same resolver used
			// below in buildManuscriptDashboard() for querying this
			// stage's scenes.
			[statusFieldFor(this.stage)]: this.editorialStatus,
			longform: this.longform,
			context: this.context,
			tags: base.tags,
		};
	}

	getBody() {
		return buildManuscriptDashboard({
			stage: this.stage,
			priorStage: this.priorStage,
			storyTag: this.storyTag,
		});
	}
}

// A scene's own status field depends on its stage: serial-draft scenes carry
// serial-status, every other stage carries editorial-status. See
// calamity-taxonomy.md -- this is a scene-level footnote on editorial-status,
// not a new top-level status domain.
function statusFieldFor(stage) {
	return stage === 'serial-draft' ? 'serial-status' : 'editorial-status';
}

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

dv.paragraph(\`**Complete**: \${complete} | **Incomplete**: \${incomplete} | **Total**: \{complete + incomplete}\`);
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