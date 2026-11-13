/**
 * Returns the path of the folder holding the nearest library note, searching upward from `startFolderPath`. A library note has frontmatter `class: library`.
 * @param {import('obsidian').App} app
 * @param {string} startFolderPath Folder path the search starts from.
 * @returns {string}
 * @throws {Error} When no library note is found before the vault root, or a folder holds more than one library note.
 */
export function resolveLibraryFolder(app, startFolderPath) {
	return findLibraryNote(
		app,
		startFolderPath,
		startFolderPath
	).parent?.path ?? '';
}

/**
 * Returns the nearest library note, searching upward from `startFolderPath`.
 * @param {import('obsidian').App} app
 * @param {string} startFolderPath Folder path the search starts from.
 * @returns {import('obsidian').TFile}
 * @throws {Error} When no library note is found before the vault root, or a folder holds more than one library note.
 */
export function resolveLibraryNote(app, startFolderPath) {
	return findLibraryNote(
		app,
		startFolderPath,
		startFolderPath
	);
}

/**
 * Returns the library note directly inside `folderPath`, recursing to the parent folder when it holds none.
 * @param {import('obsidian').App} app
 * @param {string} folderPath Folder currently searched.
 * @param {string} startFolderPath Folder the search began from, used in the not-found message.
 * @returns {import('obsidian').TFile}
 * @throws {Error} When no library note is found before the vault root, or a folder holds more than one library note.
 */
function findLibraryNote(
	app,
	folderPath,
	startFolderPath
) {
	const matches = app.vault
		.getMarkdownFiles()
		.filter((file) => {
			const parentPath = file.parent?.path ?? '';
			if (parentPath !== folderPath) {
				return false;
			}
			const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
			return frontmatter?.class === 'library';
		});

	switch (matches.length) {
		case 1:
			return matches[0];
		case 0:
			if (folderPath === '') {
				throw new Error(
					`No enclosing library found above "${ startFolderPath }".`
				);
			}
			return findLibraryNote(
				app,
				folderPath.split('/').slice(0, -1).join('/'),
				startFolderPath
			);
		default:
			throw new Error(
				`Multiple library notes found in "${ folderPath }".`
			);
	}
}