// .obsidian/apparatus/library/lib/controls/resolve-authors.js
//
// Resolves author/editor/translator wikilinks against their own Author
// notes and reads prefix/first-name/last-name/suffix off that note's
// frontmatter.

import { resolveNoteFile } from './resolve-note-file.js';

/**
 * @param { import('obsidian').App } app
 * @param { string } sourcePath - path of the Work note containing the link
 * @param { string } rawWikilink - e.g. "[[Jane A. Smith]]"
 * @returns {{ prefix: string, first: string, last: string, suffix: string }}
 */
export function resolveAuthor(
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
	return {
		prefix: frontmatter['prefix'] ?? '',
		first: frontmatter['first-name'] ?? '',
		last: frontmatter['last-name'] ?? '',
		suffix: frontmatter['suffix'] ?? '',
	};
}

/** Resolves an array of author/editor/translator wikilinks in one call. */
export function resolveAuthors(
	app,
	sourcePath,
	rawWikilinks
) {
	return (rawWikilinks ?? []).map((raw) => resolveAuthor(
		app,
		sourcePath,
		raw
	));
}