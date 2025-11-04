import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import PlanGenerator from '@/components/planner/PlanGenerator';
import { useParams } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import { plannerStore, loadPlanById, setCurrentPlanId, resetPlannerState } from '@/components/planner/stores/plannerStore';

export const PlannerPage: React.FC = () => {
  const { planId } = useParams<{ planId?: string }>();
  const { currentPlanId: storedPlanId } = useStore(plannerStore);

  useEffect(() => {
    // If a planId is in the URL and it's different from the currently loaded plan
    if (planId && planId !== storedPlanId) {
      console.log(`Loading plan with ID: ${planId}`);
      setCurrentPlanId(planId); // Set the currentPlanId in the store immediately
      loadPlanById(planId); // Then trigger the fetch
    } else if (!planId && storedPlanId) {
      // If navigating to /planner-generator without an ID, but a plan was previously loaded,
      // reset the state to ensure a fresh generation experience.
      console.log('Navigated to plan generator without ID, resetting planner state.');
      resetPlannerState();
    }
  }, [planId, storedPlanId]);

  return (
    <Box className="h-full w-full overflow-hidden">
      <PlanGenerator />
    </Box>
  );
};

