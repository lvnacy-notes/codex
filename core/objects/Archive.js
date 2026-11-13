import { BaseClass } from './BaseClass.js';

/**
 * Base class for a module's archive notes.
 */
export class Archive extends BaseClass {
	/**
	 * Value written to the `class` frontmatter field.
	 */
	static classValue = 'archive';

	/**
	 * Returns the class's valid category strings.
	 * @returns {string[]}
	 */
	static categoryOptions() {
		return [
            'specification',
            'overview',
            'documentation',
            'changelog'
        ];
	}

	/**
	 * Stores the app, the note's options, and the module tag.
	 * @param {import('obsidian').App} app
	 * @param {Object} options
	 * @param {string} options.filename Note filename, without extension.
	 * @param {string} [options.folder=''] Destination folder path.
	 * @param {string[]} [options.category=[]]
	 * @param {string[]} [options.affiliations=[]]
	 * @param {string[]} [options.context=[]] Wikilinks, stored unresolved.
	 * @param {string[]} [options.tags=[]]
	 * @param {string} [options.moduleTag=''] Tag scoping the module's notes. Merged into `tags`.
	 */
	constructor(app, options = {}) {
		super(app, options);
		this.moduleTag = options.moduleTag ?? '';
	}

	/**
	 * Returns the frontmatter fields in render order, with `moduleTag` merged into `tags`.
	 * @returns {Object}
	 */
	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();
		const tags = this.moduleTag
			? Array.from(new Set([this.moduleTag, ...base.tags]))
			: base.tags;
		return { ...base, tags };
	}


	/**
	 * Returns the heading of the integrity section.
	 * @returns {string}
	 */
	integritySectionTitle() {
		return 'archive integrity';
	}

	/**
	 * Returns the checks for the integrity section. Empty by default.
	 * @returns {Array<{ label: string, script: string }>}
	 */
	integrityChecks() {
		return [];
	}

	/**
	 * Returns the heading of the snapshot section, or `null` to omit the section.
	 * @returns {string|null}
	 */
	snapshotSectionTitle() {
		return null;
	}

	/**
	 * Returns the checks for the snapshot section. Empty by default.
	 * @returns {Array<{ label: string, script: string }>}
	 */
	snapshotChecks() {
		return [];
	}

	/**
	 * Returns the overview body when `category` includes `'overview'`, otherwise `''`.
	 * @returns {string}
	 */
	getBody() {
		if (!this.category.includes('overview')) {
			return '';
		}
		return buildArchiveOverview({
			integritySectionTitle: this.integritySectionTitle(),
			integrityChecks: this.integrityChecks(),
			snapshotSectionTitle: this.snapshotSectionTitle(),
			snapshotChecks: this.snapshotChecks(),
		});
	}
}

/**
 * Assembles the overview body.
 * @param {Object} sections
 * @param {string} sections.integritySectionTitle
 * @param {Array<{ label: string, script: string }>} sections.integrityChecks
 * @param {string|null} sections.snapshotSectionTitle
 * @param {Array<{ label: string, script: string }>} sections.snapshotChecks
 * @returns {string}
 */
function buildArchiveOverview({
    integritySectionTitle,
    integrityChecks,
    snapshotSectionTitle,
    snapshotChecks
}) {
	const integritySection = renderChecksSection(integritySectionTitle, integrityChecks);
	const snapshotSection = renderChecksSection(snapshotSectionTitle, snapshotChecks);

	return `# contents

\`\`\`toc
\`\`\`

${ integritySection }${ snapshotSection }# changelog

Changelog entries are generated and managed by Archivist -- run \`archivist changelog\` from within this module's folder, or the appropriate module-type command otherwise. See Archivist's own documentation for its schema and conventions; this note doesn't prescribe or validate changelog structure.
`;
}

/**
 * Returns a rendered checks section, or `''` when the title is falsy or there are no checks.
 * @param {string|null} title
 * @param {Array<{ label: string, script: string }>} checks
 * @returns {string}
 */
function renderChecksSection(title, checks) {
	if (!title || !checks || checks.length === 0) {
		return '';
	}
	const blocks = checks
		.map(({ label, script }) => `## ${ label }\n\n\`\`\`dataviewjs\n${ script }\n\`\`\`\n`)
		.join('\n');
	return `# ${ title }\n\n${ blocks }\n`;
}