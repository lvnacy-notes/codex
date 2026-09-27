// .obsidian/apparatus/library/lib/controls/resolve-collection-fields.js
//
// Resolves a wikilink pointing at a Collection note to the periodical/
// volume/issue fields another Work leaf needs from it at citation
// time. Used by any leaf whose citation depends on the periodical
// issue it belongs to, rather than the Collection note's own title.

import { resolveNoteFile } from './resolve-note-file.js';
import { resolveNoteTitle } from './resolve-titles.js';

/**
 * @param {import('obsidian').App} app
 * @param {string} sourcePath - path of the note containing the link
 * @param {string} rawWikilink - e.g. "[[Weird Tales Vol 5 No 3]]"
 * @returns {{ periodical: string, volume: string, issue: string }}
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