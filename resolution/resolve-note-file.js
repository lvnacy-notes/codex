import { linkTarget } from '../utils/links.js';

/**
 * Resolves a wikilink to its note. Returns `null` when the link is empty or does not resolve. Never throws.
 * @param {import('obsidian').App} app
 * @param {string} sourcePath Path of the note containing the link.
 * @param {string} rawWikilink Wikilink text, including brackets.
 * @returns {import('obsidian').TFile|null}
 */
export function resolveNoteFileLenient(
	app,
	sourcePath,
	rawWikilink
) {
	if (!rawWikilink) return null;
	const target = linkTarget(rawWikilink);
	return app.metadataCache.getFirstLinkpathDest(target, sourcePath);
}

/**
 * Resolves a wikilink to its note.
 * @param {import('obsidian').App} app
 * @param {string} sourcePath Path of the note containing the link.
 * @param {string} rawWikilink Wikilink text, including brackets.
 * @returns {import('obsidian').TFile}
 * @throws {Error} When the link does not resolve to a note.
 */
export function resolveNoteFile(
	app,
	sourcePath,
	rawWikilink
) {
	const file = resolveNoteFileLenient(
		app,
		sourcePath,
		rawWikilink
	);
	if (!file) {
		throw new Error(`Link did not resolve to a note: ${ rawWikilink }`);
	}
	return file;
}