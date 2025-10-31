import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import PlanGenerator from '@/components/planner/PlanGenerator';
import { resetPlannerState } from '@/components/planner/stores/plannerStore';

export const PlannerPage: React.FC = () => {
  // Reset planner state when the component mounts or unmounts
  useEffect(() => {
    resetPlannerState(); // Clear any previous plan state when entering the page
    return () => {
      resetPlannerState(); // Clear state when leaving the page
    };
  }, []);

  return (
    <Box className='h-full w-full overflow-hidden'>
      <PlanGenerator />
    </Box>
  );
};
