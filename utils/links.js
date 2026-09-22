// .obsidian/apparatus/utils/links.js
//
// Shared by resolve-authors.js and resolve-publications.js -- both need
// to strip wikilink brackets and drop a piped display segment before
// looking the link up in the vault. Pulled out once a second resolver
// needed the same logic, rather than duplicating it a second time.

export function linkTarget(raw) {
	const stripped = raw.replace(/^\[\[|\]\]$/g, '');
	return stripped.includes('|') ? stripped.split('|')[0] : stripped;
}