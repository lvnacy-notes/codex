const {
	Modal,
	Notice,
	Setting
} = await requireAsync('obsidian');
const {
	FileSuggest,
	FolderSuggest,
	NoteSuggest,
	ValueSuggest
} = await requireAsync('../controls/index.js');

export class BaseModal extends Modal {
	constructor(app, onSubmit) {
		super(app);
		this.onSubmit = onSubmit;
		this.result = {
			affiliations: [],
			context: [],
			tags: [],
		};
	}

	// Subclasses override onOpen() to render their own fields, calling
	// super.onOpen() to get the shared affiliations/context/tags inputs,
	// then buildSubmitButton() last.
	onOpen() {
		const { contentEl } = this;
		this.buildListSetting(
			contentEl,
			'Affiliations',
			'affiliations'
		);
		this.buildContextSetting(contentEl);
		this.buildListSetting(
			contentEl,
			'Tags',
			'tags'
		);
	}

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

	// Builds the shared Context field: a vault-wide, unrestricted
	// note-list picker. Subclasses whose objects belong to a scoped
	// context (e.g. a library) override this to restrict results
	// accordingly, without needing to duplicate the surrounding
	// Affiliations/Tags fields in onOpen().
	buildContextSetting(containerEl) {
		this.buildNoteListSetting(
			containerEl,
			'Context',
			'context'
		);
	}

	buildDropdownSetting(
		containerEl,
		label,
		resultKey,
		options
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
				});
			});
	}

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

	// Comma-separated free-text list. When `vocabulary` is given, entries
	// not present in it are still stored -- validation is advisory, not
	// enforced -- but a Notice names the invalid entries.
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

	// Single-value counterpart to buildNoteListSetting() below -- one
	// linked-note picker storing a single wikilink string, not an array.
	// Distinct from buildNoteSuggestSetting() further down, which stores a
	// bare file.basename with no brackets -- this stores a real
	// "[[Basename]]" wikilink so the resulting frontmatter field renders
	// as an actual Obsidian link.
	//
	// resolveFolderPath, when given, computes the actual restriction folder
	// from folderPath instead of using it as-is -- see NoteSuggest.js.
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

	// Repeatable note-reference picker -- the array-valued counterpart to
	// buildNoteSuggestSetting() below. Each row is a single input-suggest-
	// backed text field; results are stored as real wikilink strings
	// ("[[Basename]]") so they render as actual Obsidian links.
	//
	// resolveFolderPath, when given, computes the actual restriction folder
	// from folderPath instead of using it as-is -- see NoteSuggest.js.
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

	// resolveFolderPath, when given, computes the actual restriction folder
	// from folderPath instead of using it as-is -- see NoteSuggest.js.
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

	// Single on/off boolean field -- distinct from buildMultiSelectSetting's
	// per-array-value toggles, this stores one boolean directly in
	// result[resultKey].
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

	onClose() {
		this.contentEl.empty();
	}
}