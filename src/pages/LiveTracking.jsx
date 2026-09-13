import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TokenDisplay from '../components/TokenDisplay';
import EstimationCard from '../components/EstimationCard';
import QueueProgress from '../components/QueueProgress';
import { useQueue } from '../hooks/useQueue';
import { useServices } from '../hooks/useServices';
import { useCounters } from '../hooks/useCounters';
import { useEstimation } from '../hooks/useEstimation';
import { QueueStatusBadge } from '../components/StatusBadge';

export function LiveTracking() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { queueEntries, cancelEntry, getActiveQueueForCounter } = useQueue();
  const { servicesMap } = useServices();
  const { counters } = useCounters();

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const entry = useMemo(() => queueEntries.find(e => e.id === entryId), [queueEntries, entryId]);

  const counter = useMemo(() => {
    return entry ? counters.find(c => c.id === entry.counterId) : null;
  }, [entry, counters]);

  const service = useMemo(() => {
    return entry ? servicesMap[entry.serviceId] : null;
  }, [entry, servicesMap]);

  const activeQueueForCounter = useMemo(() => {
    return entry ? getActiveQueueForCounter(entry.counterId) : [];
  }, [entry, getActiveQueueForCounter, queueEntries]);

  const estimationRaw = useEstimation(entry?.serviceId, entry?.counterId, entryId);

  const estimationData = useMemo(() => {
    if (!service) return null;
    return {
      peopleAhead: estimationRaw.peopleAheadCount,
      estimatedWaitMinutes: estimationRaw.estimatedWaitMinutes,
      estimatedServiceMinutes: service.averageProcessingTime || 5,
      estimatedServiceStart: new Date(Date.now() + estimationRaw.estimatedWaitMinutes * 60000),
      estimatedCompletion: estimationRaw.estimatedCompletionTime,
      feasibility: estimationRaw.feasibility,
      confidence: estimationRaw.confidence,
      closingTime: estimationRaw.closingTime,
    };
  }, [service, estimationRaw]);

  if (!entry) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="warning">Token entry not found or has been cleared.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const isCalled = entry.status === 'CALLED';
  const isInService = entry.status === 'IN_SERVICE';
  const isCompleted = entry.status === 'COMPLETED';
  const isCancelled = entry.status === 'CANCELLED' || entry.status === 'SKIPPED';

  const handleConfirmCancel = () => {
    cancelEntry(entryId);
    setConfirmCancelOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/student')}
        sx={{ mb: 3, textTransform: 'none', color: 'text.secondary' }}
      >
        Back to Dashboard
      </Button>

      {/* Called Banner Alert */}
      {isCalled && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            bgcolor: '#fef9c3',
            border: '2px solid #eab308',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            animation: 'pulse 2s infinite',
          }}
        >
          <NotificationsActiveIcon sx={{ fontSize: 40, color: '#ca8a04' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} color="#854d0e">
              YOUR TOKEN HAS BEEN CALLED! 📢
            </Typography>
            <Typography variant="body1" color="#a16207">
              Please proceed immediately to <strong>{counter?.name || 'the serving counter'} ({counter?.code})</strong>.
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Completed Banner */}
      {isCompleted && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            bgcolor: '#f0fdf4',
            border: '1px solid #86efac',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color="success.dark">
              Service Completed!
            </Typography>
            <Typography variant="body2" color="success.dark">
              Thank you for using the Campus Service Queue Management System.
            </Typography>
          </Box>
        </Paper>
      )}

      <Grid container spacing={4}>
        {/* Left Column: Token Card & Queue Movement */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <TokenDisplay
              tokenNumber={entry.tokenNumber}
              position={estimationRaw.peopleAheadCount + 1}
            />

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Token Status
                  </Typography>
                  <QueueStatusBadge status={entry.status} />
                </Box>

                <Stack spacing={1.5} sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon fontSize="small" color="primary" />
                    <span>Serving Counter: <strong>{counter?.name} ({counter?.code})</strong></span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Service: <strong>{service?.name}</strong></span>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Live Queue Movement
                </Typography>
                <QueueProgress entries={activeQueueForCounter} currentEntryId={entryId} />
              </CardContent>
            </Card>

            {!isCompleted && !isCancelled && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setConfirmCancelOpen(true)}
                fullWidth
                sx={{ borderRadius: 3, py: 1.2, textTransform: 'none' }}
              >
                Leave Queue / Cancel Token
              </Button>
            )}
          </Stack>
        </Grid>

        {/* Right Column: Live Service-Aware Estimates */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Real-Time Completion Estimates
          </Typography>
          <EstimationCard estimation={estimationData} showDetails={true} />
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={confirmCancelOpen} onClose={() => setConfirmCancelOpen(false)} paperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Leave Queue?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel token <strong>{entry.tokenNumber}</strong>? Your spot in line will be forfeited and given to the next student.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setConfirmCancelOpen(false)}>Keep Token</Button>
          <Button variant="contained" color="error" onClick={handleConfirmCancel}>
            Yes, Leave Queue
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LiveTracking;
