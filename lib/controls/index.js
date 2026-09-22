const { FileSuggest } = await requireAsync('./FileSuggest.js');
const { FolderSuggest } = await requireAsync('./FolderSuggest.js');
const { NoteSuggest } = await requireAsync('./NoteSuggest.js');
const { ValueSuggest } = await requireAsync('./ValueSuggest.js');

export {
	FileSuggest,
	FolderSuggest,
	NoteSuggest,
	ValueSuggest
};