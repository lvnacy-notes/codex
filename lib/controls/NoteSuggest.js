const { AbstractInputSuggest } = await requireAsync('obsidian');

// Fuzzy-suggests existing notes for a text input, filtered by frontmatter
// `class` (and optionally a folder) — the Modal-side equivalent of
// notePicker.js's pickNote() on the Templater side. Same shape as
// FolderSuggest: attach to a text input, set onSelectCb, done.
export class NoteSuggest extends AbstractInputSuggest {
	// folderPath: optional vault-root-relative folder to restrict results
	//   to (e.g. "ENVOY/Markets/Agents"). Omit to search the whole vault.
	//   When resolveFolderPath is given, folderPath is passed to it as a
	//   seed value rather than used directly as the restriction.
	// resolveFolderPath: optional (app, folderPath) => string, computing
	//   the actual restriction folder from folderPath instead of using it
	//   as-is. Lets a caller scope results to something derived from the
	//   given folder without NoteSuggest itself knowing anything about
	//   that derivation.
	// expectedClass: optional frontmatter `class` value a candidate note
	//   must have (e.g. "agent", "project"). Omit to match any class.
	constructor(
		app,
		inputEl,
		{
			folderPath,
			resolveFolderPath,
			expectedClass
		} = {}
	) {
		super(app, inputEl);
		this.folderPath = resolveFolderPath ? resolveFolderPath(app, folderPath) : folderPath;
		this.expectedClass = expectedClass;
	}

	getSuggestions(query) {
		const lowerQuery = query.toLowerCase();
		return this.app.vault
			.getMarkdownFiles()
			.filter((file) => {
				if (this.folderPath && !file.path.startsWith(`${this.folderPath}/`)) {
					return false;
				}
				if (this.expectedClass) {
					const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
					if (frontmatter?.class !== this.expectedClass) {
						return false;
					}
				}
				return file.basename.toLowerCase().includes(lowerQuery);
			})
			.sort((a, b) => a.basename.localeCompare(b.basename));
	}

	renderSuggestion(file, el) {
		el.setText(file.basename);
	}

	selectSuggestion(file) {
		this.setValue(file.basename);
		this.close();
		this.onSelectCb(file);
	}
}