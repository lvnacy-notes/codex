import { Archive } from '../../core/objects/Archive.js';

/**
 * Archive note for a story. Supplies the story's integrity and drafts checks.
 */
export class StoryArchive extends Archive {
	/**
	 * Returns the frontmatter fields in render order.
	 * @returns {Object}
	 */
	getFrontmatterFields() {
		return super.getFrontmatterFields();
	}

	/**
	 * Returns the `story`, `manuscript`, and `scene` integrity checks.
	 * @returns {Array<{ label: string, script: string }>}
	 */
	integrityChecks() {
		const tag = this.moduleTag;
		return [
			{ label: 'story', script: storyIntegrityScript(tag) },
			{ label: 'manuscript', script: manuscriptIntegrityScript(tag) },
			{ label: 'scene', script: sceneIntegrityScript(tag) },
		];
	}

	/**
	 * Returns the heading of the snapshot section.
	 * @returns {string}
	 */
	snapshotSectionTitle() {
		return 'drafts';
	}

	/**
	 * Returns the `snapshot existence` and `pre-removal validation` checks.
	 * @returns {Array<{ label: string, script: string }>}
	 */
	snapshotChecks() {
		const tag = this.moduleTag;
		return [
			{ label: 'snapshot existence', script: snapshotExistenceScript(tag) },
			{ label: 'pre-removal validation', script: preRemovalValidationScript(tag) },
		];
	}
}

/**
 * Returns the DataviewJS script that reports story notes missing required fields.
 * @param {string} tag Story tag the script queries.
 * @returns {string}
 */
function storyIntegrityScript(tag) {
	return `const storyFiles = dv.pages("#${ tag }").where(p => p.class === "story");

let complete = 0;
const incomplete = [];

for (const file of storyFiles) {
	const hasStoryStatus = file["story-status"] !== undefined && file["story-status"] !== null;
	const hasStage = file.stage !== undefined && file.stage !== null;
	const hasEditorialStatus = file["editorial-status"] !== undefined && file["editorial-status"] !== null;

	const missing = [];
	if (!hasStoryStatus) missing.push("story-status");
	if (!hasStage) missing.push("stage");
	if (!hasEditorialStatus) missing.push("editorial-status");

	if (missing.length === 0) {
		complete++;
	} else {
		incomplete.push({ link: file.file.link, missing: missing.join(", ") });
	}
}

dv.paragraph(\`**Story**: \${complete} complete, \${incomplete.length} incomplete\`);
if (incomplete.length > 0) {
	dv.table(["File", "Missing Fields"], incomplete.map((f) => [f.link, f.missing]));
}`;
}

/**
 * Returns the DataviewJS script that reports manuscript notes missing required fields.
 * @param {string} tag Story tag the script queries.
 * @returns {string}
 */
function manuscriptIntegrityScript(tag) {
	return `const manuscriptFiles = dv.pages("#${ tag }")
	.where(p => p.class === "manuscript")
	.where(p => !p.file.path.includes("ARCHIVE/DRAFTS"));

let complete = 0;
const incomplete = [];

for (const file of manuscriptFiles) {
	const longform = file.longform || {};
	const statusField = file.stage === "serial-draft" ? "serial-status" : "editorial-status";
	const hasStage = file.stage !== undefined && file.stage !== null;
	const hasStatus = file[statusField] !== undefined && file[statusField] !== null;
	const hasFormat = longform.format !== undefined && longform.format !== null;
	const hasTitle = longform.title !== undefined && longform.title !== null;
	const hasDraftTitle = longform.draftTitle !== undefined && longform.draftTitle !== null;
	const hasWorkflow = longform.workflow !== undefined && longform.workflow !== null;

	const missing = [];
	if (!hasStage) missing.push("stage");
	if (!hasStatus) missing.push(statusField);
	if (!hasFormat) missing.push("longform.format");
	if (!hasTitle) missing.push("longform.title");
	if (!hasDraftTitle) missing.push("longform.draftTitle");
	if (!hasWorkflow) missing.push("longform.workflow");

	if (missing.length === 0) {
		complete++;
	} else {
		incomplete.push({ link: file.file.link, missing: missing.join(", ") });
	}
}

dv.paragraph(\`**Manuscript**: \${complete} complete, \${incomplete.length} incomplete\`);
if (incomplete.length > 0) {
	dv.table(["File", "Missing Fields"], incomplete.map((f) => [f.link, f.missing]));
}`;
}

