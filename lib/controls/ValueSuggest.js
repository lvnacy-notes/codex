const { AbstractInputSuggest } = await requireAsync('obsidian');

// Suggests values already used elsewhere in the vault for a given
// frontmatter key, rather than a fixed vocabulary declared up front — e.g.
// autocompleting `genres` from every genre value any existing note already
// carries, so "dark-fantasy" doesn't quietly become "dark fantasy" on note
// three. This is the fallback for fields that don't have (or haven't been
// given) a fixed vocabulary — see BaseModal.buildCategorySetting().
//
// Two modes:
//   'single' — completes the whole field, same behavior as FolderSuggest.
//   'list'   — completes only the fragment after the last comma, leaving
//              everything typed before it alone. Pairs with fields built
//              via buildListSetting()/buildListSuggestSetting().
export class ValueSuggest extends AbstractInputSuggest {
	// frontmatterKey: the frontmatter field to scan across the vault (e.g.
	//   "genres", "tags").
	// expectedClass: optional — restrict scanning to notes of this class.
	//   Left unset by default, since a value like a genre or a tag is
	//   usually meant to stay consistent across every class that uses it,
	//   not just one.
	constructor(
        app,
        inputEl,
        frontmatterKey,
        { mode = 'single', expectedClass } = {}
    ) {
		super(app, inputEl);
		this.expectedClass = expectedClass;
		this.frontmatterKey = frontmatterKey;
		this.inputEl = inputEl;
		this.mode = mode;
	}

	collectKnownValues() {
		const values = new Set();
		for (const file of this.app.vault.getMarkdownFiles()) {
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
			if (!frontmatter) {
				continue;
			}
			if (this.expectedClass && frontmatter.class !== this.expectedClass) {
				continue;
			}
			const raw = frontmatter[this.frontmatterKey];
			if (Array.isArray(raw)) {
				for (const v of raw) {
					if (v) {
						values.add(String(v));
					}
				}
			} else if (raw) {
				values.add(String(raw));
			}
		}
		return Array.from(values).sort((a, b) => a.localeCompare(b));
	}

	// In 'list' mode, only the text after the last comma is the active
	// query — everything before it is already-committed input we leave
	// untouched.
	currentFragment(query) {
		if (this.mode !== 'list') {
			return query;
		}
		const lastComma = query.lastIndexOf(',');
		return lastComma === -1 ? query.trim() : query.slice(lastComma + 1).trim();
	}

	getSuggestions(query) {
		const fragment = this.currentFragment(query).toLowerCase();
		return this.collectKnownValues().filter((v) => v.toLowerCase().includes(fragment));
	}

	renderSuggestion(value, el) {
		el.setText(value);
	}

	selectSuggestion(value) {
		if (this.mode === 'list') {
			const current = this.inputEl.value;
			const lastComma = current.lastIndexOf(',');
			const prefix = lastComma === -1 ? '' : `${current.slice(0, lastComma + 1)} `;
			const newValue = `${prefix}${value}, `;
			this.setValue(newValue);
			this.close();
			this.onSelectCb(newValue);
		} else {
			this.setValue(value);
			this.close();
			this.onSelectCb(value);
		}
	}
}