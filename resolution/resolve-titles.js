import { resolveNoteFile, resolveNoteFileLenient } from './resolve-note-file.js';

/**
 * Formats a bare note title as a wikilink.
 * @param {string} basename
 * @returns {string}
 */
export function toWikilink(basename) {
	return `[[${basename}]]`;
}

/**
 * Returns the title (basename) of the note a wikilink points at.
 * @param {import('obsidian').App} app
 * @param {string} sourcePath Path of the note containing the link.
 * @param {string} rawWikilink Wikilink text, including brackets.
 * @returns {string}
 * @throws {Error} When the link does not resolve to a note.
 */
export function resolveNoteTitle(
	app,
	sourcePath,
	rawWikilink
) {
	return resolveNoteFile(
		app,
		sourcePath,
		rawWikilink
	).basename;
}

/**
 * Resolves an array of wikilinks to their titles.
 * @param {import('obsidian').App} app
 * @param {string} sourcePath Path of the note containing the link.
 * @param {string[]} [rawWikilinks] Wikilinks to resolve. Treated as empty when missing.
 * @returns {string[]}
 * @throws {Error} When any link does not resolve to a note.
 */
export function resolveNoteTitles(
	app,
	sourcePath,
	rawWikilinks
) {
	return (rawWikilinks ?? []).map((raw) => resolveNoteTitle(
		app,
		sourcePath,
		raw
	));
}

/**
 * Resolves a field that holds either a wikilink or plain text. Only a bracketed value is resolved. Any other value, including an empty one, is returned unchanged.
 * @param {import('obsidian').App} app
 * @param {string} sourcePath Path of the note containing the link.
 * @param {string} raw Wikilink or plain text.
 * @returns {string}
 * @throws {Error} When a bracketed value does not resolve to a note.
 */
export function resolveOptionalNoteTitle(
	app,
	sourcePath,
	raw
) {
	if (!raw) return raw;
	const isWikilink = raw.startsWith('[[') && raw.endsWith(']]');
	if (!isWikilink) return raw;
	return resolveNoteTitle(app, sourcePath, raw);
}

/**
 * Returns a normalized wikilink to the note a wikilink points at, or the raw text unchanged when it does not resolve. Never throws.
 * @param {import('obsidian').App} app
 * @param {string} sourcePath Path of the note containing the link.
 * @param {string} rawWikilink Wikilink text, including brackets.
 * @returns {string}
 */
export function resolveNoteLinkLenient(
	app,
	sourcePath,
	rawWikilink
) {
	if (!rawWikilink) return rawWikilink;
	const file = resolveNoteFileLenient(
		app,
		sourcePath,
		rawWikilink
	);
	return file ? toWikilink(file.basename) : rawWikilink;
}

/**
 * Resolves an array of wikilinks to normalized wikilinks, leaving unresolved entries unchanged. Never throws.
 * @param {import('obsidian').App} app
 * @param {string} sourcePath Path of the note containing the link.
 * @param {string[]} [rawWikilinks] Wikilinks to resolve. Treated as empty when missing.
 * @returns {string[]}
 */
export function resolveNoteLinksLenient(
	app,
	sourcePath,
	rawWikilinks
) {
	return (rawWikilinks ?? []).map((raw) => resolveNoteLinkLenient(
		app,
		sourcePath,
		raw
	));
}