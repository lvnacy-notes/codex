import { Scene } from '../objects/Scene.js';

/**
 * Filename suffixes identifying each kind of scene template.
 * @readonly
 * @enum {string}
 */
export const SCENE_TEMPLATE_SUFFIXES = {
	SERIAL: 'scene-serial',
	REASSEMBLY: 'scene-reassembly',
	EDITORIAL: 'scene-editorial',
};

/**
 * Returns the scene-template suffix for a manuscript stage.
 * @param {string} stage Manuscript stage name.
 * @returns {string} A value from SCENE_TEMPLATE_SUFFIXES.
 */
export function sceneTemplateSuffixForStage(stage) {
	if (stage === Scene.SERIAL_STAGE) {
		return SCENE_TEMPLATE_SUFFIXES.SERIAL;
	}
	if (stage === 'reassembly') {
		return SCENE_TEMPLATE_SUFFIXES.REASSEMBLY;
	}
	return SCENE_TEMPLATE_SUFFIXES.EDITORIAL;
}