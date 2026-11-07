/**
 * Scopes the bibliography to a library alone -- every work carrying both
 * this library's own tag and the shared catalog-works tag.
 */
export function buildBibliographyBase(libraryTag) {
	return [
		'filters:',
		'  and:',
		`    - file.hasTag("${ libraryTag }")`,
		'    - file.hasTag("catalog-works")',
		'views:',
		'  - type: table',
		'    name: Bibliography',
		'    order:',
		'      - file.name',
		'      - authors',
		'      - year',
		'      - citation',
		'',
	].join('\n');
}