import { AbstractInputSuggest } from 'obsidian';
import { validateExpectedClass } from './validate-expected-class.js';

/**
 * Suggests values already used for a frontmatter key across the vault. In `list` mode it completes only the fragment after the last comma. The caller assigns `onSelectCb`, which receives the resulting input value.
 */
export class ValueSuggest extends AbstractInputSuggest {
	/**
	 * Stores the key, mode, and optional class filter.
	 * @param {import('obsidian').App} app
	 * @param {HTMLInputElement} inputEl
	 * @param {string} frontmatterKey Frontmatter key scanned across the vault.
	 * @param {Object} [options]
	 * @param {'single'|'list'} [options.mode='single'] `single` completes the whole field. `list` completes the fragment after the last comma.
	 * @param {string[]} [options.expectedClass] Accepted frontmatter `class` values. Omit or pass an empty array to accept any.
	 * @throws {Error} When `expectedClass` is defined but is not an array of strings.
	 */
	constructor(
        app,
        inputEl,
        frontmatterKey,
        { mode = 'single', expectedClass } = {}
    ) {
		super(app, inputEl);
		validateExpectedClass(expectedClass, 'ValueSuggest');
		this.expectedClass = expectedClass;
		this.frontmatterKey = frontmatterKey;
		this.inputEl = inputEl;
		this.mode = mode;
	}

	/**
	 * Returns the unique values of the frontmatter key across the vault, sorted.
	 * @returns {string[]}
	 */
	collectKnownValues() {
		const values = new Set();
		for (const file of this.app.vault.getMarkdownFiles()) {
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
			if (!frontmatter) {
				continue;
			}
			if (this.expectedClass?.length > 0 && !this.expectedClass.includes(frontmatter.class)) {
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

	/**
	 * Returns the active query: the text after the last comma in `list` mode, otherwise the whole query.
	 * @param {string} query
	 * @returns {string}
	 */
	currentFragment(query) {
		if (this.mode !== 'list') {
			return query;
		}
		const lastComma = query.lastIndexOf(',');
		return lastComma === -1 ? query.trim() : query.slice(lastComma + 1).trim();
	}

	/**
	 * Returns known values that contain the active fragment.
	 * @param {string} query
	 * @returns {string[]}
	 */
	getSuggestions(query) {
		const fragment = this.currentFragment(query).toLowerCase();
		return this.collectKnownValues().filter((v) => v.toLowerCase().includes(fragment));
	}

	/**
	 * Renders the value in the suggestion list.
	 * @param {string} value
	 * @param {HTMLElement} el
	 */
	renderSuggestion(value, el) {
		el.setText(value);
	}

	/**
	 * Fills the input, closes the list, and calls `onSelectCb` with the new input value. In `list` mode it replaces the last fragment and appends `, `.
	 * @param {string} value
	 */
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