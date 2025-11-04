import React from 'react';
import { Box } from '@mui/material';
import PlanGenerator from '@/components/planner/PlanGenerator';

export const PlannerPage: React.FC = () => {
  // Removed the useEffect that called resetPlannerState on mount/unmount.
  // Planner state (like projectRoot, scanPaths, instructions) should persist
  // throughout the user's session until explicitly cleared by the user (e.g., via 'Clear Plan' button)
  // or browser refresh. The plannerStore now correctly manages its initial state from defaults
  // or persistent storage (for projectRoot).

  return (
    <Box className="h-full w-full overflow-hidden p-2">
      <PlanGenerator />
    </Box>
  );
};
