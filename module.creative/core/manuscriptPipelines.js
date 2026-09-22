// Stage pipeline definitions for the Calamity story taxonomy.
//
// Maps a story's length/form category to its ordered manuscript stage list.
// Single source of truth for "which stages exist, in what order" -- this is
// the actual fix for the repetition problem the old Templater scaffolds had:
// storyScaffoldShort/Novelette/Novella/Serial.js were four near-duplicate
// files that differed only in this list. Now it's one data table.
//
// Manuscript itself doesn't import this -- it only knows its own stage and
// whatever priorStage it's given. This module is for the orchestration layer
// (Phase 2) that walks a story's full pipeline to create one Manuscript per
// stage, and for Story's dashboards, which need to know the complete stage
// list for a given length/form.

const NOVELLA_PIPELINE = [
	'shitty-first-draft',
	'1st-edit',
	'2nd-edit',
	'3rd-edit',
	'final',
];

const STAGE_PIPELINES = {
	'short-story': ['shitty-first-draft', '1st-edit', 'final'],
	'novelette': ['shitty-first-draft', '1st-edit', '2nd-edit', 'final'],
	'novella': NOVELLA_PIPELINE,
	'novel': NOVELLA_PIPELINE,
	'serial': ['serial-draft', 'reassembly', '1st-edit', '2nd-edit', '3rd-edit', 'final'],
};

// flash-fiction has no defined pipeline -- no old scaffold script ever
// covered it, and rather than guess at one, it's left undefined here.
// getStagePipeline() throws if it's requested until this is actually decided.

export function getStagePipeline(lengthForm) {
	const pipeline = STAGE_PIPELINES[lengthForm];
	if (!pipeline) {
		throw new Error(`No stage pipeline defined for length/form "${ lengthForm }".`);
	}
	return pipeline;
}

export function getStageIndex(lengthForm, stage) {
	const pipeline = getStagePipeline(lengthForm);
	const index = pipeline.indexOf(stage);
	if (index === -1) {
		throw new Error(`Stage "${ stage }" is not part of the "${ lengthForm }" pipeline.`);
	}
	return index;
}

export function getPriorStage(lengthForm, stage) {
	const index = getStageIndex(lengthForm, stage);
	return index === 0 ? null : getStagePipeline(lengthForm)[index - 1];
}