// .obsidian/apparatus/library/citation/citation-engine.js
//
// The engine's entry point. Two jobs, kept in separate files:
//   1. "Grab" -- resolve author/editor/translator/interviewer/interviewee
//      wikilinks against their own Author notes (resolve-authors.js),
//      collections/Works-reference/Periodical wikilinks against the
//      linked note's own title (resolve-titles.js), and -- for Article
//      -- the periodical/volume/issue fields carried on its linked
//      Collection note (resolve-collection-fields.js). These are the
//      only files in the citation module that touch the Obsidian API.
//   2. "Parse" (format) -- hand resolved, structured data to the right
//      per-style, per-leaf formatter (mla.js/apa.js/chicago.js). Those
//      stay pure functions with no Obsidian dependency.
//
// Called from the Works/Collection modal at note-creation time, not from
// a Dataview view.
//
// Adding a leaf class means adding one function per style module, then
// registering it in FORMATTERS below -- no changes to this dispatcher
// itself.
//
// All failure cases below go through Log.error before throwing.

import * as mla from './mla.js';
import * as apa from './apa.js';
import * as chicago from './chicago.js';
import { resolveAuthors } from '../lib/controls/resolve-authors.js';
import { resolveNoteTitle, resolveNoteTitles } from '../lib/controls/resolve-titles.js';
import { resolveCollectionFields } from '../lib/controls/resolve-collection-fields.js';
import { resolveLibraryNote } from '../lib/controls/resolve-library.js';
import { Log } from '../../utils/logger.js';

export const FORMATTERS = {
	mla: {
		article: mla.formatArticle,
		chapter: mla.formatChapter,
		collection: mla.formatCollection,
		entry: mla.formatEntry,
		essay: mla.formatEssay,
		interview: mla.formatInterview,
		lecture: mla.formatLecture,
		monograph: mla.formatMonograph,
		record: mla.formatRecord,
		report: mla.formatReport,
		review: mla.formatReview,
		thesis: mla.formatThesis,
	},
	apa: {
		article: apa.formatArticle,
		chapter: apa.formatChapter,
		collection: apa.formatCollection,
		entry: apa.formatEntry,
		essay: apa.formatEssay,
		interview: apa.formatInterview,
		lecture: apa.formatLecture,
		monograph: apa.formatMonograph,
		record: apa.formatRecord,
		report: apa.formatReport,
		review: apa.formatReview,
		thesis: apa.formatThesis,
	},
	'chicago-author-date': {
		article: chicago.formatArticle,
		chapter: chicago.formatChapter,
		collection: chicago.formatCollection,
		entry: chicago.formatEntry,
		essay: chicago.formatEssay,
		interview: chicago.formatInterview,
		lecture: chicago.formatLecture,
		monograph: chicago.formatMonograph,
		record: chicago.formatRecord,
		report: chicago.formatReport,
		review: chicago.formatReview,
		thesis: chicago.formatThesis,
	},
};

/**
 * Computes a citation for any citable note: resolves the governing
 * style from the parent Library note, then hands off to
 * generateCitation(). Callers invoke this after their own
 * citation-relevant fields are assigned, since `fields` is
 * caller-specific.
 *
 * @param {import('obsidian').App} app
 * @param {string} path - path of the note being created (for link resolution)
 * @param {string} folder - the note's own folder, used to locate the enclosing Library note
 * @param {string} classValue - lowercase class value, e.g. 'article', 'collection'
 * @param {object} fields
 * @returns {string}
 */
export function computeCitation(
	app,
	path,
	folder,
	classValue,
	fields
) {
	const style = resolveCitationStyle(app, folder);
	return generateCitation(
		app,
		path,
		classValue,
		style,
		fields
	);
}

/**
 * @param {import('obsidian').App} app
 * @param {string} sourcePath - path of the note being created (for link resolution)
 * @param {string} leafClass - lowercase class value, e.g. 'article', 'collection'
 * @param {string} style - one of the keys in FORMATTERS, e.g. 'mla'
 * @param {object} fields - structured bibliographic fields; `authors`/
 *   `editors`/`translators`/`collections` are raw wikilink arrays as
 *   stored in frontmatter -- this function resolves them before formatting
 * @returns {string} the formatted citation
 */
export function generateCitation(
    app,
    sourcePath,
    leafClass,
    style,
    fields
) {
	const styleFormatters = FORMATTERS[style];
	if (!styleFormatters) {
		const error = new Error(`Unknown citation style: ${style}`);
		Log.error(
			'citation-engine',
			error.message,
			error
		);
		throw error;
	}

	const formatter = styleFormatters[leafClass];
	if (!formatter) {
		const error = new Error(`No ${ style } formatter registered for leaf class: ${ leafClass }`);
		Log.error(
			'citation-engine',
			error.message,
			error
		);
		throw error;
	}

	const resolvedFields = {
		...fields,
		authors: resolveAuthors(
            app,
            sourcePath,
            fields.authors
        ),
		editors: resolveAuthors(
            app,
            sourcePath,
            fields.editors
        ),
		translators: resolveAuthors(
            app,
            sourcePath,
            fields.translators
        ),
		interviewer: resolveAuthors(
			app,
			sourcePath,
			fields.interviewer
		),
		interviewee: resolveAuthors(
			app,
			sourcePath,
			fields.interviewee
		),
		collections: resolveNoteTitles(
			app,
			sourcePath,
			fields.collections
		),
		...(fields.parentWork
			? { parentWork: resolveNoteTitle(
				app,
				sourcePath,
				fields.parentWork
			) }
			: {}),
		...(fields.containedWorks
			? { containedWorks: resolveNoteTitles(
				app,
				sourcePath,
				fields.containedWorks
			) }
			: {}),
		...(fields.referenceWork
			? { referenceWork: resolveNoteTitle(
				app,
				sourcePath,
				fields.referenceWork
			) }
			: {}),
		...(fields.subjectWork
			? { subjectWork: resolveNoteTitle(
				app,
				sourcePath,
				fields.subjectWork
			) }
			: {}),
		...(fields.commissioningBody
			? { commissioningBody: resolveNoteTitle(
				app,
				sourcePath,
				fields.commissioningBody
			) }
			: {}),
		...(fields.institution
			? { institution: resolveNoteTitle(
				app,
				sourcePath,
				fields.institution
			) }
			: {}),
		...(fields.periodical
			? { periodical: resolveNoteTitle(
				app,
				sourcePath,
				fields.periodical
			) }
			: {}),
		...(leafClass === 'article' && fields.collections?.[0]
			? resolveCollectionFields(
				app,
				sourcePath,
				fields.collections[0]
			)
			: {}),
	};

	return formatter(resolvedFields);
}

/**
 * Resolves a note's governing citation style by reading it off the
 * parent Library note's `citation-style` field.
 *
 * @param {import('obsidian').App} app
 * @param {string} folder - the note's own folder, used to locate the enclosing Library note
 * @returns {string}
 */
export function resolveCitationStyle(app, folder) {
	const libraryNote = resolveLibraryNote(app, folder);
	const citationStyle = app.metadataCache.getFileCache(libraryNote)?.frontmatter?.['citation-style'];
	if (!citationStyle) {
		const error = new Error(`Library note "${ libraryNote.path }" has no citation-style set.`);
		Log.error(
			'citation-engine',
			error.message,
			error
		);
		throw error;
	}

	return citationStyle;
}