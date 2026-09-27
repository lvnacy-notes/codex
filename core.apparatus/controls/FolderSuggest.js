const { AbstractInputSuggest } = await requireAsync('obsidian');

export class FolderSuggest extends AbstractInputSuggest {
	getSuggestions(query) {
		const lowerQuery = query.toLowerCase();
		return this.app.vault
		.getAllFolders(true)
		.map((folder) => folder.path)
		.filter((path) => path.toLowerCase().includes(lowerQuery));
	}

	renderSuggestion(path, el) {
		el.setText(path || '/');
	}

	selectSuggestion(path) {
		this.setValue(path);
		this.close();
		this.onSelectCb(path);
	}
}