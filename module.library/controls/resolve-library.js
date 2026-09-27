import { Log } from '../../utils/logger.js';

// Resolves the enclosing library for a given starting folder: walks
// upward from startFolderPath to the nearest ancestor folder whose direct
// contents include a note with frontmatter `class: library`, returning
// that folder's path. Throws if none is found before the vault root, or
// if a folder contains more than one such note.
export function resolveLibraryFolder(app, startFolderPath) {
	return findLibraryNote(
		app,
		startFolderPath,
		startFolderPath
	).parent?.path ?? '';
}

// Same resolution as resolveLibraryFolder, returning the library's own
// note (TFile) instead of its folder path -- for callers that need to
// read fields off the library note itself (e.g. works-folder-name).
export function resolveLibraryNote(app, startFolderPath) {
	return findLibraryNote(
		app,
		startFolderPath,
		startFolderPath
	);
}

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
				const error = new Error(
					`No enclosing library found above "${ startFolderPath }".`
				);
				Log.error(
					'resolve-library',
					error.message,
					error
				);
				throw error;
			}
			return findLibraryNote(
				app,
				folderPath.split('/').slice(0, -1).join('/'),
				startFolderPath
			);
		default: {
			const error = new Error(
				`Multiple library notes found in "${ folderPath }".`
			);
			Log.error(
				'resolve-library',
				error.message,
				error
			);
			throw error;
		}
	}
}