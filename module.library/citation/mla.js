// .obsidian/apparatus/library/citation/mla.js
//
// MLA (9th ed.) formatters, one exported function per supported Work
// leaf class: article, chapter, collection, entry, essay, interview,
// lecture, monograph, record, report, review, thesis. Pure functions:
// everything here operates on already-resolved author objects and
// plain fields, no Obsidian API dependency.

import {
	formatNameInverted,
	formatNameNormal,
	formatPageRange,
	joinNamesNormal
} from './name-format.js';

// Thesis degree descriptors as MLA prints them.
const DEGREE_LABELS_MLA = {
	Doctoral: 'PhD dissertation',
	"Master's": "master's thesis",
};

/**
 * MLA author-list rules:
 *   1 author  -> "Last, First"
 *   2 authors -> "Last, First, and First Last"
 *   3+        -> "Last, First, et al."
 * Expects `names` as resolved { prefix, first, last, suffix } objects.
 */
export function joinAuthorsMLA(names) {
	if (!names || names.length === 0) return '';
	if (names.length === 1) return formatNameInverted(names[0]);
	if (names.length === 2) {
		return `${ formatNameInverted(names[0]) }, and ${ formatNameNormal(names[1]) }`;
	}
	return `${ formatNameInverted(names[0]) }, et al.`;
}

/******************************************************************************
 * MLA FORMATTERS
 *****************************************************************************/

/**
 * Expects fields: { title, authors, year, periodical, volume, issue, pageRange }
 * `title` is sourced from the note's filename by the caller, not frontmatter.
 * `authors` must already be resolved; `periodical`/`volume`/`issue` are
 * resolved off the linked Collection note, not stored on Article itself.
 */
export function formatArticle(fields) {
	const {
        title,
        authors = [],
        year,
        periodical,
        volume,
        issue,
        pageRange
    } = fields;

	const authorSegment = joinAuthorsMLA(authors);
	const containerTitle = periodical ?? '';

	const volumeIssueSegment = [volume != null ? `vol. ${ volume }` : null, issue != null ? `no. ${ issue }` : null]
		.filter(Boolean)
		.join(', ');

	const tailSegments = [
		containerTitle,
		volumeIssueSegment,
		year,
		pageRange ? `pp. ${formatPageRange(pageRange)}` : null,
	].filter(Boolean).join(', ');

	return `${ authorSegment }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, editors, translators, year,
 * parentWork, edition, publisher, placeOfPublication, pageRange }
 * `parentWork` is a resolved title string, not the raw wikilink.
 */
export function formatChapter(fields) {
	const {
		title,
		authors = [],
		editors = [],
		translators = [],
		year,
		parentWork,
		edition,
		publisher,
		placeOfPublication,
		pageRange
	} = fields;

	const authorSegment = joinAuthorsMLA(authors);

	const tailSegments = [
		parentWork,
		editors.length > 0 ? `edited by ${ joinNamesNormal(editors) }` : null,
		translators.length > 0 ? `translated by ${ joinNamesNormal(translators) }` : null,
		edition ? `${ edition } ed.` : null,
		publisher,
		placeOfPublication,
		year,
		pageRange ? `pp. ${ formatPageRange(pageRange) }` : null,
	].filter(Boolean).join(', ');

	return `${ authorSegment }. "${ title }." ${ tailSegments }.`;
}

// Collection is cited as an authored/edited volume (formatEssay's
// shape) unless periodical is set. A periodical issue is not an
// independently citable unit in MLA -- only the article within it is
// -- so formatCollection returns nothing in that case.
export function formatCollection(fields) {
	if (fields.periodical) return '';
	return formatEssay(fields);
}

/**
 * Expects fields: { title, authors, editors, translators, year,
 * referenceWork, edition, publisher, placeOfPublication }
 * `title` here is the caller-supplied entry-term, not this.filename.
 * `referenceWork` is a resolved title string.
 */
export function formatEntry(fields) {
	const {
		title,
		authors = [],
		editors = [],
		translators = [],
		year,
		referenceWork,
		edition,
		publisher,
		placeOfPublication
	} = fields;

	const authorSegment = joinAuthorsMLA(authors);

	const tailSegments = [
		referenceWork,
		editors.length > 0 ? `edited by ${ joinNamesNormal(editors) }` : null,
		translators.length > 0 ? `translated by ${ joinNamesNormal(translators) }` : null,
		edition ? `${ edition } ed.` : null,
		publisher,
		placeOfPublication,
		year,
	].filter(Boolean).join(', ');

	return `${ authorSegment }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, editors, translators, year,
 * collections, edition, publisher, placeOfPublication }
 * No page-range/volume/issue.
 */
