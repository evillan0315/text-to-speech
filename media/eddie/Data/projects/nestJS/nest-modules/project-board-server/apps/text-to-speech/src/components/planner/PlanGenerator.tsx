import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Snackbar,
} from '@mui/material';
import { useStore } from '@nanostores/react';
import {
  plannerStore,
  setUserPrompt,
  setIsLoading,
  setError,
  setPlan,
  resetPlannerState,
  setProjectRoot,
  setScanPathsInput,
  updateCurrentPlanMetadata,
  updateFileChange,
  setCurrentPlanId
} from './stores/plannerStore';
import { plannerService } from './api/plannerService';
import PlanDisplay from './PlanDisplay';
import type { GlobalAction } from '@/types/action';
import type { ILlmInput, IFileChange } from './types';

import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddRoadIcon from '@mui/icons-material/AddRoad';
import DescriptionIcon from '@mui/icons-material/Description';
import SchemaIcon from '@mui/icons-material/Schema';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ListAltIcon from '@mui/icons-material/ListAlt'; // New import for PlannerList drawer
import CustomDrawer from '@/components/Drawer/CustomDrawer';
import DirectoryPickerDrawer from '@/components/planner/drawerContent/DirectoryPickerDrawer';
import ScanPathsDrawer from '@/components/planner/drawerContent/ScanPathsDrawer';
import InstructionEditorDrawer from '@/components/planner/drawerContent/InstructionEditorDrawer';
import PlanMetadataEditorDrawer from '@/components/planner/drawerContent/PlanMetadataEditorDrawer';
import FileChangeEditorDrawer from '@/components/planner/drawerContent/FileChangeEditorDrawer';
import PlannerList from './PlannerList'; // New import for PlannerList component
import { projectRootDirectoryStore } from '@/stores/fileTreeStore';
import Loading from '@/components/Loading';

const styles = {
  card: {
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
  },
  formSection: {
    padding: 3,
  },
  generateButton: {
    marginTop: 2,
    marginBottom: 2,
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    mt: 2,
    justifyContent: 'flex-end',
  },
};

