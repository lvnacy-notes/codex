// .obsidian/apparatus/library/citation/chicago.js
//
// Chicago (17th ed.) author-date formatters, one exported function per
// supported Work leaf class: article, chapter, collection, entry,
// essay, interview, lecture, monograph, record, report, review,
// thesis. Notes-bibliography is not implemented. Pure functions, same
// as mla.js/apa.js.

import {
    formatNameInverted,
    formatNameNormal,
    formatPageRange,
    joinNamesNormal
} from './name-format.js';

// Thesis degree descriptors as Chicago author-date prints them.
const DEGREE_LABELS_CHICAGO = {
	Doctoral: 'PhD diss.',
	"Master's": "master's thesis",
};

/**
 * Chicago author-date rules: first author inverted, remaining authors
 * in normal order, joined with "and". No et al. truncation for long
 * author lists. Expects `names` as resolved { prefix, first, last,
 * suffix } objects.
 */
export function joinAuthorsChicagoAuthorDate(names) {
	if (!names || names.length === 0) return '';

	const inverted = formatNameInverted(names[0]);
	if (names.length === 1) return inverted;

	const rest = names.slice(1).map(formatNameNormal);
	if (rest.length === 1) return `${ inverted }, and ${ rest[0] }`;
	return `${ inverted }, ${ rest.slice(0, -1).join(', ') }, and ${ rest[rest.length - 1] }`;
}

/******************************************************************************
 * CHICAGO MANUAL OF STYLE FORMATTERS
 *****************************************************************************/

