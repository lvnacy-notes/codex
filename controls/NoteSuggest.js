import { AbstractInputSuggest } from 'obsidian';
import { validateExpectedClass } from './validate-expected-class.js';

/**
 * Suggests Markdown notes for a text input, optionally restricted to a folder and to frontmatter `class` values. The caller assigns `onSelectCb`, which receives the selected note.
 */
export class NoteSuggest extends AbstractInputSuggest {
	/**
	 * Validates `expectedClass` and stores the folder restriction and class filter.
	 * @param {import('obsidian').App} app
	 * @param {HTMLInputElement} inputEl
	 * @param {Object} [options]
	 * @param {string} [options.folderPath] Vault-root-relative folder to restrict results to. Omit to search the whole vault. Passed to `resolveFolderPath` as a seed when that is given.
	 * @param {function(import('obsidian').App, string): string} [options.resolveFolderPath] Computes the restriction folder from `folderPath`.
	 * @param {string[]} [options.expectedClass] Accepted frontmatter `class` values. Omit or pass an empty array to accept any.
	 * @throws {Error} When `expectedClass` is defined but is not an array of strings.
	 */
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
		validateExpectedClass(expectedClass, 'NoteSuggest');
		this.folderPath = resolveFolderPath ? resolveFolderPath(app, folderPath) : folderPath;
		this.expectedClass = expectedClass;
	}

	/**
	 * Returns notes inside the folder restriction, with an accepted `class`, whose basename contains the query, sorted by basename.
	 * @param {string} query
	 * @returns {import('obsidian').TFile[]}
	 */
	getSuggestions(query) {
		const lowerQuery = query.toLowerCase();
		return this.app.vault
			.getMarkdownFiles()
			.filter((file) => {
				if (this.folderPath && !file.path.startsWith(`${this.folderPath}/`)) {
					return false;
				}
				if (this.expectedClass?.length > 0) {
					const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
					if (!this.expectedClass.includes(frontmatter?.class)) {
						return false;
					}
				}
				return file.basename.toLowerCase().includes(lowerQuery);
			})
			.sort((a, b) => a.basename.localeCompare(b.basename));
	}

	/**
	 * Renders the note basename in the suggestion list.
	 * @param {import('obsidian').TFile} file
	 * @param {HTMLElement} el
	 */
	renderSuggestion(file, el) {
		el.setText(file.basename);
	}

	/**
	 * Fills the input with the note basename, closes the list, and calls `onSelectCb(file)`.
	 * @param {import('obsidian').TFile} file
	 */
	selectSuggestion(file) {
		this.setValue(file.basename);
		this.close();
		this.onSelectCb(file);
	}
}