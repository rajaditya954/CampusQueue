import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useAuth } from '../hooks/useAuth';
import { useQueue } from '../hooks/useQueue';
import { useCounters } from '../hooks/useCounters';
import { useServices } from '../hooks/useServices';
import { CounterStatusBadge, QueueStatusBadge } from '../components/StatusBadge';
import { formatTime, formatDuration } from '../utils/formatters';
import { isDemoMode } from '../firebase/config';
import { seedFirestore, clearDemoData, clearAllQueueEntries } from '../utils/firestoreSeed';

export function AdminDashboard() {
  const { user } = useAuth();
  const { counters, setCounterStatus, error: countersError } = useCounters();
  const { servicesMap, error: servicesError } = useServices();
  const {
    queueEntries,
    callNext,
    startService,
    completeService,
    skipEntry,
    markNoShow,
    getCurrentlyServing,
    getCalledEntry,
    getActiveQueueForCounter,
    error: queueError,
  } = useQueue();

  const firestoreError = servicesError || countersError || queueError;

  const [selectedCounterId, setSelectedCounterId] = useState('ALL');

  useEffect(() => {
    if (!selectedCounterId && counters.length > 0) {
      setSelectedCounterId('ALL');
    }
  }, [counters, selectedCounterId]);

  const activeCounter = useMemo(() => {
    if (selectedCounterId === 'ALL') {
      return {
        id: 'ALL',
        name: 'All Counter Stations (Global Real-Time Queue)',
        code: 'ALL',
        status: 'OPEN',
      };
    }
    return counters.find(c => c.id === selectedCounterId) || counters[0] || { id: 'ALL', name: 'Global Queue', status: 'OPEN' };
  }, [counters, selectedCounterId]);

  const currentlyServing = useMemo(() => {
    if (!activeCounter) return null;
    if (activeCounter.id === 'ALL') {
      return queueEntries.find(e => e.status === 'IN_SERVICE') || null;
    }
    return getCurrentlyServing(activeCounter.id);
  }, [activeCounter, getCurrentlyServing, queueEntries]);

  const calledEntry = useMemo(() => {
    if (!activeCounter) return null;
    if (activeCounter.id === 'ALL') {
      return queueEntries.find(e => e.status === 'CALLED') || null;
    }
    return getCalledEntry(activeCounter.id);
  }, [activeCounter, getCalledEntry, queueEntries]);

  const activeQueue = useMemo(() => {
    if (!activeCounter) return [];
    if (activeCounter.id === 'ALL') {
      return queueEntries.filter(e => ['WAITING', 'CALLED', 'IN_SERVICE'].includes(e.status));
    }
    return getActiveQueueForCounter(activeCounter.id);
  }, [activeCounter, getActiveQueueForCounter, queueEntries]);

  const waitingQueue = useMemo(() => {
    return activeQueue.filter(e => e.status === 'WAITING');
  }, [activeQueue]);

  // Workload estimation for this counter
  const totalWorkloadMinutes = useMemo(() => {
    return activeQueue.reduce((sum, entry) => {
      const svc = servicesMap[entry.serviceId];
      return sum + (svc?.averageProcessingTime || 5);
    }, 0);
  }, [activeQueue, servicesMap]);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState(null);

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedStatus(null);
    try {
      const res = await seedFirestore();
      if (res.skipped) {
        setSeedStatus({ severity: 'info', message: 'Firestore already has existing data (seeding skipped).' });
      } else {
        setSeedStatus({ severity: 'success', message: `Successfully seeded Firestore! Created ${res.servicesCount} services and ${res.countersCount} counters.` });
      }
    } catch (err) {
      console.error('Seed error:', err);
      setSeedStatus({ severity: 'error', message: `Failed to seed Firestore: ${err.message}` });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearQueue = async () => {
    setIsSeeding(true);
    setSeedStatus(null);
    try {
      const count = await clearAllQueueEntries();
      setSeedStatus({ severity: 'success', message: `Successfully cleared ${count} queue tokens. Queue is now completely fresh!` });
    } catch (err) {
      console.error('Clear queue error:', err);
      setSeedStatus({ severity: 'error', message: `Failed to clear queue: ${err.message}` });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Background Ambient Glowing Color Orbs */}
      <Box
        sx={{
          position: 'fixed',
          top: '-10%',
          right: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.01) 60%, transparent 80%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-10%',
          left: '-5%',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.07) 0%, rgba(124, 58, 237, 0.01) 60%, transparent 80%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Admin Header Title */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={800} color="#0f172a" gutterBottom sx={{ letterSpacing: '-0.025em', fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
            Counter Queue Controller 🎛️
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.875rem' }}>
            Live queue management, real-time token dispatcher, and counter operational status.
          </Typography>
        </Box>

        {/* Sleek Aligned Header Control Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justify: 'space-between',
            alignItems: { xs: 'stretch', lg: 'center' },
            gap: 2,
          }}
        >
          {/* Left: Active Counter Selector & Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flex: 1 }}>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 280 } }}>
              <Select
                value={selectedCounterId || 'ALL'}
                onChange={(e) => setSelectedCounterId(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  bgcolor: '#f8fafc',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                }}
              >
                <MenuItem value="ALL" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  🌟 All Counter Stations (Global Queue)
                </MenuItem>
                {counters.map(c => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.85rem' }}>
                    {c.name} {c.location ? `(${c.location.split(',')[0]})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {activeCounter && (
              <CounterStatusBadge status={activeCounter.status} />
            )}
          </Box>

          {/* Right: Master Queue Action Buttons */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteSweepIcon sx={{ fontSize: '0.9rem !important' }} />}
              onClick={handleClearQueue}
              disabled={isSeeding}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 600,
                py: 0.8,
                px: 2,
                fontSize: '0.82rem',
                color: '#dc2626',
                borderColor: '#fca5a5',
                bgcolor: 'rgba(220, 38, 38, 0.02)',
                '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.08)', borderColor: '#ef4444' },
              }}
            >
              {isSeeding ? 'Clearing Queue...' : 'Clear All Tokens'}
            </Button>

            {!isDemoMode && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<StorageIcon sx={{ fontSize: '0.9rem !important' }} />}
                onClick={handleSeedData}
                disabled={isSeeding}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 0.8,
                  px: 2,
                  fontSize: '0.82rem',
                  color: '#2563eb',
                  borderColor: '#93c5fd',
                  bgcolor: 'rgba(37, 99, 235, 0.02)',
                  '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)', borderColor: '#3b82f6' },
                }}
              >
                {isSeeding ? 'Seeding Firestore...' : 'Seed Master Data'}
              </Button>
            )}
          </Stack>
        </Paper>

        {firestoreError && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Firestore Permissions Warning
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {firestoreError}. Please update your <strong>Cloud Firestore Security Rules</strong> in the Firebase Console to allow client read/write access.
            </Typography>
          </Alert>
        )}

        {seedStatus && (
          <Alert severity={seedStatus.severity} onClose={() => setSeedStatus(null)} sx={{ mb: 3, borderRadius: 3 }}>
            {seedStatus.message}
          </Alert>
        )}

        {activeCounter && (
          <Grid container spacing={3.5}>
            {/* Main Action Panel: Serving / Called / Next */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3}>
                {/* Currently Serving Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3.5 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: currentlyServing ? 'rgba(22, 163, 74, 0.4)' : '#e2e8f0',
                    bgcolor: currentlyServing ? 'rgba(240, 253, 244, 0.6)' : '#ffffff',
                    boxShadow: currentlyServing ? '0 4px 20px -2px rgba(22, 163, 74, 0.12)' : '0 1px 3px rgba(15, 23, 42, 0.03)',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="caption" color="#475569" fontWeight={800} letterSpacing={1} sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      CURRENTLY AT COUNTER (IN SERVICE)
                    </Typography>
                    {currentlyServing && <QueueStatusBadge status={currentlyServing.status} />}
                  </Box>

                  {currentlyServing ? (
                    <Box>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
                        <Box>
                          <Typography variant="h3" fontWeight={900} color="#16a34a" sx={{ fontFamily: 'monospace', letterSpacing: '-0.03em', mb: 0.5 }}>
                            {currentlyServing.tokenNumber}
                          </Typography>
                          <Typography variant="h6" fontWeight={800} color="#0f172a">
                            {currentlyServing.studentName}
                          </Typography>
                          <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.85rem', mt: 0.5 }}>
                            Service Requested: <strong style={{ color: '#0f172a' }}>{servicesMap[currentlyServing.serviceId]?.name || 'General Service'}</strong>
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
                        onClick={() => completeService(currentlyServing.id)}
                        sx={{
                          py: 1,
                          px: 3,
                          borderRadius: 2.5,
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          textTransform: 'none',
                          bgcolor: '#16a34a',
                          boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                          '&:hover': { bgcolor: '#15803d', boxShadow: '0 6px 18px rgba(22, 163, 74, 0.4)' },
                        }}
                      >
                        Complete Service & Record Time
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ py: 3, px: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px stroke #cbd5e1', borderStyle: 'dashed', textAlign: 'center' }}>
                      <PersonOffIcon sx={{ fontSize: '2.2rem', color: '#94a3b8', mb: 0.5 }} />
                      <Typography variant="subtitle2" fontWeight={700} color="#334155">
                        No Student Currently In Service
                      </Typography>
                      <Typography variant="caption" color="#64748b">
                        Call the next waiting token to begin serving a student at this counter.
                      </Typography>
                    </Box>
                  )}
                </Paper>

                {/* Called Token Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3.5 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: calledEntry ? 'rgba(217, 119, 6, 0.4)' : '#e2e8f0',
                    bgcolor: calledEntry ? 'rgba(255, 251, 235, 0.6)' : '#ffffff',
                    boxShadow: calledEntry ? '0 4px 20px -2px rgba(217, 119, 6, 0.12)' : '0 1px 3px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="caption" color="#475569" fontWeight={800} letterSpacing={1} sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      CALLED TOKEN (WAITING TO APPROACH)
                    </Typography>
                    {calledEntry && <QueueStatusBadge status={calledEntry.status} />}
                  </Box>

                  {calledEntry ? (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box>
                          <Typography variant="h4" fontWeight={900} color="#d97706" sx={{ fontFamily: 'monospace', letterSpacing: '-0.02em', mb: 0.5 }}>
                            {calledEntry.tokenNumber}
                          </Typography>
                          <Typography variant="h6" fontWeight={800} color="#0f172a">
                            {calledEntry.studentName}
                          </Typography>
                          <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.85rem', mt: 0.5 }}>
                            Service: <strong style={{ color: '#0f172a' }}>{servicesMap[calledEntry.serviceId]?.name || 'Service'}</strong>
                          </Typography>
                        </Box>
                      </Box>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowIcon sx={{ fontSize: '1rem !important' }} />}
                          onClick={() => startService(calledEntry.id)}
                          sx={{
                            borderRadius: 2.5,
                            fontWeight: 700,
                            textTransform: 'none',
                            py: 1,
                            px: 2.5,
                            bgcolor: '#2563eb',
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                            '&:hover': { bgcolor: '#1d4ed8' },
                          }}
                        >
                          Start Service
                        </Button>

                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<PersonOffIcon sx={{ fontSize: '0.9rem !important' }} />}
                          onClick={() => markNoShow(calledEntry.id)}
                          sx={{ borderRadius: 2.5, textTransform: 'none', py: 1, px: 2, fontWeight: 700, fontSize: '0.82rem' }}
                        >
                          Mark No-Show
                        </Button>

                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<SkipNextIcon sx={{ fontSize: '0.9rem !important' }} />}
                          onClick={() => skipEntry(calledEntry.id)}
                          sx={{ borderRadius: 2.5, textTransform: 'none', py: 1, px: 2, fontWeight: 700, fontSize: '0.82rem' }}
                        >
                          Skip Token
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ py: 3, px: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px stroke #cbd5e1', borderStyle: 'dashed', textAlign: 'center' }}>
                      <CampaignIcon sx={{ fontSize: '2.2rem', color: '#94a3b8', mb: 0.5 }} />
                      <Typography variant="subtitle2" fontWeight={700} color="#334155">
                        No Token Currently Called
                      </Typography>
                      <Typography variant="caption" color="#64748b">
                        Tokens called by staff will display here before service begins.
                      </Typography>
                    </Box>
                  )}
                </Paper>

                {/* Waiting Queue List & Call Next */}
                <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 2.5 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={800} color="#0f172a">
                        Waiting Line ({waitingQueue.length})
                      </Typography>
                      <Typography variant="caption" color="#64748b">
                        Students ordered chronologically by check-in time
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      startIcon={<CampaignIcon sx={{ fontSize: '1.2rem !important' }} />}
                      disabled={waitingQueue.length === 0 || !!calledEntry || activeCounter.status !== 'OPEN'}
                      onClick={() => callNext(activeCounter.id)}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 800,
                        textTransform: 'none',
                        px: 3,
                        py: 1.1,
                        bgcolor: '#7c3aed',
                        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
                        '&:hover': { bgcolor: '#6d28d9' },
                      }}
                    >
                      Call Next Student 📢
                    </Button>
                  </Box>

                  <Divider sx={{ mb: 2.5 }} />

                  {waitingQueue.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <StorefrontIcon sx={{ fontSize: '2.5rem', color: '#cbd5e1', mb: 1 }} />
                      <Typography variant="subtitle1" fontWeight={700} color="#475569">
                        Queue is Currently Empty
                      </Typography>
                      <Typography variant="body2" color="#64748b">
                        No students are waiting in line for this counter station.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {waitingQueue.map((entry, idx) => (
                        <Paper
                          key={entry.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            justifyContent: 'space-between',
                            gap: 1.5,
                            bgcolor: idx === 0 ? 'rgba(37, 99, 235, 0.03)' : '#ffffff',
                            transition: 'all 0.15s ease',
                            '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, flexWrap: 'wrap' }}>
                            <Chip
                              label={`#${idx + 1}`}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                bgcolor: idx === 0 ? '#2563eb' : '#e2e8f0',
                                color: idx === 0 ? '#ffffff' : '#475569',
                              }}
                            />
                            <Typography variant="subtitle1" fontWeight={800} sx={{ fontFamily: 'monospace', color: '#0f172a', fontSize: '1rem' }}>
                              {entry.tokenNumber}
                            </Typography>
                            <Typography variant="subtitle2" fontWeight={700} color="#334155">
                              {entry.studentName}
                            </Typography>
                            <Chip
                              label={servicesMap[entry.serviceId]?.name || 'Service'}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: '0.72rem', borderColor: '#cbd5e1', color: '#475569' }}
                            />
                          </Box>

                          <Typography variant="caption" color="#64748b" fontWeight={500}>
                            Joined {formatTime(entry.joinedAt)}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Stack>
            </Grid>

            {/* Right Sidebar: Counter Workload & Status Switch */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={3.5}>
                <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: '#ffffff' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={800} color="#0f172a" gutterBottom>
                      Counter Workload Stats
                    </Typography>
                    <Divider sx={{ mb: 2.5 }} />

                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="#64748b" fontWeight={500}>Total Active Tokens:</Typography>
                        <Chip label={activeQueue.length} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="#64748b" fontWeight={500}>Est. Workload Duration:</Typography>
                        <Typography variant="subtitle2" fontWeight={800} color="#0f172a">{formatDuration(totalWorkloadMinutes)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="#64748b" fontWeight={500}>Operating Hours:</Typography>
                        <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                          {activeCounter.operatingHours?.open || '09:00'} - {activeCounter.operatingHours?.close || '17:00'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Counter Controls */}
                <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: '#ffffff' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={800} color="#0f172a" gutterBottom>
                      Counter Operational Controls
                    </Typography>
                    <Typography variant="body2" color="#64748b" sx={{ mb: 2.5, fontSize: '0.82rem' }}>
                      Change live operational mode for {activeCounter.name}.
                    </Typography>

                    <Stack spacing={1.5}>
                      <Button
                        fullWidth
                        variant={activeCounter.status === 'OPEN' ? 'contained' : 'outlined'}
                        color="success"
                        onClick={() => setCounterStatus(activeCounter.id, 'OPEN')}
                        sx={{ borderRadius: 2.5, py: 1.1, textTransform: 'none', fontWeight: 800, fontSize: '0.85rem' }}
                      >
                        OPEN COUNTER
                      </Button>

                      <Button
                        fullWidth
                        variant={activeCounter.status === 'PAUSED' ? 'contained' : 'outlined'}
                        color="warning"
                        onClick={() => setCounterStatus(activeCounter.id, 'PAUSED')}
                        sx={{ borderRadius: 2.5, py: 1.1, textTransform: 'none', fontWeight: 800, fontSize: '0.85rem' }}
                      >
                        PAUSE COUNTER (BREAK)
                      </Button>

                      <Button
                        fullWidth
                        variant={activeCounter.status === 'CLOSED' ? 'contained' : 'outlined'}
                        color="error"
                        onClick={() => setCounterStatus(activeCounter.id, 'CLOSED')}
                        sx={{ borderRadius: 2.5, py: 1.1, textTransform: 'none', fontWeight: 800, fontSize: '0.85rem' }}
                      >
                        CLOSE COUNTER FOR DAY
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default AdminDashboard;
