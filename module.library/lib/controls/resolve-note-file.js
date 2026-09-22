// .obsidian/apparatus/library/lib/controls/resolve-note-file.js
//
// Resolves a wikilink to the TFile it points at. The shared core used
// by every resolve-*.js module in this directory, and by any caller
// (e.g. a postCreate cascade) that needs the note itself rather than a
// specific field pulled off of it.
//
// Throws on an unresolvable link, routed through Log.error first so
// the failure surfaces as a visible Notice.

import { linkTarget } from '../../../utils/links.js';
import { Log } from '../../../utils/logger.js';

/**
 * Resolves a wikilink to its TFile, or null if it doesn't resolve.
 * Never throws -- callers that need throw-on-failure behavior should
 * use resolveNoteFile() instead.
 *
 * @param {import('obsidian').App} app
 * @param {string} sourcePath - path of the note containing the link
 * @param {string} rawWikilink - e.g. "[[Jane A. Smith]]"
 * @returns {import('obsidian').TFile | null}
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
 * @param {import('obsidian').App} app
 * @param {string} sourcePath - path of the note containing the link
 * @param {string} rawWikilink - e.g. "[[Jane A. Smith]]"
 * @returns {import('obsidian').TFile}
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
		const error = new Error(`Link did not resolve to a note: ${ rawWikilink }`);
		Log.error(
			'resolve-note-file',
			error.message,
			error
		);
		throw error;
	}
	return file;
}