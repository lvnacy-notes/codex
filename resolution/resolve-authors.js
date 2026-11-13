import { resolveNoteFile } from './resolve-note-file.js';

/**
 * Resolves an author, editor, or translator wikilink and reads `prefix`, `first-name`, `last-name`, and `suffix` from the linked note's frontmatter. Missing fields are `''`.
 * @param {import('obsidian').App} app
 * @param {string} sourcePath Path of the note containing the link.
 * @param {string} rawWikilink Wikilink text, including brackets.
 * @returns {{ prefix: string, first: string, last: string, suffix: string }}
 * @throws {Error} When the link does not resolve to a note.
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

/**
 * Resolves an array of author wikilinks.
 * @param {import('obsidian').App} app
 * @param {string} sourcePath Path of the note containing the link.
 * @param {string[]} [rawWikilinks] Wikilinks to resolve. Treated as empty when missing.
 * @returns {Array<{ prefix: string, first: string, last: string, suffix: string }>}
 * @throws {Error} When any link does not resolve to a note.
 */
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