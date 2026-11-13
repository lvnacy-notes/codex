/**
 * @file Stage pipeline definitions: maps a story's length/form to its ordered manuscript stages.
 */

/**
 * Stage list shared by `novella` and `novel`.
 * @type {string[]}
 */
const NOVELLA_PIPELINE = [
	'shitty-first-draft',
	'1st-edit',
	'2nd-edit',
	'3rd-edit',
	'final',
];

/**
 * Ordered stage list for each length/form.
 * @type {Object<string, string[]>}
 */
const STAGE_PIPELINES = {
	'short-story': ['shitty-first-draft', '1st-edit', 'final'],
	'novelette': ['shitty-first-draft', '1st-edit', '2nd-edit', 'final'],
	'novella': NOVELLA_PIPELINE,
	'novel': NOVELLA_PIPELINE,
	'serial': ['serial-draft', 'reassembly', '1st-edit', '2nd-edit', '3rd-edit', 'final'],
};

/**
 * Returns the ordered stage list for a length/form.
 * @param {string} lengthForm
 * @returns {string[]}
 * @throws {Error} When no pipeline is defined for `lengthForm`.
 */
export function getStagePipeline(lengthForm) {
	const pipeline = STAGE_PIPELINES[lengthForm];
	if (!pipeline) {
		throw new Error(`No stage pipeline defined for length/form "${ lengthForm }".`);
	}
	return pipeline;
}

/**
 * Returns the zero-based position of a stage in a length/form's pipeline.
 * @param {string} lengthForm
 * @param {string} stage
 * @returns {number}
 * @throws {Error} When `lengthForm` has no pipeline or `stage` is not in it.
 */
export function getStageIndex(lengthForm, stage) {
	const pipeline = getStagePipeline(lengthForm);
	const index = pipeline.indexOf(stage);
	if (index === -1) {
		throw new Error(`Stage "${ stage }" is not part of the "${ lengthForm }" pipeline.`);
	}
	return index;
}

/**
 * Returns the stage before `stage` in the pipeline, or `null` for the first stage.
 * @param {string} lengthForm
 * @param {string} stage
 * @returns {string|null}
 * @throws {Error} When `lengthForm` has no pipeline or `stage` is not in it.
 */
export function getPriorStage(lengthForm, stage) {
	const index = getStageIndex(lengthForm, stage);
	return index === 0 ? null : getStagePipeline(lengthForm)[index - 1];
}