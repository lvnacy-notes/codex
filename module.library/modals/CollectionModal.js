import { AggregateModal } from './AggregateModal.js';
import { resolveLibraryFolder } from '../controls/resolve-library.js';
import { CONTENT_WARNINGS } from '../controls/library-vocab.js';
import { Collection } from '../objects/Collection.js';

export class CollectionModal extends AggregateModal {
	constructor(app, onSubmit) {
		super(app, onSubmit);
		Object.assign(this.result, {
			category: [],
			sortTitle: '',
			shortName: '',
			dateCataloged: '',
			year: '',
			periodical: '',
			volume: '',
			issue: '',
			translators: [],
			source: '',
			cover: '',
			coverCard: '',
			themes: [],
			keywords: [],
			contentWarnings: [],
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'New Collection' });

		this.buildTextSetting(
			contentEl,
			'Filename',
			'filename'
		);
		this.buildCategorySetting(contentEl, Collection);

		this.buildTextSetting(
			contentEl,
			'Sort title',
			'sortTitle'
		);
		this.buildTextSetting(
			contentEl,
			'Short name',
			'shortName'
		);
		this.buildCatalogStatusSetting(contentEl);
		this.buildTextSetting(
			contentEl,
			'Date cataloged',
			'dateCataloged',
			'YYYY-MM-DD'
		);
		this.buildTextSetting(
			contentEl,
			'Year',
			'year',
			'e.g. 2019'
		);

		// Seed for resolveLibraryFolder -- walks up to the enclosing
		// library root regardless of which subfolder the active file
		// sits in; does not itself restrict any field to a particular
		// subfolder.
		const activeFolder = this.app.workspace.getActiveFile()?.parent?.path ?? '';

		this.buildNoteLinkSetting(
			contentEl,
			'Periodical',
			'periodical',
			{
				folderPath: activeFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'periodical',
			}
		);
		this.buildTextSetting(
			contentEl,
			'Volume',
			'volume'
		);
		this.buildTextSetting(
			contentEl,
			'Issue',
			'issue'
		);

		this.buildEditorsSetting(
			contentEl,
			activeFolder,
			resolveLibraryFolder
		);
		this.buildNoteListSetting(
			contentEl,
			'Translators',
			'translators',
			{
				folderPath: activeFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'author',
			}
		);
		this.buildPublisherFields(contentEl);

		this.buildTextSetting(
			contentEl,
			'Source (URL)',
			'source'
		);
		this.buildTextSetting(
			contentEl,
			'Cover',
			'cover',
			'Wikilink or URL'
		);
		// No expectedClass/folderPath restriction -- Image.js doesn't
		// exist yet, so this is a plain, unrestricted wikilink field for
		// now.
		this.buildNoteLinkSetting(
			contentEl,
			'Cover card',
			'coverCard',
			{
				folderPath: activeFolder,
				resolveFolderPath: resolveLibraryFolder,
				expectedClass: 'image',
			}
		);

		this.buildGenresSetting(contentEl);
		this.buildListSetting(
			contentEl,
			'Themes',
			'themes'
		);
		this.buildListSetting(
			contentEl,
			'Keywords',
			'keywords'
		);
		this.buildListSetting(
			contentEl,
			'Content warnings',
			'contentWarnings',
			'',
			'',
			CONTENT_WARNINGS
		);

		super.onOpen();

		this.buildSubmitButton(contentEl);
	}
}