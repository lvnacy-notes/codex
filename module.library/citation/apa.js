// .obsidian/apparatus/library/citation/apa.js
//
// APA (7th ed.) formatters, one exported function per supported Work
// leaf class: article, chapter, collection, entry, essay, interview,
// lecture, monograph, record, report, review, thesis. Pure functions,
// same as mla.js.

import {
	formatNameAPA,
	formatPageRange,
	joinNamesNormal
} from './name-format.js';

// Thesis degree descriptors as APA prints them, bracketed after the title.
const DEGREE_LABELS_APA = {
	Doctoral: 'Doctoral dissertation',
	"Master's": "Master's thesis",
};

/**
 * APA author-list rules (up to 20 authors — 21+ truncation not
 * implemented):
 *   1 author  -> "Last, F."
 *   2 authors -> "Last, F., & Last, F."
 *   3+        -> "Last, F., Last, F., & Last, F."
 * Expects `names` as resolved { prefix, first, last, suffix } objects.
 */
export function joinAuthorsAPA(names) {
	if (!names || names.length === 0) return '';
	const formatted = names.map(formatNameAPA);
	if (formatted.length === 1) return formatted[0];
	if (formatted.length === 2) return `${ formatted[0] }, & ${ formatted[1] }`;
	return `${ formatted.slice(0, -1).join(', ') }, & ${ formatted[formatted.length - 1] }`;
}

/******************************************************************************
 * APA FORMATTERS
 *****************************************************************************/

/**
 * Expects fields: { title, authors, year, periodical, volume, issue, pageRange }
 * APA's sentence-case title rule is NOT applied here — `title` is used
 * as stored, to avoid auto-lowercasing mangling proper nouns.
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

	const authorSegment = joinAuthorsAPA(authors);
	const containerTitle = periodical ?? '';

	const volumeIssueSegment = [volume != null ? String(volume) : null, issue != null ? `(${ issue })` : null]
		.filter(Boolean)
		.join('');

	const tailSegments = [
        containerTitle,
        volumeIssueSegment,
        pageRange ? formatPageRange(pageRange) : null
    ].filter(Boolean).join(', ');

	return `${ authorSegment } (${ year }). ${ title }. ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, editors, translators, year,
 * parentWork, edition, publisher, pageRange }
 * "In Editor (Ed.), Parent Work (edition) (pp. x-x)." `parentWork` is
 * a resolved title string.
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
		pageRange
	} = fields;

	const authorSegment = joinAuthorsAPA(authors);

	const editionSegment = edition ? ` (${ edition } ed.)` : '';
	const pagesSegment = pageRange ? ` (pp. ${ formatPageRange(pageRange) })` : '';
	const inClause = parentWork
		? `In ${ editors.length > 0 ? `${ joinNamesNormal(editors) } (Ed.), ` : '' }${ parentWork }${ editionSegment }${ pagesSegment }`
		: null;
	const translatorClause = translators.length > 0 ? `Translated by ${ joinNamesNormal(translators) }` : null;

	const tailSegments = [
		inClause,
		translatorClause,
		publisher
	].filter(Boolean).join('. ');

	return `${ authorSegment } (${ year }). ${ title }. ${ tailSegments }.`;
}

// contained-works does not feed into a Collection's own citation --
// same reasoning as mla.js's. A periodical issue is not an
// independently citable unit in APA -- only the article within it is
// -- so formatCollection returns nothing when periodical is set.
export function formatCollection(fields) {
	if (fields.periodical) return '';
	return formatEssay(fields);
}

/**
 * Expects fields: { title, authors, editors, translators, year,
 * referenceWork, edition, publisher }
 * "In Editor (Ed.), Reference Work (edition)." `title` here is the
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
		publisher
	} = fields;

	const authorSegment = joinAuthorsAPA(authors);

	const editionSegment = edition ? ` (${ edition } ed.)` : '';
	const inClause = referenceWork
		? `In ${ editors.length > 0 ? `${ joinNamesNormal(editors) } (Ed.), ` : '' }${ referenceWork }${ editionSegment }`
		: null;
	const translatorClause = translators.length > 0 ? `Translated by ${ joinNamesNormal(translators) }` : null;

	const tailSegments = [inClause, translatorClause, publisher].filter(Boolean).join('. ');

	return `${ authorSegment } (${ year }). ${ title }. ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, editors, translators, year,
 * collections, edition, publisher, placeOfPublication }
 * No page-range/volume/issue. An editor credit renders as "In X (Ed.),
 * Container (edition)." when present; translator credit is appended
 * as its own clause.
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
		publisher
	} = fields;

	const authorSegment = joinAuthorsAPA(authors);
	const containerTitle = collections[0] ?? '';

	const editionSegment = edition ? ` (${ edition } ed.)` : '';
	const inClause = containerTitle
		? `In ${ editors.length > 0 ? `${ joinNamesNormal(editors) } (Ed.), ` : '' }${ containerTitle }${ editionSegment }`
		: null;
	const translatorClause = translators.length > 0 ? `Translated by ${ joinNamesNormal(translators) }` : null;

	const tailSegments = [inClause, translatorClause, publisher].filter(Boolean).join('. ');

	return `${ authorSegment } (${ year }). ${ title }. ${ tailSegments }.`;
}

/**
 * Expects fields: { title, interviewee, interviewer, year, collections }
 * `interviewee` fills the author position; `interviewer` is credited
 * via a separate "Interview by" clause.
 */
