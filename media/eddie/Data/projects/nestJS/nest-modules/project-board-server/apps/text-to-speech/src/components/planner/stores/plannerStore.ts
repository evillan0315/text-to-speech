import { atom } from 'nanostores';
import type { IPlan, IFileChange } from '../types';
import {
  INSTRUCTION as PLANNER_AI_INSTRUCTION,
  INSTRUCTION_SCHEMA_OUTPUT as PLANNER_EXPECTED_OUTPUT_FORMAT,
} from '../constants/instructions';
import { projectRootDirectoryStore } from '@/stores/fileTreeStore';
import { persistentAtom } from '@/utils/persistentAtom';

// Define a reasonable default project root path if none is set
// This path is specific to the user's environment, based on the project structure.
const DEFAULT_PROJECT_ROOT_FROM_ENV = import.meta.env.VITE_BASE_DIR; // Get default from environment

// Initialize projectRootDirectoryStore with a default if it's empty
// This ensures that projectRootDirectoryStore.get() will always return a string or DEFAULT_PROJECT_ROOT_FROM_ENV
if (projectRootDirectoryStore.get() === null || projectRootDirectoryStore.get() === '') {
  projectRootDirectoryStore.set(DEFAULT_PROJECT_ROOT_FROM_ENV);
}

interface PlannerState {
  userPrompt: string;
  plan: IPlan | null;
  isLoading: boolean;
  error: string | null;
  applyStatus: 'idle' | 'applying' | 'success' | 'failure';
  applyError: string | null;
  projectRoot: string; // New field for project root directory
  scanPathsInput: string; // New field for AI scan paths
  additionalInstructions: string; // New field for AI's additional instructions
  expectedOutputFormat: string; // New field for AI's expected output format
}

export const currentPlanIdPersistentAtom = persistentAtom<string | null>('plannerCurrentPlanId', null);

export const plannerStore = atom<PlannerState>({
  userPrompt: '',
  plan: null,
  isLoading: false,
  error: null,
  applyStatus: 'idle',
  applyError: null,
  projectRoot: projectRootDirectoryStore.get() ?? DEFAULT_PROJECT_ROOT_FROM_ENV, // Ensure a default string value
  scanPathsInput: 'src, public, package.json, README.md, .env', // Provide sensible defaults for scan paths
  additionalInstructions: PLANNER_AI_INSTRUCTION, // Default from constants
  expectedOutputFormat: PLANNER_EXPECTED_OUTPUT_FORMAT, // Default from constants
});

export const setUserPrompt = (prompt: string) => {
  plannerStore.set({ ...plannerStore.get(), userPrompt: prompt });
};

export const setPlan = (planId: string | null, plan: IPlan | null) => {
  plannerStore.set({
    ...plannerStore.get(),
    plan: plan,
    isLoading: false,
    error: null,
  });
  currentPlanIdPersistentAtom.set(planId);
};

export const setIsLoading = (loading: boolean) => {
  plannerStore.set({ ...plannerStore.get(), isLoading: loading, error: null });
};

export const setError = (error: string | null) => {
  plannerStore.set({ ...plannerStore.get(), error: error, isLoading: false });
};

export const setApplyStatus = (
  status: PlannerState['applyStatus'],
  error: string | null = null,
) => {
  plannerStore.set({ ...plannerStore.get(), applyStatus: status, applyError: error });
};

export const setProjectRoot = (root: string) => {
  plannerStore.set({ ...plannerStore.get(), projectRoot: root });
};

export const setScanPathsInput = (paths: string) => {
  plannerStore.set({ ...plannerStore.get(), scanPathsInput: paths });
};

export const setAdditionalInstructions = (instructions: string) => {
  plannerStore.set({ ...plannerStore.get(), additionalInstructions: instructions });
};

export const setExpectedOutputFormat = (format: string) => {
  plannerStore.set({ ...plannerStore.get(), expectedOutputFormat: format });
};

/**
 * Updates specific metadata fields of the currently active plan.
 * @param updatedMetadata An object containing the fields to update.
 */
export const updateCurrentPlanMetadata = (updatedMetadata: {
  title?: string;
  summary?: string;
  thoughtProcess?: string;
  documentation?: string;
  gitInstructions?: string[];
}) => {
  const current = plannerStore.get();
  const currentPlanId = currentPlanIdPersistentAtom.get();
  if (current.plan && currentPlanId === current.plan.id) {
    plannerStore.set({
      ...current,
      plan: {
        ...current.plan,
        ...updatedMetadata,
        updatedAt: new Date(), // Mark as updated
      },
    });
  } else {
    console.warn('Attempted to update plan metadata but no current plan or planId mismatch.');
  }
};

/**
 * Updates a specific file change within the currently active plan.
 * @param planId The ID of the plan to update.
 * @param changeIndex The index of the file change within the plan's changes array.
 * @param updatedChange The new IFileChange object to replace the existing one.
 */
export const updateFileChange = (planId: string, changeIndex: number, updatedChange: IFileChange) => {
  const current = plannerStore.get();
  // Ensure the plan being updated matches the current active plan by ID
  const activePlanId = currentPlanIdPersistentAtom.get();
  if (current.plan && current.plan.id === activePlanId && activePlanId === planId && current.plan.changes[changeIndex]) {
    const newChanges = [...current.plan.changes];
    newChanges[changeIndex] = updatedChange;
    plannerStore.set({
      ...current,
      plan: {
        ...current.plan,
        changes: newChanges,
        updatedAt: new Date(), // Mark the plan as updated
      },
    });
  } else {
    console.warn(
      `Attempted to update file change at index ${changeIndex} for plan ${planId}, but plan or index not found or planId mismatch with active plan.`,
    );
  }
};

export const resetPlannerState = () => {
  plannerStore.set({
    userPrompt: '',
    plan: null,
    isLoading: false,
    error: null,
    applyStatus: 'idle',
    applyError: null,
    projectRoot: projectRootDirectoryStore.get() ?? DEFAULT_PROJECT_ROOT_FROM_ENV,
    scanPathsInput: 'src, public, package.json, README.md, .env', // Reset to default scan paths as well
    additionalInstructions: PLANNER_AI_INSTRUCTION,
    expectedOutputFormat: PLANNER_EXPECTED_OUTPUT_FORMAT,
  });
  currentPlanIdPersistentAtom.set(null);
};
