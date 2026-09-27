import { BaseModal } from '../../core.apparatus/modals/BaseModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import { Definition } from '../objects/Definition.js';

export class DefinitionModal extends BaseModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			filename: '',
			category: [],
			aliases: [],
			shortDefinition: '',
			referenceWork: [],
			related: [],
		});
	}

	// Library-scoped override of BaseModal's vault-wide default,
	// matching WorksModal's own override -- Definition notes live
	// inside a library, so Context results are restricted to notes
	// within the enclosing library rather than the whole vault.
	buildContextSetting(containerEl) {
		const activeFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';
		this.buildNoteListSetting(
			containerEl,
			'Context',
			'context',
			{ folderPath: activeFolder, resolveFolderPath: resolveLibraryFolder }
		);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Definition' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Definition);
		this.buildListSetting(
			contentEl,
			'Aliases',
			'aliases'
		);
		this.buildTextSetting(
			contentEl,
			'Short definition',
			'shortDefinition'
		);

		const activeFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteListSetting(
			contentEl,
			'Reference work',
			'referenceWork',
			{ folderPath: activeFolder, resolveFolderPath: resolveLibraryFolder }
		);
		this.buildNoteListSetting(
			contentEl,
			'Related',
			'related',
			{
				folderPath: activeFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'definition',
			}
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}