import {
	Modal,
	Notice,
	Setting
} from 'obsidian';
import {
	FileSuggest,
	FolderSuggest,
	NoteSuggest,
	ValueSuggest
} from '../../controls';

/**
 * Base modal for collecting an object's creation inputs into a result object.
 */
export class BaseModal extends Modal {
	/**
	 * Stores the submit callback and initializes the result object.
	 * @param {import('obsidian').App} app
	 * @param {function(Object): void} onSubmit Called with the result object on submit.
	 */
	constructor(app, onSubmit) {
		super(app);
		this.onSubmit = onSubmit;
		this.result = {
			affiliations: [],
			context: [],
			tags: [],
		};
	}

	/**
	 * Renders the shared Affiliations, Context, and Tags fields.
	 */
	onOpen() {
		const { contentEl } = this;
		this.buildListSuggestSetting(
			contentEl,
			'Affiliations',
			'affiliations'
		);
		this.buildContextSetting(contentEl);
		this.buildListSuggestSetting(
			contentEl,
			'Tags',
			'tags'
		);
	}

	/**
	 * Renders the Category field from the class's category vocabulary, falling back to a comma-separated list when it declares none.
	 * @param {HTMLElement} containerEl
	 * @param {Function} ObjectClass Object class exposing a static `categoryOptions()`.
	 */
	buildCategorySetting(containerEl, ObjectClass) {
		const options = ObjectClass.categoryOptions();
		if (options && options.length > 0) {
			this.buildMultiSelectSetting(
				containerEl,
				'Category',
				'category',
				options
			);
		} else {
			this.buildListSuggestSetting(
				containerEl,
				'Category',
				'category',
				'category'
			);
		}
	}

	/**
	 * Renders the Context field as a vault-wide note-list picker. Override to scope the results.
	 * @param {HTMLElement} containerEl
	 */
	buildContextSetting(containerEl) {
		this.buildNoteListSetting(
			containerEl,
			'Context',
			'context'
		);
	}

	/**
	 * Renders a pick-one dropdown that stores the selected string.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {string[]} options Selectable values.
	 * @param {function(string): void} [onChange] Called with the selected value after it is stored.
	 */
	buildDropdownSetting(
		containerEl,
		label,
		resultKey,
		options,
		onChange
	) {
		new Setting(containerEl)
			.setName(label)
			.addDropdown((dropdown) => {
				dropdown.addOption('', '—');
				for (const option of options) {
					dropdown.addOption(option, option);
				}
				dropdown.setValue(this.result[resultKey] ?? '');
				dropdown.onChange((value) => {
					this.result[resultKey] = value;
					onChange?.(value);
				});
			});
	}

	/**
	 * Renders a pick-one dropdown that stores the selection as a string array.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {string[]} options Selectable values.
	 */
	buildDropdownArraySetting(
		containerEl,
		label,
		resultKey,
		options
	) {
		this.result[resultKey] = this.result[resultKey] ?? [];
		new Setting(containerEl)
			.setName(label)
			.addDropdown((dropdown) => {
				dropdown.addOption('', '—');
				for (const option of options) {
					dropdown.addOption(option, option);
				}
				dropdown.setValue(this.result[resultKey][0] ?? '');
				dropdown.onChange((value) => {
					this.result[resultKey] = value ? [value] : [];
				});
			});
	}

	/**
	 * Renders a text input with file suggestions that stores the file path.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {string} [placeholder='']
	 */
	buildFileSuggestSetting(
		containerEl,
		label,
		resultKey,
		placeholder = ''
	) {
		new Setting(containerEl)
			.setName(label)
			.addText((text) => {
				text
					.setPlaceholder(placeholder)
					.onChange((value) => {
						this.result[resultKey] = value;
					});

				const suggest = new FileSuggest(this.app, text.inputEl);
				suggest.onSelectCb = (file) => {
					this.result[resultKey] = file.path;
					text.setValue(file.path);
				};
			});
	}

	/**
	 * Renders a text input with folder suggestions that stores the folder path.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {string} [placeholder='']
	 */
	buildFolderSuggestSetting(
		containerEl,
		label,
		resultKey,
		placeholder = ''
	) {
		new Setting(containerEl)
			.setName(label)
			.addText((text) => {
				text
					.setPlaceholder(placeholder)
					.onChange((value) => {
						this.result[resultKey] = value;
					});

				const suggest = new FolderSuggest(this.app, text.inputEl);
				suggest.onSelectCb = (path) => {
					this.result[resultKey] = path;
				};
			});
	}

