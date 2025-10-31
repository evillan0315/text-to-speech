 import { atom } from 'nanostores';
import { persistentAtom } from '@/utils/persistentAtom';

// Placeholder for projectRootDirectoryStore. In a full IDE, this would reflect the opened project.
export const projectRootDirectoryStore = persistentAtom<string | null>('projectRootDirectory', '/');

projectRootDirectoryStore.listen((root) => {
  projectRootDirectoryStore.set(root);
});

export const fileTreeStore = map<any>({
  files: [], // Hierarchical file tree
  flatFileList: [], // Flat list from API (for AI context)
  expandedDirs: new Set(), // Store expanded directories by their full path
  selectedFile: null,
  isFetchingTree: false,
  fetchTreeError: null,
  lastFetchedProjectRoot: null,
  lastFetchedScanPaths: [], // Retained for AI context scan paths, not directly for visual tree
  loadingChildren: new Set(), // Initialize new state for loading children
  projectRootDirectory: '/', // Added to align with FileTreeState
});

export const setFiles = (files: any[]) => {
  fileTreeStore.setKey('files', files);
};