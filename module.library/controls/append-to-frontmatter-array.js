// .obsidian/apparatus/library/lib/controls/append-to-frontmatter-array.js
//
// Appends a value to a frontmatter array field on a note, skipping it
// if already present (string-diff against the field's current
// contents). Throws and logs on failure -- callers must not treat a
// failed append as safe to ignore.

import { Log } from '../../utils/logger.js';

/**
 * @param {import('obsidian').App} app
 * @param {import('obsidian').TFile} file
 * @param {string} key - frontmatter array key, e.g. "authors"
 * @param {string} value - value to append, e.g. "[[Jane A. Smith]]"
 */
export async function appendToFrontmatterArray(
	app,
	file,
	key,
	value
) {
	try {
		await app.fileManager.processFrontMatter(file, (frontmatter) => {
			const current = frontmatter[key] ?? [];
			if (!current.includes(value)) {
				frontmatter[key] = [...current, value];
			}
		});
	} catch (error) {
		Log.error(
			'append-to-frontmatter-array',
			`Failed to append "${ value }" to "${ key }" on ${ file.path }`,
			error
		);
		throw error;
	}
}