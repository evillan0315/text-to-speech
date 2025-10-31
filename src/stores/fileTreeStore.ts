 import { atom } from 'nanostores';
import { persistentAtom } from '@/utils/persistentAtom';

// Placeholder for projectRootDirectoryStore. In a full IDE, this would reflect the opened project.
export const projectRootDirectoryStore = persistentAtom<string | null>('projectRootDirectory', '/');

projectRootDirectoryStore.listen((root) => {
  projectRootDirectoryStore.set(root);
});

