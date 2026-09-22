// .obsidian/apparatus/library/citation/name-format.js
//
// Pure formatting helpers -- no Obsidian API, no note resolution.
// Everything here operates on already-resolved data: { prefix, first,
// last, suffix } author objects and resolved publication titles.

/** "Last, F. M.[, Suffix]" -- APA-style single-author formatting. */
export function formatNameAPA({
    first,
    last,
    suffix
}) {
	const init = initials(first);
	const base = init ? `${ last }, ${ init }` : last;
	return suffix ? `${ base }, ${ suffix }` : base;
}

/**
 * "Last, First Middle[, Suffix]" -- used for the first author in
 * inverted-name styles. `prefix` is never included -- standard
 * citation convention omits courtesy titles (Dr., Ms.).
 */
export function formatNameInverted({
    first,
    last,
    suffix
}) {
	const base = first ? `${ last }, ${ first }` : last;
	return suffix ? `${ base }, ${ suffix }` : base;
}

/** "First Middle Last[, Suffix]" -- used for subsequent authors in most styles. */
export function formatNameNormal({
    first,
    last,
    suffix
}) {
	const base = first ? `${ first } ${ last }` : last;
	return suffix ? `${ base }, ${ suffix }` : base;
}

/**
 * Normalizes a stored page range to use an en dash, regardless of
 * whether it was typed with one hyphen or two ("112-134" or
 * "112--134" both become "112–134").
 */
export function formatPageRange(raw) {
	if (!raw) return raw;
	return raw.replace(/\s*-{1,2}\s*/g, '–');
}

/** "Jane Middle" -> "J. M." -- APA-style initials. */
export function initials(firstMiddle) {
	if (!firstMiddle) return '';
	return firstMiddle
		.split(/\s+/)
		.map((part) => `${part[0].toUpperCase()}.`)
		.join(' ');
}

/**
 * "First Last, First Last, and First Last" -- plain (non-inverted)
 * name-list join for contributor credits that aren't the primary
 * authors (editors, translators).
 */
export function joinNamesNormal(names) {
	if (!names || names.length === 0) return '';
	const formatted = names.map(formatNameNormal);
	if (formatted.length === 1) return formatted[0];
	if (formatted.length === 2) return `${ formatted[0] } and ${ formatted[1] }`;
	return `${ formatted.slice(0, -1).join(', ') }, and ${ formatted[formatted.length - 1] }`;
}