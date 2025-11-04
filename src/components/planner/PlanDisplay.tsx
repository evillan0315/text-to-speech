import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Button,
  CircularProgress,
  Link as MuiLink,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import { plannerStore, setApplyStatus } from './stores/plannerStore';
import { plannerService } from './api/plannerService';
import { IPlan } from './types'; // Updated import
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface PlanDisplayProps {
  plan: IPlan; // Updated prop type
}

type ChangeApplyStatus = 'idle' | 'applying' | 'success' | 'failure';

const styles = {
  card: {
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
  },
  sectionTitle: {
    marginBottom: 1,
    color: 'primary.main',
    fontWeight: 'bold',
  },
  tableContainer: {
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableHeadCell: {
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 2,
    borderRadius: '8px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '300px',
    overflowY: 'auto',
    color: 'text.secondary',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: '12px',
  },
};

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
  const { applyStatus, applyError, projectRoot } = useStore(plannerStore);
  const [individualChangeStatus, setIndividualChangeStatus] = useState<Map<number, { status: ChangeApplyStatus; error: string | null }>>(
    new Map()
  );

  const handleApplyPlan = async () => {
    if (!plan || !plan.id) {
      setApplyStatus('failure', 'No plan available to apply or plan ID is missing.');
      return;
    }
    setApplyStatus('applying');
    try {
      const result = await plannerService.applyPlan(plan, projectRoot);
      if (result.ok) {
        setApplyStatus('success');
        // Optionally update individual statuses if all are successful
        const newStatuses = new Map(individualChangeStatus);
        plan.changes.forEach((_, index) => {
          newStatuses.set(index, { status: 'success', error: null });
        });
        setIndividualChangeStatus(newStatuses);
      } else {
        setApplyStatus('failure', result.error || 'Failed to apply plan.');
      }
    } catch (err: any) {
      setApplyStatus('failure', err.message || 'An unexpected error occurred during application.');
    }
  };

  const handleApplySingleChange = async (changeIndex: number) => {
    if (!plan || !plan.id) {
      setIndividualChangeStatus((prev) =>
        new Map(prev).set(changeIndex, { status: 'failure', error: 'No plan available.' })
      );
      return;
    }

    setIndividualChangeStatus((prev) =>
      new Map(prev).set(changeIndex, { status: 'applying', error: null })
    );

    try {
      const result = await plannerService.applyFileChange(plan.id, changeIndex, projectRoot);
      if (result.ok) {
        setIndividualChangeStatus((prev) =>
          new Map(prev).set(changeIndex, { status: 'success', error: null })
        );
      } else {
        setIndividualChangeStatus((prev) =>
          new Map(prev).set(changeIndex, { status: 'failure', error: result.error || 'Failed to apply change.' })
        );
      }
    } catch (err: any) {
      setIndividualChangeStatus((prev) =>
        new Map(prev).set(changeIndex, { status: 'failure', error: err.message || 'An unexpected error occurred.' })
      );
    }
  };

  return (
    <Box className='space-y-6' sx={{ position: 'relative' }}>
      {applyStatus === 'applying' && (
        <Box sx={styles.loadingOverlay}>
          <CircularProgress color='primary' size={60} />
          <Typography variant='h6' color='primary.contrastText' sx={{ mt: 2 }}>
            Applying Plan...
          </Typography>
        </Box>
      )}

      <Card sx={styles.card}>
        <CardContent>
          <Typography variant='h5' component='h2' gutterBottom sx={styles.sectionTitle}>
            {plan.title}
          </Typography>
          {plan.summary && (
            <Typography variant='body1' paragraph color='text.secondary'>
              {plan.summary}
            </Typography>
          )}
          {plan.thoughtProcess && (
            <Box mb={2}>
              <Typography variant='h6' sx={styles.sectionTitle}>Thought Process</Typography>
              <Typography variant='body2' color='text.secondary' sx={styles.codeBlock}>
                {plan.thoughtProcess}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {plan.documentation && (
        <Card sx={styles.card}>
          <CardContent>
            <Typography variant='h6' sx={styles.sectionTitle}>Documentation</Typography>
            <Typography variant='body2' color='text.secondary' sx={styles.codeBlock}>
              {plan.documentation}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={styles.card}>
        <CardContent>
          <Typography variant='h6' sx={styles.sectionTitle}>File Changes ({plan.changes.length})</Typography>
          {plan.changes.length > 0 ? (
            <TableContainer sx={styles.tableContainer} className='max-h-[400px]'>
              <Table stickyHeader size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={styles.tableHeadCell}>File Path</TableCell>
                    <TableCell sx={styles.tableHeadCell}>Action</TableCell>
                    <TableCell sx={styles.tableHeadCell}>Reason</TableCell>
                    <TableCell sx={styles.tableHeadCell}>Apply</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plan.changes.map((change, index) => {
                    const status = individualChangeStatus.get(index)?.status || 'idle';
                    const error = individualChangeStatus.get(index)?.error;
                    return (
                      <TableRow key={index} hover>
                        <TableCell>{change.filePath}</TableCell>
                        <TableCell>
                          <Chip
                            label={change.action}
                            color=
                              {
                                change.action === 'ADD'
                                  ? 'success'
                                  : change.action === 'MODIFY'
                                  ? 'info'
                                  : change.action === 'DELETE'
                                  ? 'error'
                                  : 'default'
                              }
                            size='small'
                          />
                        </TableCell>
                        <TableCell>{change.reason || '-'}</TableCell>
                        <TableCell sx={{ minWidth: '120px' }}>
                          {status === 'applying' ? (
                            <CircularProgress size={20} color='inherit' />
                          ) : status === 'success' ? (
                            <Tooltip title='Applied successfully'>
                              <CheckCircleOutlineIcon color='success' />
                            </Tooltip>
                          ) : status === 'failure' ? (
                            <Tooltip title={error || 'Failed to apply'}>
                              <ErrorOutlineIcon color='error' />
                            </Tooltip>
                          ) : (
                            <Tooltip title='Apply this change'>
                              <IconButton
                                onClick={() => handleApplySingleChange(index)}
                                size='small'
                                color='primary'
                                aria-label={`apply change ${index}`}
                              >
                                <RocketLaunchIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant='body2' color='text.secondary'>No file changes proposed.</Typography>
          )}
        </CardContent>
      </Card>

      {plan.gitInstructions && plan.gitInstructions.length > 0 && (
        <Card sx={styles.card}>
          <CardContent>
            <Typography variant='h6' sx={styles.sectionTitle}>Git Instructions</Typography>
            <Box sx={styles.codeBlock}>
              {plan.gitInstructions.map((instruction, index) => (
                <Typography key={index} variant='body2' color='text.secondary'>
                  {instruction}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      <Box className='flex justify-end p-4'>
        <Button
          variant='contained'
          color='primary'
          onClick={handleApplyPlan}
          disabled={applyStatus === 'applying'}
          startIcon={applyStatus === 'applying' && <CircularProgress size={20} color='inherit' />}
        >
          {applyStatus === 'applying' ? 'Applying Plan...' : 'Apply Plan'}
        </Button>
      </Box>

      {applyStatus === 'success' && (
        <Alert severity='success' className='mt-4'>Plan applied successfully! Please check your project directory.</Alert>
      )}
      {applyStatus === 'failure' && (
        <Alert severity='error' className='mt-4'>Error applying plan: {applyError}</Alert>
      )}
    </Box>
  );
};

export default PlanDisplay;