	/**
	 * Renders a comma-separated input that stores trimmed, non-empty entries.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {string} [placeholder='']
	 * @param {string} [defaultValue=''] Comma-separated initial value.
	 * @param {string[]|null} [vocabulary=null] Valid entries. Others are still stored, with a Notice.
	 */
	buildListSetting(
		containerEl,
		label,
		resultKey,
		placeholder = '',
		defaultValue = '',
		vocabulary = null
	) {
		if (defaultValue) {
			this.result[resultKey] = defaultValue
				.split(',')
				.map((v) => v.trim())
				.filter((v) => v.length > 0);
		}
		new Setting(containerEl)
			.setName(label)
			.setDesc('Comma-separated.')
			.addText((text) =>
				text
					.setPlaceholder(placeholder)
					.setValue(defaultValue)
					.onChange((value) => {
						const values = value
							.split(',')
							.map((v) => v.trim())
							.filter((v) => v.length > 0);
						this.result[resultKey] = values;
						if (vocabulary) {
							const invalid = values.filter(
								(v) => !vocabulary.includes(v)
							);
							if (invalid.length > 0) {
								new Notice(
									`${ label }: not in the controlled vocabulary -- ${invalid.join(', ')}`
								);
							}
						}
					})
			);
	}

	/**
	 * Renders a comma-separated input with value suggestions drawn from a frontmatter key.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {string} frontmatterKey Frontmatter key suggestions are drawn from.
	 * @param {string} [placeholder='']
	 * @param {string} [defaultValue=''] Comma-separated initial value.
	 */
	buildListSuggestSetting(
		containerEl,
		label,
		resultKey,
		frontmatterKey,
		placeholder = '',
		defaultValue = ''
	) {
		if (defaultValue) {
			this.result[resultKey] = defaultValue
				.split(',')
				.map((v) => v.trim())
				.filter((v) => v.length > 0);
		}
		new Setting(containerEl)
			.setName(label)
			.setDesc('Comma-separated.')
			.addText((text) => {
				text
					.setPlaceholder(placeholder)
					.setValue(defaultValue)
					.onChange((value) => {
						this.result[resultKey] = value
							.split(',')
							.map((v) => v.trim())
							.filter((v) => v.length > 0);
					});
				const suggest = new ValueSuggest(
					this.app,
					text.inputEl,
					frontmatterKey,
					{ mode: 'list' }
				);
				suggest.onSelectCb = (fullValue) => {
					this.result[resultKey] = fullValue
						.split(',')
						.map((v) => v.trim())
						.filter((v) => v.length > 0);
				};
			});
	}

	/**
	 * Renders one toggle per option and stores the selected options as an array.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {string[]} options Toggleable values.
	 */
	buildMultiSelectSetting(
		containerEl,
		label,
		resultKey,
		options
	) {
		this.result[resultKey] = this.result[resultKey] ?? [];
		new Setting(containerEl).setName(label).setHeading();
		for (const option of options) {
			new Setting(containerEl)
				.setName(option)
				.addToggle((toggle) =>
					toggle.setValue(false).onChange((value) => {
						const set = new Set(this.result[resultKey]);
						if (value) {
							set.add(option);
						} else {
							set.delete(option);
						}
						this.result[resultKey] = Array.from(set);
					})
				);
		}
	}

	/**
	 * Renders a note picker that stores one `[[basename]]` wikilink.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {Object} [options]
	 * @param {string} [options.folderPath] Folder suggestions are restricted to.
	 * @param {Function} [options.resolveFolderPath] Computes the restriction folder from `folderPath`.
	 * @param {*} [options.expectedClass] Passed to `NoteSuggest`.
	 * @param {string} [options.placeholder='']
	 */
	buildNoteLinkSetting(
		containerEl,
		label,
		resultKey,
		{
			folderPath,
			resolveFolderPath,
			expectedClass,
			placeholder = ''
		} = {}
	) {
		new Setting(containerEl)
			.setName(label)
			.addText((text) => {
				text
					.setPlaceholder(placeholder)
					.setValue(this.result[resultKey] ?? '')
					.onChange((value) => {
						this.result[resultKey] = value;
					});

				const suggest = new NoteSuggest(
					this.app,
					text.inputEl,
					{
						folderPath,
						resolveFolderPath,
						expectedClass
					}
				);
				suggest.onSelectCb = (file) => {
					const wikilink = `[[${file.basename}]]`;
					this.result[resultKey] = wikilink;
					text.setValue(wikilink);
				};
			});
	}