export function formatEssay(fields) {
	const {
		title,
		authors = [],
		editors = [],
		translators = [],
		year,
		collections = [],
		edition,
		publisher,
		placeOfPublication
	} = fields;

	const authorSegment = joinAuthorsMLA(authors);
	const containerTitle = collections[0] ?? '';

	const tailSegments = [
		containerTitle,
		editors.length > 0 ? `edited by ${ joinNamesNormal(editors) }` : null,
		translators.length > 0 ? `translated by ${ joinNamesNormal(translators) }` : null,
		edition ? `${ edition } ed.` : null,
		publisher,
		placeOfPublication,
		year,
	].filter(Boolean).join(', ');

	return `${ authorSegment }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, interviewee, interviewer, year, collections }
 * `interviewee` fills the author position; `interviewer` is credited
 * via a separate "interview by" clause.
 */
export function formatInterview(fields) {
	const {
		title,
		interviewee = [],
		interviewer = [],
		year,
		collections = []
	} = fields;

	const intervieweeSegment = joinAuthorsMLA(interviewee);
	const containerTitle = collections[0] ?? '';

	const tailSegments = [
		interviewer.length > 0 ? `interview by ${ joinNamesNormal(interviewer) }` : null,
		containerTitle,
		year,
	].filter(Boolean).join(', ');

	return `${ intervieweeSegment }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, event, deliveryDate, year }
 * `event` is a resolved title string when it was a wikilink, or the
 * plain text as stored otherwise. deliveryDate is preferred over year
 * when both are present.
 */
export function formatLecture(fields) {
	const {
		title,
		authors = [],
		event,
		deliveryDate,
		year
	} = fields;

	const authorSegment = joinAuthorsMLA(authors);

	const tailSegments = [
		event,
		deliveryDate || year,
	].filter(Boolean).join(', ');

	return `${ authorSegment }. "${ title }." ${ tailSegments }.`;
}

// Monograph's citation output is identical to Essay's -- isbn is
// metadata-only and never appears in the rendered citation.
export const formatMonograph = formatEssay;

/**
 * Expects fields: { title, authors, editors, translators, year,
 * collections, edition, publisher, placeOfPublication, format }
 * Identical to Essay's shape, with format inserted as a plain trailing
 * element (e.g. "CD", "digital file") -- duration is metadata-only and
 * never appears here.
 */
export function formatRecord(fields) {
	const {
		title,
		authors = [],
		editors = [],
		translators = [],
		year,
		collections = [],
		edition,
		publisher,
		placeOfPublication,
		format
	} = fields;

	const authorSegment = joinAuthorsMLA(authors);
	const containerTitle = collections[0] ?? '';

	const tailSegments = [
		containerTitle,
		editors.length > 0 ? `edited by ${ joinNamesNormal(editors) }` : null,
		translators.length > 0 ? `translated by ${ joinNamesNormal(translators) }` : null,
		edition ? `${ edition } ed.` : null,
		format,
		publisher,
		placeOfPublication,
		year,
	].filter(Boolean).join(', ');

	return `${ authorSegment }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, commissioningBody, year,
 * reportNumber, publisher, placeOfPublication }
 * `commissioningBody` is a resolved title string. When authors is
 * empty, commissioningBody fills the author position (corporate
 * authorship); otherwise it plays no further role in this style's
 * output beyond the author position it may have filled.
 */
export function formatReport(fields) {
	const {
		title,
		authors = [],
		commissioningBody,
		year,
		reportNumber,
		publisher,
		placeOfPublication
	} = fields;

	const authorSegment = authors.length > 0 ? joinAuthorsMLA(authors) : commissioningBody;

	const tailSegments = [
		reportNumber ? `Report No. ${ reportNumber }` : null,
		publisher,
		placeOfPublication,
		year,
	].filter(Boolean).join(', ');

	return `${ authorSegment }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, year, collections, subjectWork }
 * subjectWork is a resolved title string, rendered as its own
 * "Review of X" clause.
 */
export function formatReview(fields) {
	const {
		title,
		authors = [],
		year,
		collections = [],
		subjectWork
	} = fields;

	const authorSegment = joinAuthorsMLA(authors);
	const containerTitle = collections[0] ?? '';

	const tailSegments = [
		subjectWork ? `Review of ${ subjectWork }` : null,
		containerTitle,
		year,
	]
		.filter(Boolean)
		.join(', ');

	return `${ authorSegment }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, year, institution, degree }
 * "Author. "Title." Year, Institution, Degree." `degree` is mapped
 * through DEGREE_LABELS_MLA; `institution` is a resolved title string.
 * `advisor` is never passed to this formatter.
 */
export function formatThesis(fields) {
	const {
		title,
		authors = [],
		year,
		institution,
		degree
	} = fields;

	const authorSegment = joinAuthorsMLA(authors);
	const degreeLabel = DEGREE_LABELS_MLA[degree] ?? degree;

	const tailSegments = [
		year,
		institution,
		degreeLabel
	].filter(Boolean).join(', ');

	return `${ authorSegment }. "${ title }." ${ tailSegments }.`;
}