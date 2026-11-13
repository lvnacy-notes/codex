import { AbstractInputSuggest } from 'obsidian';

/**
 * Suggests non-Markdown vault files for a text input. The caller assigns `onSelectCb`, which receives the selected file.
 */
export class FileSuggest extends AbstractInputSuggest {
	/**
	 * Returns non-Markdown files whose path contains the query, sorted by path.
	 * @param {string} query
	 * @returns {import('obsidian').TFile[]}
	 */
	getSuggestions(query) {
		const lowerQuery = query.toLowerCase();
		return this.app.vault
			.getFiles()
			.filter((file) => file.extension !== 'md')
			.filter((file) => file.path.toLowerCase().includes(lowerQuery))
			.sort((a, b) => a.path.localeCompare(b.path));
	}

	/**
	 * Renders the file path in the suggestion list.
	 * @param {import('obsidian').TFile} file
	 * @param {HTMLElement} el
	 */
	renderSuggestion(file, el) {
		el.setText(file.path);
	}

	/**
	 * Fills the input with the file path, closes the list, and calls `onSelectCb(file)`.
	 * @param {import('obsidian').TFile} file
	 */
	selectSuggestion(file) {
		this.setValue(file.path);
		this.close();
		this.onSelectCb(file);
	}
}