import React from 'react';
import { Box } from '@mui/material';
import PlanGenerator from '@/components/planner/PlanGenerator';
import { useSearchParams } from 'react-router-dom';

export const PlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planIdFromUrl = searchParams.get('planId');

  return (
    <Box className="h-full w-full overflow-hidden">
      <PlanGenerator initialPlanId={planIdFromUrl} />
    </Box>
  );
};
