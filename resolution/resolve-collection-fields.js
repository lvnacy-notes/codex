import { resolveNoteFile } from './resolve-note-file.js';
import { resolveNoteTitle } from './resolve-titles.js';

/**
 * Resolves a Collection note wikilink to the `periodical`, `volume`, and `issue` fields its citation depends on. `periodical` is the note's `periodical` link resolved to a title. Missing fields are `''`.
 * @param {import('obsidian').App} app
 * @param {string} sourcePath Path of the note containing the link.
 * @param {string} rawWikilink Wikilink text, including brackets.
 * @returns {{ periodical: string, volume: string, issue: string }}
 * @throws {Error} When the link, or the note's `periodical` link, does not resolve to a note.
 */
export function resolveCollectionFields(
	app,
	sourcePath,
	rawWikilink
) {
	const file = resolveNoteFile(
		app,
		sourcePath,
		rawWikilink
	);
	const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
	const periodicalLink = frontmatter['periodical'];

	return {
		periodical: periodicalLink
			? resolveNoteTitle(app, file.path, periodicalLink)
			: '',
		volume: frontmatter['volume'] ?? '',
		issue: frontmatter['issue'] ?? '',
	};
}