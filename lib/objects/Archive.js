import { BaseClass } from './BaseClass.js';

export class Archive extends BaseClass {
	static classValue = 'archive';

	// Tightly coupled to class: archive and exhaustive at the system level
	// per the Apparatus Module Taxonomy -- a candidate value outside these
	// four is a signal the note may not actually be a true archive note.
	static categoryOptions() {
		return [
            'specification',
            'overview',
            'documentation',
            'changelog'
        ];
	}

	constructor(app, options = {}) {
		super(app, options);
		// The vault tag scoping this module's notes -- whatever a subclass's
		// own module considers its scope tag (a story's storyTag, a
		// library's own project tag, etc). Generic here on purpose: Archive
		// itself has no opinion on what kind of module it's archiving.
		this.moduleTag = options.moduleTag ?? '';
	}

	getFrontmatterFields() {
		const base = this.baseFrontmatterFields();
		const tags = this.moduleTag
			? Array.from(new Set([this.moduleTag, ...base.tags]))
			: base.tags;
		return { ...base, tags };
	}

	// ------------------------------------------------------------------
	// Override points. Archive itself has no classes it knows how to
	// validate -- it only knows how to assemble whatever sections a
	// subclass hands it. A module with nothing to say for a given section
	// simply doesn't override its title (or returns an empty checks list),
	// and that section is omitted from the generated note entirely.
	// ------------------------------------------------------------------

	// Section heading for the metadata-integrity checks. Defaults to
	// something reasonable for every module; override only if a module
	// wants different wording.
	integritySectionTitle() {
		return 'archive integrity';
	}

	// Array of { label, script }, one entry per class this module wants
	// validated. `script` is the raw DataviewJS body (no fence, no
	// heading) -- Archive wraps it in `## label` + a dataviewjs block.
	// Empty by default: Archive doesn't know what classes a given module
	// has.
	integrityChecks() {
		return [];
	}

	// Snapshot/archival-state checks -- structurally identical to
	// integrityChecks(), but its own section. Unlike integritySectionTitle(),
	// this has NO default title -- a module with no archival-snapshot
	// concept (which won't be every module) simply never overrides this,
	// and the whole section is omitted rather than emitting an empty or
	// assumed heading.
	snapshotSectionTitle() {
		return null;
	}

	snapshotChecks() {
		return [];
	}

	getBody() {
		// Only category: overview (the ARCHIVE/README dashboard) has a
		// prescribed template. specification/documentation are freeform,
		// hand-authored docs -- and changelog entries are generated and
		// owned entirely by Archivist, not by this class.
		if (this.category !== 'overview') {
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

function renderChecksSection(title, checks) {
	if (!title || !checks || checks.length === 0) {
		return '';
	}
	const blocks = checks
		.map(({ label, script }) => `## ${ label }\n\n\`\`\`dataviewjs\n${ script }\n\`\`\`\n`)
		.join('\n');
	return `# ${ title }\n\n${ blocks }\n`;
}

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