/**
 * Returns the DataviewJS script that reports scene notes missing required fields.
 * @param {string} tag Story tag the script queries.
 * @returns {string}
 */
function sceneIntegrityScript(tag) {
	return `const { getStagePipeline } = await requireAsync('/.codex/creative/controls/manuscript-pipelines.js');
const storyPage = dv.pages("#${ tag }").where(p => p.class === "story").array()[0];
const stages = storyPage ? getStagePipeline(storyPage.category) : [];
const statusOf = (p) => p["editorial-status"] ?? p["serial-status"];

const sceneFiles = dv.pages("#${ tag }")
	.where(p => p.class === "scene")
	.where(p => stages.includes(p.stage));

for (const scene of sceneFiles) {
	const hasStage = scene.stage !== undefined && scene.stage !== null;
	const hasStatus = statusOf(scene) !== undefined && statusOf(scene) !== null;
	const hasChapter = scene.chapter !== undefined && scene.chapter !== null;
	const hasContext = scene.context !== undefined && scene.context !== null;

	const missing = [];
	if (!hasStage) missing.push("stage");
	if (!hasStatus) missing.push(scene.stage === "serial-draft" ? "serial-status" : "editorial-status");
	if (!hasChapter) missing.push("chapter");
	if (!hasContext) missing.push("context");

	if (missing.length > 0) {
		dv.paragraph(\`**Scene**: \${scene.file.link} is missing: \${missing.join(", ")}\`);
	}
}`;
}

/**
 * Returns the DataviewJS script that reports which stages have a draft snapshot folder.
 * @param {string} tag Story tag the script queries.
 * @returns {string}
 */
function snapshotExistenceScript(tag) {
	return `const { getStagePipeline } = await requireAsync('/.codex/creative/controls/manuscript-pipelines.js');
const storyPage = dv.pages("#${ tag }").where(p => p.class === "story").array()[0];
const stages = storyPage ? getStagePipeline(storyPage.category) : [];
const archiveFolder = dv.current().file.folder;
const basePath = \`\${archiveFolder}/DRAFTS\`;

const results = stages.map((stage) => {
	const exists = app.vault.getAbstractFileByPath(\`\${basePath}/\${stage}\`) ? "\\u2713" : "\\u26a0\\ufe0f Missing";
	return [stage, exists];
});

dv.table(["Stage", "Snapshot Status"], results);`;
}

/**
 * Returns the DataviewJS script that reports draft snapshots missing required fields.
 * @param {string} tag Story tag the script queries.
 * @returns {string}
 */
function preRemovalValidationScript(tag) {
	return `const draftFiles = dv.pages("#${ tag }")
	.where(p => p.class === "manuscript")
	.where(p => p.file.path.includes("ARCHIVE/DRAFTS"));

let complete = 0;
const incomplete = [];

for (const file of draftFiles) {
	const longform = file.longform || {};
	const statusField = file.stage === "serial-draft" ? "serial-status" : "editorial-status";
	const hasStage = file.stage !== undefined && file.stage !== null;
	const hasStatus = file[statusField] !== undefined && file[statusField] !== null;
	const hasScenes = longform.scenes && Array.isArray(longform.scenes) && longform.scenes.length > 0;

	const missing = [];
	if (!hasStage) missing.push("stage");
	if (!hasStatus) missing.push(statusField);
	if (!hasScenes) missing.push("longform.scenes");

	if (missing.length === 0) {
		complete++;
	} else {
		incomplete.push({ link: file.file.link, missing: missing.join(", ") });
	}
}

dv.paragraph(\`**Draft Snapshots**: \${complete} complete, \${incomplete.length} incomplete (\\u26a0\\ufe0f *pre-removal validation*)\`);
if (incomplete.length > 0) {
	dv.paragraph("\\u26a0\\ufe0f These drafts are incomplete and should not be removed from the workflow:");
	dv.table(["Draft", "Missing Fields"], incomplete.map((f) => [f.link, f.missing]));
} else if (complete > 0) {
	dv.paragraph("\\u2713 All draft snapshots are complete and eligible for archival.");
}`;
}