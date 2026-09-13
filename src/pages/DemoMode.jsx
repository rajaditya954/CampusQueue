import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Card,
  CardContent,
  Divider,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ScienceIcon from '@mui/icons-material/Science';
import coverBg from '../assets/campus_cover_bg.png';
import { useDemo } from '../features/demo/DemoContext';
import { QueueStatusBadge, CounterStatusBadge } from '../components/StatusBadge';
import { formatTime } from '../utils/formatters';

export function DemoMode() {
  const navigate = useNavigate();
  const demo = useDemo();

  const services = demo.services || [];
  const counters = demo.counters || [];
  const queueEntries = demo.queueEntries || [];

  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedCounterId, setSelectedCounterId] = useState(counters[0]?.id || '');
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [simLog, setSimLog] = useState(['[SYSTEM] Demo environment initialized with live sample queue data.']);

  // Ensure default selections if state initializes empty
  useEffect(() => {
    if (!selectedServiceId && services.length > 0) {
      setSelectedServiceId(services[0].id);
    }
    if (!selectedCounterId && counters.length > 0) {
      setSelectedCounterId(counters[0].id);
    }
  }, [services, counters, selectedServiceId, selectedCounterId]);

  const currentCounterId = selectedCounterId || counters[0]?.id;
  const currentServiceId = selectedServiceId || services[0]?.id;

  const activeQueue = demo.getActiveQueueForCounter(currentCounterId);
  const currentlyServing = demo.getCurrentlyServing(currentCounterId);
  const calledEntry = demo.getCalledEntry(currentCounterId);

  const currentCounterObj = counters.find(c => c.id === currentCounterId) || counters[0];
  const currentServiceObj = services.find(s => s.id === currentServiceId) || services[0];

  const addLog = (msg) => {
    setSimLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const handleClearLog = () => {
    setSimLog([`[${new Date().toLocaleTimeString()}] Log cleared by user.`]);
  };

  // 1. Simulate Student Joining Queue
  const handleSimulateAddStudent = () => {
    const svcId = currentServiceId;
    const ctrId = currentCounterId;
    const randNum = Math.floor(100 + Math.random() * 900);
    const studentName = `Simulated Student ${randNum}`;
    try {
      const newEntry = demo.joinQueue(`sim-${Date.now()}`, studentName, svcId, ctrId);
      if (newEntry) {
        addLog(`Student "${studentName}" joined queue → Token ${newEntry.tokenNumber}`);
      }
    } catch (err) {
      addLog(`⚠️ Queue join note: ${err.message || 'Action processed'}`);
    }
  };

  // 2. Call Next Token
  const handleCallNext = () => {
    demo.callNext(currentCounterId);
    addLog(`📢 Staff called next token for ${currentCounterObj?.name || 'Counter'}`);
  };

  // 3. Start Service
  const handleStartService = () => {
    if (calledEntry) {
      demo.startService(calledEntry.id);
      addLog(`▶ Service started for Token ${calledEntry.tokenNumber}`);
    }
  };

  // 4. Complete Service
  const handleCompleteService = () => {
    if (currentlyServing) {
      demo.completeService(currentlyServing.id);
      addLog(`✓ Service completed for Token ${currentlyServing.tokenNumber}. Dynamic average processing time updated!`);
    }
  };

  // Auto-simulation step loop
  useEffect(() => {
    if (!autoSimulate) return;

    const timer = setInterval(() => {
      const ctrId = currentCounterId;
      const serving = demo.getCurrentlyServing(ctrId);
      const called = demo.getCalledEntry(ctrId);
      const active = demo.getActiveQueueForCounter(ctrId);

      if (serving) {
        demo.completeService(serving.id);
        addLog(`[AUTO-SIM] ✓ Completed service for Token ${serving.tokenNumber}`);
      } else if (called) {
        demo.startService(called.id);
        addLog(`[AUTO-SIM] ▶ Started service for Token ${called.tokenNumber}`);
      } else if (active.some(e => e.status === 'WAITING')) {
        demo.callNext(ctrId);
        addLog(`[AUTO-SIM] 📢 Called next student token`);
      } else {
        const svcId = services[Math.floor(Math.random() * services.length)]?.id || currentServiceId;
        const randNum = Math.floor(100 + Math.random() * 900);
        const newEntry = demo.joinQueue(`sim-${Date.now()}`, `Auto Student ${randNum}`, svcId, ctrId);
        if (newEntry) {
          addLog(`[AUTO-SIM] + New student joined with Token ${newEntry.tokenNumber}`);
        }
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [autoSimulate, currentCounterId, currentServiceId, services, demo]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a', position: 'relative' }}>
      {/* ─── Sleek Fixed Top Bar Header ──────────────────────────────────────── */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          py: 1.1,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          bgcolor: 'rgba(255, 255, 255, 0.92)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 2, sm: 3, md: 4 } }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#2563eb',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.78rem',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
              }}
            >
              CQ
            </Avatar>
            <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ fontSize: '0.92rem', letterSpacing: '-0.01em' }}>
              CampusQueue
            </Typography>
            <Chip
              icon={<ScienceIcon sx={{ fontSize: '0.75rem !important', color: '#2563eb !important' }} />}
              label="Demo Mode"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: 'rgba(37, 99, 235, 0.08)',
                color: '#2563eb',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                ml: 0.5,
              }}
            />
          </Box>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon sx={{ fontSize: '0.85rem !important' }} />}
            onClick={() => navigate('/')}
            sx={{
              borderRadius: 2,
              px: 1.8,
              py: 0.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              color: '#475569',
              borderColor: '#cbd5e1',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', borderColor: '#94a3b8', color: '#0f172a' },
            }}
          >
            Exit Demo
          </Button>
        </Container>
      </Box>

      {/* Background Ambient Glow & Overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: '-10%',
          right: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(37, 99, 235, 0.01) 60%, transparent 80%)',
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
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0.01) 60%, transparent 80%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ─── Main Content Container ──────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 }, pb: 7, position: 'relative', zIndex: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Banner Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 3.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                <AutoModeIcon sx={{ color: '#38bdf8', fontSize: 24 }} />
                <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' }, letterSpacing: '-0.01em', color: '#ffffff' }}>
                  Interactive Queue Simulator
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: 700 }}>
                Simulate student queue tokens, staff token calling, and real-time rolling average calculations in an isolated sandbox environment.
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={autoSimulate}
                  onChange={(e) => setAutoSimulate(e.target.checked)}
                  color="info"
                  size="small"
                />
              }
              label={
                <Typography variant="caption" fontWeight={700} sx={{ color: autoSimulate ? '#38bdf8' : '#94a3b8', fontSize: '0.8rem' }}>
                  Auto Loop: {autoSimulate ? 'ACTIVE' : 'OFF'}
                </Typography>
              }
              sx={{ bgcolor: 'rgba(255,255,255,0.06)', px: 1.8, py: 0.5, borderRadius: 2, m: 0 }}
            />
          </Box>
        </Paper>

        {/* 3-Column Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Column 1: Simulator Controls */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: '1rem', mb: 2 }}>
                Simulation Controls
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5} sx={{ flex: 1 }}>
                <Box>
                  <Typography variant="caption" color="#475569" fontWeight={800} letterSpacing={0.8} display="block" sx={{ mb: 1.5, textTransform: 'uppercase' }}>
                    TARGET COUNTER & SERVICE
                  </Typography>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="#334155" sx={{ mb: 0.6, fontSize: '0.8rem' }}>
                        Active Counter Station
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={currentCounterId}
                          onChange={(e) => setSelectedCounterId(e.target.value)}
                          displayEmpty
                          sx={{
                            borderRadius: 2.5,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            bgcolor: '#f8fafc',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                          }}
                        >
                          {counters.map(c => (
                            <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.82rem' }}>
                              {c.name} {c.location ? `(${c.location.split(',')[0]})` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <Typography variant="body2" fontWeight={700} color="#334155" sx={{ mb: 0.6, fontSize: '0.8rem' }}>
                        Requested Campus Service
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={currentServiceId}
                          onChange={(e) => setSelectedServiceId(e.target.value)}
                          displayEmpty
                          sx={{
                            borderRadius: 2.5,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            bgcolor: '#f8fafc',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                          }}
                        >
                          {services.map(s => (
                            <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.82rem' }}>
                              {s.name} ({s.averageProcessingTime || 5}m avg)
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Stack>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Stack spacing={1.5}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: '0.95rem !important' }} />}
                    onClick={handleSimulateAddStudent}
                    sx={{
                      py: 1.1,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      bgcolor: '#2563eb',
                      boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
                      '&:hover': { bgcolor: '#1d4ed8' },
                    }}
                  >
                    1. Simulate Student Join
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CampaignIcon sx={{ fontSize: '0.95rem !important' }} />}
                    disabled={!activeQueue.some(e => e.status === 'WAITING') || !!calledEntry}
                    onClick={handleCallNext}
                    sx={{
                      py: 1.1,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      bgcolor: '#7c3aed',
                      boxShadow: '0 3px 10px rgba(124, 58, 237, 0.25)',
                      '&:hover': { bgcolor: '#6d28d9' },
                      '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    2. Call Next Token
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayArrowIcon sx={{ fontSize: '0.95rem !important' }} />}
                    disabled={!calledEntry}
                    onClick={handleStartService}
                    sx={{
                      py: 1.1,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      bgcolor: '#d97706',
                      boxShadow: '0 3px 10px rgba(217, 119, 6, 0.25)',
                      '&:hover': { bgcolor: '#b45309' },
                      '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    3. Start Service
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircleIcon sx={{ fontSize: '0.95rem !important' }} />}
                    disabled={!currentlyServing}
                    onClick={handleCompleteService}
                    sx={{
                      py: 1.1,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      bgcolor: '#16a34a',
                      boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)',
                      '&:hover': { bgcolor: '#15803d' },
                      '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    4. Complete Service
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {/* Column 2: Live Counter State */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid rgba(226, 232, 240, 0.8)',
                bgcolor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} color="#0f172a" sx={{ fontSize: '0.95rem' }}>
                  Live Counter State
                </Typography>
                <Chip
                  label={currentCounterObj?.name || 'Counter'}
                  size="small"
                  sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(37, 99, 235, 0.08)', color: '#2563eb' }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2} sx={{ flex: 1 }}>
                {/* Currently Serving Box */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: currentlyServing ? 'rgba(22, 163, 74, 0.06)' : '#f8fafc',
                    border: '1px solid',
                    borderColor: currentlyServing ? 'rgba(22, 163, 74, 0.25)' : '#e2e8f0',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
                    CURRENTLY SERVING
                  </Typography>
                  {currentlyServing ? (
                    <Box>
                      <Typography variant="h6" fontWeight={800} color="#16a34a" sx={{ fontSize: '1.2rem', lineHeight: 1.1 }}>
                        {currentlyServing.tokenNumber}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="#0f172a" sx={{ fontSize: '0.82rem', mt: 0.4 }}>
                        {currentlyServing.studentName || 'Student'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {demo.servicesMap[currentlyServing.serviceId]?.name || 'Service'}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.82rem' }}>
                      No student currently in service.
                    </Typography>
                  )}
                </Box>

                {/* Called Entry Box */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: calledEntry ? 'rgba(217, 119, 6, 0.06)' : '#f8fafc',
                    border: '1px solid',
                    borderColor: calledEntry ? 'rgba(217, 119, 6, 0.25)' : '#e2e8f0',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
                    CALLED TOKEN (STEP UP)
                  </Typography>
                  {calledEntry ? (
                    <Box>
                      <Typography variant="h6" fontWeight={800} color="#d97706" sx={{ fontSize: '1.1rem', lineHeight: 1.1 }}>
                        {calledEntry.tokenNumber}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="#0f172a" sx={{ fontSize: '0.82rem', mt: 0.4 }}>
                        {calledEntry.studentName || 'Student'}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.82rem' }}>
                      No token called waiting to step up.
                    </Typography>
                  )}
                </Box>

                {/* Waiting List */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      WAITING QUEUE ({activeQueue.filter(e => e.status === 'WAITING').length})
                    </Typography>
                  </Box>
                  <Stack spacing={0.8} sx={{ maxHeight: 160, overflowY: 'auto' }}>
                    {activeQueue.filter(e => e.status === 'WAITING').map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          p: 1,
                          px: 1.5,
                          borderRadius: 2,
                          bgcolor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ fontSize: '0.8rem' }}>
                          {item.tokenNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {item.studentName}
                        </Typography>
                      </Box>
                    ))}
                    {activeQueue.filter(e => e.status === 'WAITING').length === 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Queue is currently empty.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Column 3: Live Event Log */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid rgba(226, 232, 240, 0.8)',
                bgcolor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} color="#0f172a" sx={{ fontSize: '0.95rem' }}>
                  Live Simulation Log
                </Typography>
                <Tooltip title="Clear Log">
                  <IconButton size="small" onClick={handleClearLog} sx={{ color: '#64748b' }}>
                    <DeleteIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  bgcolor: '#0f172a',
                  color: '#38bdf8',
                  p: 2,
                  borderRadius: 2.5,
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  flex: 1,
                  minHeight: 320,
                  maxHeight: 400,
                  overflowY: 'auto',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {simLog.map((log, idx) => (
                  <Box key={idx} sx={{ mb: 0.8, borderBottom: '1px solid rgba(255,255,255,0.04)', pb: 0.5 }}>
                    {log}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default DemoMode;
