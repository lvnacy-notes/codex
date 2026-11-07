/**
 * Builds the companion Glossary .base file's content -- scopes the table to
 * this library's own tag plus class == "definition", excluding the
 * Glossary note itself (class: glossary, not definition). Exported
 * standalone so every command that needs to create or backfill this file
 * (library-create-library.js, library-create-glossary.js) shares one
 * implementation rather than maintaining separate copies.
 */
export function buildGlossaryBaseContent(libraryTag) {
	return [
		'filters:',
		'  and:',
		`    - file.hasTag("${ libraryTag }")`,
		'    - \'class == "definition"\'',
		'views:',
		'  - type: table',
		'    name: Glossary',
		'    order:',
		'      - file.name',
		'      - category',
		'      - short-definition',
		'',
	].join('\n');
}