const PlanGenerator: React.FC = () => {
  const {
    userPrompt,
    plan,
    isLoading,
    error,
    projectRoot,
    scanPathsInput,
    additionalInstructions,
    expectedOutputFormat,
  } = useStore(plannerStore);
  const globalProjectRoot = useStore(projectRootDirectoryStore);

  const [isProjectRootPickerDialogOpen, setIsProjectRootPickerDialogOpen] = useState(false);
  const [isScanPathsDialogOpen, setIsScanPathsDialogOpen] = useState(false);
  const [isAiInstructionDrawerOpen, setIsAiInstructionDrawerOpen] = useState(false);
  const [isExpectedOutputDrawerOpen, setIsExpectedOutputDrawerOpen] = useState(false);
  const [isPlanMetadataEditorOpen, setIsPlanMetadataEditorOpen] = useState(false);
  const [isFileChangeEditorOpen, setIsFileChangeEditorOpen] = useState(false);
  const [isPlannerListDrawerOpen, setIsPlannerListDrawerOpen] = useState(false); // New state for PlannerList drawer
  const [editingFileChange, setEditingFileChange] = useState<IFileChange | null>(null);
  const [editingFileChangeIndex, setEditingFileChangeIndex] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Local state for the project root input field within the DirectoryPickerDrawer
  const [tempDrawerProjectRootInput, setTempDrawerProjectRootInput] = useState(projectRoot || '');
  // Local state for scan paths within the drawer before confirming
  const [localScanPaths, setLocalScanPaths] = useState<string[]>(
    scanPathsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );

  // Effect to ensure plannerStore's projectRoot is in sync with globalProjectRoot
  useEffect(() => {
    if (globalProjectRoot && projectRoot !== globalProjectRoot) {
      setProjectRoot(globalProjectRoot);
    } else if (!projectRoot && globalProjectRoot) {
      // If plannerStore's projectRoot is empty but global isn't
      setProjectRoot(globalProjectRoot);
    }
    // If no globalProjectRoot and plannerStore's projectRoot is still empty, button will be disabled, which is correct.
  }, [globalProjectRoot, projectRoot, setProjectRoot]);

  // Sync localScanPaths with plannerStore's scanPathsInput when the drawer is opened or parent changes it
  useEffect(() => {
    if (isScanPathsDialogOpen) {
      setLocalScanPaths(
        scanPathsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
    } else {
      // Reset local state when drawer closes to reflect true store state if parent updated it
      setLocalScanPaths(
        scanPathsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }, [isScanPathsDialogOpen, scanPathsInput]);

  // Effect to open snackbar when an error occurs
  useEffect(() => {
    if (error) {
      setSnackbarOpen(true);
    } else {
      setSnackbarOpen(false);
    }
  }, [error]);

  const currentScanPathsArray = useMemo(
    () =>
      scanPathsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [scanPathsInput],
  );

  const scanPathAutocompleteOptions = useMemo(() => {
    // In a real scenario, this would be populated from a file tree service.
    // For now, these are just suggestions.
    return Array.from(new Set(['src', 'public', 'package.json', 'README.md', '.env'])).sort();
  }, []);

  // Removed getRelevantFiles as frontend does not possess file content. Backend will handle scanning.

  const handleLoadProject = useCallback(
    (selectedPath: string) => {
      if (!selectedPath.trim()) {
        setError('Please provide a project root path.');
        return;
      }
      setProjectRoot(selectedPath);
      projectRootDirectoryStore.set(selectedPath); // Update global store
      setError('');
      setPlan(null, null);
      // setIsLoading(false); // No longer needed here as setPlan handles isLoading: false
    },
    [setProjectRoot, setError, setPlan],
  );

  const updateScanPaths = useCallback(
    (paths: string[]) => setScanPathsInput([...new Set(paths)].sort().join(', ')),
    [],
  );

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      const llmInput: ILlmInput = {
        userPrompt,
        projectRoot,
        relevantFiles: [], // Frontend doesn't provide file content; backend scans based on projectRoot and scanPaths.
        additionalInstructions,
        expectedOutputFormat,
        scanPaths: currentScanPathsArray, // Send only the paths for the backend to scan
        requestType: 'LLM_GENERATION',
        output: 'JSON',
      };
      console.log(llmInput, 'llmInput');
      const response = await plannerService.generatePlan(llmInput);
      setPlan(response.planId, response.plan);
      setCurrentPlanId(response.planId);
    } catch (err: any) {
      console.log(err, 'err');
      setError(err.message || 'Failed to generate plan.');
      setPlan(null, null); // Clear plan on error
    } finally {
      // setIsLoading(false); // Removed: setPlan and setError already handle setting isLoading to false.
    }
  };

  const handleClearPlan = () => {
    resetPlannerState();
    // Re-initialize temporary drawer state to reflect the reset plannerStore value
    setTempDrawerProjectRootInput(projectRootDirectoryStore.get() || '');
    setLocalScanPaths([]);
  };

  const handleSavePlanMetadata = useCallback(
    (updatedData: {
      title: string;
      summary?: string;
      thoughtProcess?: string;
      documentation?: string;
      gitInstructions?: string[];
    }) => {
      updateCurrentPlanMetadata(updatedData);
    },
    [],
  );

  const handleEditFileChangeRequest = useCallback(
    (index: number, change: IFileChange) => {
      setIsFileChangeEditorOpen(true);
      setEditingFileChange(change);
      setEditingFileChangeIndex(index);
    },
    [],
  );

  const handleSaveEditedFileChange = useCallback(
    (updatedChange: IFileChange) => {
      if (plan && editingFileChangeIndex !== null) {
        updateFileChange(plan.id, editingFileChangeIndex, updatedChange);
      }
      setIsFileChangeEditorOpen(false);
      setEditingFileChange(null);
      setEditingFileChangeIndex(null);
    },
    [plan, editingFileChangeIndex],
  );

  // Action buttons for the DirectoryPickerDrawer
  const directoryPickerDrawerActions: GlobalAction[] = [
    {
      label: 'Cancel',
      color: 'inherit',
      variant: 'outlined',
      action: () => setIsProjectRootPickerDialogOpen(false),
      icon: <CloseIcon />,
    },
    {
      label: 'Select',
      color: 'primary',
      variant: 'contained',
      action: () => {
        handleLoadProject(tempDrawerProjectRootInput);
        setIsProjectRootPickerDialogOpen(false);
      },
      icon: <CheckIcon />,
      disabled: !tempDrawerProjectRootInput.trim(),
    },
  ];

  // Action buttons for the ScanPathsDrawer
  const scanPathsDrawerActions: GlobalAction[] = [
    {
      label: 'Cancel',
      color: 'inherit',
      variant: 'outlined',
      action: () => setIsScanPathsDialogOpen(false),
      icon: <CloseIcon />,
    },
    {
      label: 'Confirm',
      color: 'primary',
      variant: 'contained',
      action: () => {
        updateScanPaths(localScanPaths);
        setIsScanPathsDialogOpen(false);
      },
      icon: <CheckIcon />,
      disabled: false,
    },
  ];

  // Action buttons for the PlannerListDrawer
  const plannerListDrawerActions: GlobalAction[] = [
    { // Only a close button for now, as PlannerList handles navigation internally
      label: 'Close',
      action: () => setIsPlannerListDrawerOpen(false),
      icon: <CloseIcon />,
      color: 'inherit',
      variant: 'outlined',
    },
  ];

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setError(null); // Clear the error in the store when snackbar closes
  };

  return (
    <Box className="flex flex-col h-full overflow-hidden p-4 sm:p-6 lg:p-8">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        className="text-primary-light font-bold mb-6"
      >
        AI Plan Generator
      </Typography>

      <Card sx={styles.card} className="mb-6 flex-shrink-0">
        <CardContent sx={styles.formSection}>
          <Typography variant="h6" gutterBottom className="text-text-primary">
            Generate a New Plan
          </Typography>
          <TextField
            label="Enter your prompt for the AI"
            multiline
            rows={6}
            fullWidth
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            variant="outlined"
            disabled={isLoading}
            sx={{ mb: 2 }}
          />

          <Box className="flex justify-between items-center mt-2 flex-wrap gap-2">
            <Box className="flex flex-wrap gap-2">
              <Tooltip title="Select Project Root Directory">
                <IconButton
                  color="primary"
                  onClick={() => {
                    setTempDrawerProjectRootInput(projectRoot);
                    setIsProjectRootPickerDialogOpen(true);
                  }}
                  aria-label="select project root directory"
                  disabled={isLoading}
                >
                  <FolderOpenIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Manage AI Scan Paths">
                <IconButton
                  color="primary"
                  onClick={() => setIsScanPathsDialogOpen(true)}
                  aria-label="manage ai scan paths"
                  disabled={isLoading}
                >
                  <AddRoadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Existing Plans">
                <IconButton
                  color="primary"
                  onClick={() => setIsPlannerListDrawerOpen(true)}
                  aria-label="view existing plans"
                  disabled={isLoading}
                >
                  <ListAltIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box className="flex flex-wrap gap-2">
              <Tooltip title="Edit AI Instructions (System Prompt)">
                <IconButton
                  color="primary"
                  onClick={() => setIsAiInstructionDrawerOpen(true)}
                  aria-label="edit ai instructions"
                  disabled={isLoading}
                >
                  <DescriptionIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Expected Output Format (JSON Schema)">
                <IconButton
                  color="primary"
                  onClick={() => setIsExpectedOutputDrawerOpen(true)}
                  aria-label="edit expected output format"
                  disabled={isLoading}
                >
                  <SchemaIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box className="flex justify-end gap-2 mt-4">
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClearPlan}
              disabled={isLoading && !plan}
            >
              Clear Plan
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGeneratePlan}
              disabled={isLoading || !userPrompt.trim() || !projectRoot.trim()}
              startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
              sx={styles.generateButton}
            >
              {isLoading ? 'Generating Plan...' : 'Generate Plan'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box className="flex-grow flex items-center justify-center">
          <Loading type="circular" message="Generating Plan..." />
        </Box>
      ) : plan ? (
        <Box className="flex-grow overflow-y-auto pt-4">
          <PlanDisplay
            plan={plan}
            onEditPlanMetadata={() => setIsPlanMetadataEditorOpen(true)}
            onEditFileChange={handleEditFileChangeRequest}
          />
        </Box>
      ) : (
        <Box className="flex-grow flex items-center justify-center pt-4">
          <Typography variant="h6" color="text.secondary">
            Enter a prompt and click "Generate Plan" to begin.
          </Typography>
        </Box>
      )}

      <CustomDrawer
        open={isProjectRootPickerDialogOpen}
        onClose={() => setIsProjectRootPickerDialogOpen(false)}
        position="right"
        size="normal"
        title="Select Project Root Folder"
        hasBackdrop={true}
        footerActionButton={directoryPickerDrawerActions}
      >
        <DirectoryPickerDrawer
          onSelect={(path) => {
            /* This onSelect is now primarily handled by the footer actions. */
          }}
          onClose={() => setIsProjectRootPickerDialogOpen(false)}
          initialPath={tempDrawerProjectRootInput || '/'}
          allowExternalPaths
          onPathUpdate={setTempDrawerProjectRootInput}
        />
      </CustomDrawer>

      <CustomDrawer
        open={isScanPathsDialogOpen}
        onClose={() => setIsScanPathsDialogOpen(false)}
        position="right"
        size="normal"
        title="Manage AI Scan Paths"
        hasBackdrop={true}
        footerActionButton={scanPathsDrawerActions}
      >
        <ScanPathsDrawer
          currentScanPaths={currentScanPathsArray}
          availablePaths={scanPathAutocompleteOptions}
          allowExternalPaths
          onLocalPathsChange={setLocalScanPaths}
        />
      </CustomDrawer>

      <InstructionEditorDrawer
        open={isAiInstructionDrawerOpen}
        onClose={() => setIsAiInstructionDrawerOpen(false)}
        type="ai"
      />

      <InstructionEditorDrawer
        open={isExpectedOutputDrawerOpen}
        onClose={() => setIsExpectedOutputDrawerOpen(false)}
        type="expected"
      />

      {plan && (
        <PlanMetadataEditorDrawer
          open={isPlanMetadataEditorOpen}
          onClose={() => setIsPlanMetadataEditorOpen(false)}
          initialTitle={plan.title}
          initialSummary={plan.summary}
          initialThoughtProcess={plan.thoughtProcess}
          initialDocumentation={plan.documentation}
          initialGitInstructions={plan.gitInstructions}
          onSave={handleSavePlanMetadata}
        />
      )}

      {editingFileChange && (
        <FileChangeEditorDrawer
          open={isFileChangeEditorOpen}
          onClose={() => setIsFileChangeEditorOpen(false)}
          initialFileChange={editingFileChange}
          onSave={handleSaveEditedFileChange}
        />
      )}

      {/* New CustomDrawer for PlannerList */}
      <CustomDrawer
        open={isPlannerListDrawerOpen}
        onClose={() => setIsPlannerListDrawerOpen(false)}
        position="right"
        size="large" // Adjusted size to 'large' to better display the table
        title="Existing AI Plans"
        hasBackdrop={true}
        footerActionButton={plannerListDrawerActions}
      >
        <PlannerList />
      </CustomDrawer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlanGenerator;
