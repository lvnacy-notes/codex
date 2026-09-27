import { AbstractInputSuggest } from 'obsidian';

// General-purpose vault file picker, distinct from NoteSuggest -- excludes
// Markdown files (already served by NoteSuggest) and applies no
// class-based filtering, since arbitrary vault files carry no
// frontmatter. Same attach-to-text-input, onSelectCb-driven shape as
// FolderSuggest/NoteSuggest.
export class FileSuggest extends AbstractInputSuggest {
	getSuggestions(query) {
		const lowerQuery = query.toLowerCase();
		return this.app.vault
			.getFiles()
			.filter((file) => file.extension !== 'md')
			.filter((file) => file.path.toLowerCase().includes(lowerQuery))
			.sort((a, b) => a.path.localeCompare(b.path));
	}

	renderSuggestion(file, el) {
		el.setText(file.path);
	}

	selectSuggestion(file) {
		this.setValue(file.path);
		this.close();
		this.onSelectCb(file);
	}
}