/**
 * Expects fields: { title, authors, year, periodical, volume, issue, pageRange }
 * `authors` must already be resolved; `periodical`/`volume`/`issue` are
 * resolved off the linked Collection note, not stored on Article
 * itself.
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

	const authorSegment = joinAuthorsChicagoAuthorDate(authors);
	const containerTitle = periodical ?? '';

	const volumeIssueSegment = [volume != null ? String(volume) : null, issue != null ? `(${ issue })` : null]
		.filter(Boolean)
		.join(' ');

	const tail = [containerTitle, volumeIssueSegment].filter(Boolean).join(' ');
	const pages = pageRange ? formatPageRange(pageRange) : '';

	return `${ authorSegment }. ${ year }. "${ title }." ${ tail }: ${ pages }.`;
}

/**
 * Expects fields: { title, authors, editors, translators, year,
 * parentWork, edition, publisher, placeOfPublication, pageRange }
 * "In Parent Work, edited by Editor, pages. Place: Publisher."
 * `parentWork` is a resolved title string.
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

	const authorSegment = joinAuthorsChicagoAuthorDate(authors);

	const tailSegments = [
		parentWork ? `In ${ parentWork }` : null,
		editors.length > 0 ? `edited by ${ joinNamesNormal(editors) }` : null,
		translators.length > 0 ? `translated by ${ joinNamesNormal(translators) }` : null,
		edition ? `${ edition } ed.` : null,
		pageRange ? formatPageRange(pageRange) : null,
		placeOfPublication,
		publisher
	].filter(Boolean).join(', ');

	return `${ authorSegment }. ${ year }. "${ title }." ${ tailSegments }.`;
}

// Collection's citation output is identical to Essay's, unless
// periodical is set. A periodical issue is not an independently
// citable unit in Chicago author-date -- only the article within it is
// -- so formatCollection returns nothing in that case.
export function formatCollection(fields) {
	if (fields.periodical) return '';
	return formatEssay(fields);
}

/**
 * Expects fields: { title, authors, editors, translators, year,
 * referenceWork, edition, publisher, placeOfPublication }
 * "In Reference Work, edited by Editor." `title` here is the
 * caller-supplied entry-term, not this.filename. `referenceWork` is a
 * resolved title string.
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

	const authorSegment = joinAuthorsChicagoAuthorDate(authors);

	const tailSegments = [
		referenceWork ? `In ${ referenceWork }` : null,
		editors.length > 0 ? `edited by ${ joinNamesNormal(editors) }` : null,
		translators.length > 0 ? `translated by ${ joinNamesNormal(translators) }` : null,
		edition ? `${ edition } ed.` : null,
		placeOfPublication,
		publisher
	].filter(Boolean).join(', ');

	return `${ authorSegment }. ${ year }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, editors, translators, year,
 * collections, edition, publisher, placeOfPublication }
 * No page-range/volume/issue. Edition/editor/translator credits render
 * as trailing clauses after the container title, publisher and place
 * of publication last.
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

	const authorSegment = joinAuthorsChicagoAuthorDate(authors);
	const containerTitle = collections[0] ?? '';

	const tailSegments = [
		containerTitle,
		editors.length > 0 ? `edited by ${ joinNamesNormal(editors) }` : null,
		translators.length > 0 ? `translated by ${ joinNamesNormal(translators) }` : null,
		edition ? `${ edition } ed.` : null,
		placeOfPublication,
		publisher
	].filter(Boolean).join(', ');

	return `${ authorSegment }. ${ year }. "${ title }." ${ tailSegments }.`;
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

	const authorSegment = joinAuthorsChicagoAuthorDate(interviewee);
	const containerTitle = collections[0] ?? '';

	const tailSegments = [
		interviewer.length > 0 ? `interview by ${ joinNamesNormal(interviewer) }` : null,
		containerTitle
	].filter(Boolean).join(', ');

	return `${ authorSegment }. ${ year }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, event, deliveryDate, year }
 * "lecture presented at Event." deliveryDate is preferred over year
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

	const authorSegment = joinAuthorsChicagoAuthorDate(authors);
	const dateSegment = deliveryDate || year;

	const tailSegments = [
		event ? `lecture presented at ${ event }` : null,
	].filter(Boolean).join(', ');

	return `${ authorSegment }. ${ dateSegment }. "${ title }." ${ tailSegments }.`;
}

// Monograph's citation output is identical to Essay's -- isbn is
// metadata-only and never appears in the rendered citation.
export const formatMonograph = formatEssay;

/**
 * Expects fields: { title, authors, editors, translators, year,
 * collections, edition, publisher, placeOfPublication, format }
 * Identical to Essay's shape, with format inserted as a plain
 * descriptive element after edition. Duration is metadata-only and
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

	const authorSegment = joinAuthorsChicagoAuthorDate(authors);
	const containerTitle = collections[0] ?? '';

	const tailSegments = [
		containerTitle,
		editors.length > 0 ? `edited by ${ joinNamesNormal(editors) }` : null,
		translators.length > 0 ? `translated by ${ joinNamesNormal(translators) }` : null,
		edition ? `${ edition } ed.` : null,
		format,
		placeOfPublication,
		publisher
	].filter(Boolean).join(', ');

	return `${ authorSegment }. ${ year }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, commissioningBody, year,
 * reportNumber, publisher, placeOfPublication }
 * `commissioningBody` is a resolved title string. When authors is
 * empty, commissioningBody fills the author position (corporate
 * authorship).
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

	const authorSegment = authors.length > 0 ? joinAuthorsChicagoAuthorDate(authors) : commissioningBody;

	const tailSegments = [
		reportNumber ? `Report No. ${ reportNumber }` : null,
		placeOfPublication,
		publisher
	].filter(Boolean).join(', ');

	return `${ authorSegment }. ${ year }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, year, collections, subjectWork }
 * "review of subject-work." `subjectWork` is a resolved title string.
 */
export function formatReview(fields) {
	const {
		title,
		authors = [],
		year,
		collections = [],
		subjectWork
	} = fields;

	const authorSegment = joinAuthorsChicagoAuthorDate(authors);
	const containerTitle = collections[0] ?? '';

	const tailSegments = [
		subjectWork ? `review of ${ subjectWork }` : null,
		containerTitle
	].filter(Boolean).join(', ');

	return `${ authorSegment }. ${ year }. "${ title }." ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, year, institution, degree }
 * "Author. Year. "Title." Degree, Institution." `degree` is mapped
 * through DEGREE_LABELS_CHICAGO; `institution` is a resolved title
 * string. `advisor` is never passed to this formatter.
 */
export function formatThesis(fields) {
	const {
		title,
		authors = [],
		year,
		institution,
		degree
	} = fields;

	const authorSegment = joinAuthorsChicagoAuthorDate(authors);
	const degreeLabel = DEGREE_LABELS_CHICAGO[degree] ?? degree;

	const tailSegments = [degreeLabel, institution].filter(Boolean).join(', ');

	return `${ authorSegment }. ${ year }. "${ title }." ${ tailSegments }.`;
}