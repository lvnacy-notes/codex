import { AbstractInputSuggest } from 'obsidian';

/**
 * Suggests vault folder paths for a text input. The caller assigns `onSelectCb`, which receives the selected path.
 */
export class FolderSuggest extends AbstractInputSuggest {
	/**
	 * Returns folder paths, including the vault root, that contain the query.
	 * @param {string} query
	 * @returns {string[]}
	 */
	getSuggestions(query) {
		const lowerQuery = query.toLowerCase();
		return this.app.vault
		.getAllFolders(true)
		.map((folder) => folder.path)
		.filter((path) => path.toLowerCase().includes(lowerQuery));
	}

	/**
	 * Renders the folder path, or `/` for an empty path.
	 * @param {string} path
	 * @param {HTMLElement} el
	 */
	renderSuggestion(path, el) {
		el.setText(path || '/');
	}

	/**
	 * Fills the input with the path, closes the list, and calls `onSelectCb(path)`.
	 * @param {string} path
	 */
	selectSuggestion(path) {
		this.setValue(path);
		this.close();
		this.onSelectCb(path);
	}
}