export function formatInterview(fields) {
	const {
		title,
		interviewee = [],
		interviewer = [],
		year,
		collections = []
	} = fields;

	const authorSegment = joinAuthorsAPA(interviewee);
	const containerTitle = collections[0] ?? '';
	const interviewerClause = interviewer.length > 0 ? `Interview by ${ joinNamesNormal(interviewer) }` : null;

	const tailSegments = [interviewerClause, containerTitle].filter(Boolean).join('. ');

	return `${ authorSegment } (${ year }). ${ title }. ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, event, deliveryDate, year }
 * "Author. (Delivery date). Title. Event." deliveryDate is preferred
 * over year when both are present.
 */
export function formatLecture(fields) {
	const {
		title,
		authors = [],
		event,
		deliveryDate,
		year
	} = fields;

	const authorSegment = joinAuthorsAPA(authors);
	const dateSegment = deliveryDate || year;

	const tailSegments = [event].filter(Boolean).join('. ');

	return `${ authorSegment } (${ dateSegment }). ${ title }${ tailSegments ? `. ${ tailSegments }` : '' }.`;
}

// Monograph's citation output is identical to Essay's -- isbn is
// metadata-only and never appears in the rendered citation.
export const formatMonograph = formatEssay;

/**
 * Expects fields: { title, authors, editors, translators, year,
 * collections, edition, publisher, format }
 * APA requires a bracketed content-type descriptor for recorded media
 * -- format renders as "[format]" immediately after the title.
 * Duration is metadata-only and never appears here.
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
		format
	} = fields;

	const authorSegment = joinAuthorsAPA(authors);
	const containerTitle = collections[0] ?? '';
	const formatSegment = format ? ` [${ format }]` : '';

	const editionSegment = edition ? ` (${ edition } ed.)` : '';
	const inClause = containerTitle
		? `In ${ editors.length > 0 ? `${ joinNamesNormal(editors) } (Ed.), ` : '' }${ containerTitle }${ editionSegment }`
		: null;
	const translatorClause = translators.length > 0 ? `Translated by ${ joinNamesNormal(translators) }` : null;

	const tailSegments = [inClause, translatorClause, publisher].filter(Boolean).join('. ');

	return `${ authorSegment } (${ year }). ${ title }${ formatSegment }. ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, commissioningBody, year,
 * reportNumber, publisher, placeOfPublication }
 * `commissioningBody` is a resolved title string. When authors is
 * empty, commissioningBody fills the author position (corporate
 * authorship). Per APA's rule against repeating the author as
 * publisher, publisher is omitted from the tail when it matches
 * commissioningBody.
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

	const authorSegment = authors.length > 0 ? joinAuthorsAPA(authors) : commissioningBody;
	const reportNumberSegment = reportNumber ? ` (Report No. ${ reportNumber })` : '';
	const publisherSegment = publisher && publisher !== commissioningBody ? publisher : null;

	const tailSegments = [placeOfPublication, publisherSegment].filter(Boolean).join(': ');

	return `${ authorSegment } (${ year }). ${ title }${ reportNumberSegment }. ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, year, collections, subjectWork }
 * "[Review of subject-work]." `subjectWork` is a resolved title string.
 */
export function formatReview(fields) {
	const {
		title,
		authors = [],
		year,
		collections = [],
		subjectWork
	} = fields;

	const authorSegment = joinAuthorsAPA(authors);
	const containerTitle = collections[0] ?? '';

	const reviewClause = subjectWork ? `[Review of ${ subjectWork }]` : null;

	const tailSegments = [reviewClause, containerTitle].filter(Boolean).join('. ');

	return `${ authorSegment } (${ year }). ${ title }. ${ tailSegments }.`;
}

/**
 * Expects fields: { title, authors, year, institution, degree }
 * "Author. (Year). Title (Degree). Institution." `degree` is mapped
 * through DEGREE_LABELS_APA; `institution` is a resolved title string.
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

	const authorSegment = joinAuthorsAPA(authors);
	const degreeLabel = DEGREE_LABELS_APA[degree] ?? degree;
	const degreeSegment = degreeLabel ? ` (${ degreeLabel })` : '';

	return `${ authorSegment } (${ year }). ${ title }${ degreeSegment }. ${ institution ?? '' }.`;
}