	/**
	 * Renders a repeatable note picker that stores an array of `[[basename]]` wikilinks.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {Object} [options]
	 * @param {string} [options.folderPath] Folder suggestions are restricted to.
	 * @param {Function} [options.resolveFolderPath] Computes the restriction folder from `folderPath`.
	 * @param {*} [options.expectedClass] Passed to `NoteSuggest`.
	 * @param {string} [options.placeholder='']
	 */
	buildNoteListSetting(
		containerEl,
		label,
		resultKey,
		{
			folderPath,
			resolveFolderPath,
			expectedClass,
			placeholder = ''
		} = {}
	) {
		this.result[resultKey] = this.result[resultKey] ?? [];
		new Setting(containerEl).setName(label).setHeading();
		const listEl = containerEl.createDiv();

		const renderRows = () => {
			listEl.empty();
			this.result[resultKey].forEach((_, index) => {
				const row = listEl.createDiv();
				new Setting(row)
					.setName(`${ label } ${ index + 1 }`)
					.addText((text) => {
						text
							.setPlaceholder(placeholder)
							.setValue(this.result[resultKey][index] ?? '')
							.onChange((value) => {
								this.result[resultKey][index] = value;
							});

						const suggest = new NoteSuggest(
							this.app,
							text.inputEl,
							{
								folderPath,
								resolveFolderPath,
								expectedClass
							}
						);
						suggest.onSelectCb = (file) => {
							const wikilink = `[[${file.basename}]]`;
							this.result[resultKey][index] = wikilink;
							text.setValue(wikilink);
						};
					})
					.addExtraButton((btn) =>
						btn
							.setIcon('trash')
							.setTooltip(`Remove ${ label.toLowerCase() }`)
							.onClick(() => {
								this.result[resultKey].splice(index, 1);
								renderRows();
							})
					);
			});
		};

		new Setting(containerEl).addButton((btn) =>
			btn.setButtonText(`Add ${ label.toLowerCase() }`).onClick(() => {
				this.result[resultKey].push('');
				renderRows();
			})
		);

		renderRows();
	}

	/**
	 * Renders a note picker that stores the bare file basename.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {Object} [options]
	 * @param {string} [options.folderPath] Folder suggestions are restricted to.
	 * @param {Function} [options.resolveFolderPath] Computes the restriction folder from `folderPath`.
	 * @param {*} [options.expectedClass] Passed to `NoteSuggest`.
	 * @param {string} [options.placeholder='']
	 */
	buildNoteSuggestSetting(
		containerEl,
		label,
		resultKey,
		{
			folderPath,
			resolveFolderPath,
			expectedClass,
			placeholder = ''
		} = {}
	) {
		new Setting(containerEl)
			.setName(label)
			.addText((text) => {
				text.setPlaceholder(placeholder).onChange((value) => {
					this.result[resultKey] = value;
				});

				const suggest = new NoteSuggest(
					this.app,
					text.inputEl,
					{
						folderPath,
						resolveFolderPath,
						expectedClass
					}
				);
				suggest.onSelectCb = (file) => {
					this.result[resultKey] = file.basename;
				};
			});
	}

	/**
	 * Renders the Create button. Clicking it closes the modal and calls `onSubmit` with the result.
	 * @param {HTMLElement} containerEl
	 */
	buildSubmitButton(containerEl) {
		new Setting(containerEl).addButton((btn) =>
			btn
				.setButtonText('Create')
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.result);
				})
		);
	}

	/**
	 * Renders a plain text input that stores the entered string.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {string} [placeholder='']
	 */
	buildTextSetting(
		containerEl,
		label,
		resultKey,
		placeholder = ''
	) {
		new Setting(containerEl)
			.setName(label)
			.addText((text) =>
				text.setPlaceholder(placeholder).onChange((value) => {
					this.result[resultKey] = value;
				})
			);
	}

	/**
	 * Renders a text input with value suggestions drawn from a frontmatter key.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {string} frontmatterKey Frontmatter key suggestions are drawn from.
	 * @param {string} [placeholder='']
	 */
	buildTextSuggestSetting(
		containerEl,
		label,
		resultKey,
		frontmatterKey,
		placeholder = ''
	) {
		new Setting(containerEl)
			.setName(label)
			.addText((text) => {
				text.setPlaceholder(placeholder).onChange((value) => {
					this.result[resultKey] = value;
				});
				const suggest = new ValueSuggest(
					this.app,
					text.inputEl,
					frontmatterKey,
					{ mode: 'single' }
				);
				suggest.onSelectCb = (value) => {
					this.result[resultKey] = value;
				};
			});
	}

	/**
	 * Renders a single toggle that stores a boolean.
	 * @param {HTMLElement} containerEl
	 * @param {string} label Field label.
	 * @param {string} resultKey Key in `this.result`.
	 * @param {boolean} [defaultValue=false]
	 */
	buildToggleSetting(
		containerEl,
		label,
		resultKey,
		defaultValue = false
	) {
		this.result[resultKey] = defaultValue;
		new Setting(containerEl)
			.setName(label)
			.addToggle((toggle) =>
				toggle.setValue(defaultValue).onChange((value) => {
					this.result[resultKey] = value;
				})
			);
	}

	/**
	 * Empties the modal content.
	 */
	onClose() {
		this.contentEl.empty();
	}
}