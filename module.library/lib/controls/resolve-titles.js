// .obsidian/apparatus/library/lib/controls/resolve-titles.js
//
// Resolves a wikilink pointing at another note to that note's title, or
// to a normalized wikilink pointing at it. Class-agnostic -- used for
// Work-to-Work references (parent-work, subject-work, etc.), Periodical
// references, and any other note-to-note link, since resolution itself
// never depends on what class the linked note is.
//
// Built on the shared file lookup in resolve-note-file.js -- this
// module only extracts or formats a title/link from the resolved
// TFile.

import { resolveNoteFile, resolveNoteFileLenient } from './resolve-note-file.js';

/** Formats a bare note title as a normalized wikilink. */
export function toWikilink(basename) {
	return `[[${basename}]]`;
}

/**
 * @param {import('obsidian').App} app
 * @param {string} sourcePath - path of the note containing the link
 * @param {string} rawWikilink - e.g. "[[The Great Anthology]]"
 * @returns {string} the linked note's title (its filename/basename)
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

/** Resolves an array of wikilinks to their titles in one call. */
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
 * Resolves a field that may be either a wikilink or a plain text
 * string. Only attempts resolution when the value is bracketed; a bare
 * string passes through unchanged instead of being treated as an
 * unresolvable link.
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
 * Resolves a wikilink to a normalized wikilink pointing at the same
 * note, tolerating an unresolvable target instead of throwing: returns
 * the raw wikilink text unchanged. Does not route through Log.error()
 * -- an unresolved link here is an expected, tolerated condition (a
 * not-yet-cataloged or since-renamed cross-reference), not a failure
 * worth surfacing as a Notice.
 *
 * @param {import('obsidian').App} app
 * @param {string} sourcePath - path of the note containing the link
 * @param {string} rawWikilink - e.g. "[[The Great Anthology]]"
 * @returns {string} a normalized wikilink, or the raw wikilink text if unresolved
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

/** Resolves an array of wikilinks to normalized links leniently, in one call. */
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