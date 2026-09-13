import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Avatar,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../hooks/useAuth';
import { useServices } from '../hooks/useServices';
import { useCounters } from '../hooks/useCounters';
import { useQueue } from '../hooks/useQueue';
import { useEstimation } from '../hooks/useEstimation';
import EstimationCard from '../components/EstimationCard';
import { CounterStatusBadge } from '../components/StatusBadge';
import { SERVICE_ICONS } from '../utils/constants';

export function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { studentSessionId, studentName, studentId, studentUser, setStudentName } = useAuth();
  const { services, servicesMap } = useServices();
  const { counters, getCountersForService } = useCounters();
  const { joinQueue, getStudentActiveEntry, queueEntries } = useQueue();

  const service = useMemo(() => services.find(s => s.id === serviceId), [services, serviceId]);
  const supportedCounters = useMemo(() => getCountersForService(serviceId), [getCountersForService, serviceId]);

  const [selectedCounterId, setSelectedCounterId] = useState(
    supportedCounters.length > 0 ? supportedCounters[0].id : ''
  );
  const [nameInput, setNameInput] = useState(studentName || '');
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    if (!selectedCounterId && supportedCounters.length > 0) {
      setSelectedCounterId(supportedCounters[0].id);
    }
  }, [supportedCounters, selectedCounterId]);

  const targetCounterId = selectedCounterId || supportedCounters[0]?.id;
  const currentCounter = useMemo(() => counters.find(c => c.id === targetCounterId), [counters, targetCounterId]);
  const isCounterClosed = currentCounter ? currentCounter.status === 'CLOSED' : (supportedCounters.length > 0 && supportedCounters.every(c => c.status === 'CLOSED'));
  const isCounterExplicitlyOpen = currentCounter ? currentCounter.status === 'OPEN' : supportedCounters.some(c => c.status === 'OPEN');

  const activeEntry = useMemo(() => {
    return getStudentActiveEntry(studentSessionId, studentId);
  }, [studentSessionId, studentId, getStudentActiveEntry, queueEntries]);


  const estimationRaw = useEstimation(serviceId, selectedCounterId || (supportedCounters[0]?.id));

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

  if (!service) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">Service not found.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const icon = SERVICE_ICONS[service.name] || SERVICE_ICONS.default;

  const handleJoinQueue = async () => {
    setJoinError(null);

    if (activeEntry) {
      setJoinError(`You already have active Token #${activeEntry.tokenNumber}. You cannot generate another token.`);
      return;
    }

    const counterId = selectedCounterId || supportedCounters[0]?.id;
    if (!counterId) {
      setJoinError('No counter available for this service right now.');
      return;
    }

    if (isCounterClosed) {
      setJoinError('Counter is currently closed. Cannot join queue.');
      return;
    }

    if (estimationData?.feasibility === 'TOO_LATE') {
      setJoinError('Operating hours have ended for today. Token generation is closed.');
      return;
    }

    try {
      const finalName = nameInput.trim() || studentName || 'Student';
      const sId = studentId || 'N/A';
      const sUid = studentUser?.uid || studentSessionId;

      const newEntry = await joinQueue(
        sId,
        finalName,
        service.id,
        counterId,
        sUid
      );

      if (newEntry) {
        navigate(`/student/live/${newEntry.id}`);
      }
    } catch (err) {
      console.error('Join queue error:', err);
      // Show user-friendly messages instead of raw Firebase errors
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        setJoinError("You don't have permission to join this queue. Please sign in again or contact staff.");
      } else if (err?.message?.includes('sign in') || err?.message?.includes('authentication') || err?.message?.includes('auth')) {
        setJoinError('Please sign in again before joining the queue.');
      } else {
        setJoinError(err.message || 'Could not join queue. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/student')}
        sx={{ mb: 3, textTransform: 'none', color: 'text.secondary' }}
      >
        Back to Services
      </Button>

      {joinError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setJoinError(null)}>
          {joinError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column: Service Details */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  fontSize: '2rem',
                  bgcolor: 'primary.main',
                  background: 'linear-gradient(135deg, #1a73e8 0%, #7c4dff 100%)',
                }}
              >
                {icon}
              </Avatar>
              <Box>
                <Chip label={service.category || 'General'} size="small" color="primary" variant="outlined" sx={{ mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700}>
                  {service.name}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {service.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Supported Counters */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Serving Counter Options
            </Typography>

            {supportedCounters.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
                No counter is currently serving this service.
              </Alert>
            ) : (
              <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <InputLabel>Select Preferred Counter</InputLabel>
                <Select
                  value={selectedCounterId || (supportedCounters[0]?.id || '')}
                  label="Select Preferred Counter"
                  onChange={(e) => setSelectedCounterId(e.target.value)}
                >
                  {supportedCounters.map(counter => (
                    <MenuItem key={counter.id} value={counter.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                        <span>{counter.name} ({counter.code})</span>
                        <CounterStatusBadge status={counter.status} />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Documents & Requirements */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
              Required Documents & Prerequisites
            </Typography>

            {service.requiredDocuments && service.requiredDocuments.length > 0 ? (
              <List>
                {service.requiredDocuments.map((doc, idx) => (
                  <ListItem key={idx} disablePadding sx={{ py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={<Typography variant="body2">{doc}</Typography>} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No specific documents listed. Please bring your official Student ID card.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Queue Estimator & Join Action */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                Service-Aware Wait Estimate
              </Typography>
              <EstimationCard estimation={estimationData} showDetails={true} />
            </Box>

            {activeEntry ? (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '2px solid', borderColor: 'warning.main', bgcolor: 'warning.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <ConfirmationNumberIcon color="warning" />
                  <Typography variant="subtitle1" fontWeight={800} color="warning.dark">
                    Token Generation Unavailable 🔒
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                  You already have active <strong>Token #{activeEntry.tokenNumber}</strong> in the queue for <strong>{servicesMap?.[activeEntry.serviceId]?.name || 'Academic Service'}</strong>. You cannot generate another token until your active token is completed or cancelled.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(`/student/live/${activeEntry.id}`)}
                  sx={{ borderRadius: 3, py: 1.2, fontWeight: 700, textTransform: 'none', color: '#0f172a' }}
                >
                  Track Active Token #{activeEntry.tokenNumber}
                </Button>
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom align="center">
                  Join Queue Immediately 🚀
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} align="center">
                  Get your digital token instantly. Enter your name or student ID below.
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  label="Your Name or Student ID (Optional)"
                  placeholder="e.g. Aditya Raj or ST-8492"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<ConfirmationNumberIcon />}
                  disabled={supportedCounters.length === 0 || isCounterClosed || estimationData?.feasibility === 'TOO_LATE'}
                  onClick={handleJoinQueue}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'none',
                    background: (isCounterClosed || estimationData?.feasibility === 'TOO_LATE')
                      ? '#94a3b8'
                      : 'linear-gradient(135deg, #1a73e8 0%, #1565c0 100%)',
                    boxShadow: (isCounterClosed || estimationData?.feasibility === 'TOO_LATE') ? 'none' : '0 4px 14px rgba(26, 115, 232, 0.3)',
                  }}
                >
                  {supportedCounters.length === 0
                    ? 'No Counter Available'
                    : isCounterClosed
                    ? 'Counter Closed - Cannot Join'
                    : estimationData?.feasibility === 'TOO_LATE'
                    ? 'Operating Hours Ended - Cannot Join'
                    : 'Get Digital Token Now'}
                </Button>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ServiceDetails;
