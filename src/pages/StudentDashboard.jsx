import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAuth } from '../hooks/useAuth';
import { useQueue } from '../hooks/useQueue';
import { useServices } from '../hooks/useServices';
import { useCounters } from '../hooks/useCounters';
import ServiceCard from '../components/ServiceCard';
import { CounterStatusBadge } from '../components/StatusBadge';
import { getGreeting } from '../utils/formatters';

export function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentUser, studentSessionId, studentName, studentId, studentSignOut } = useAuth();
  const { queueEntries, getStudentActiveEntry, getWaitingCountForService, error: queueError } = useQueue();
  const { services, servicesMap, error: servicesError } = useServices();
  const { counters, error: countersError } = useCounters();

  // Redirect to landing page if unauthenticated student accesses /student
  useEffect(() => {
    if (!studentUser && location.pathname === '/student') {
      navigate('/', { replace: true });
    }
  }, [studentUser, navigate, location.pathname]);

  const firestoreError = servicesError || countersError || queueError;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const activeEntry = useMemo(() => {
    return getStudentActiveEntry(studentSessionId, studentId);
  }, [studentSessionId, studentId, getStudentActiveEntry, queueEntries]);

  const categories = useMemo(() => {
    const set = new Set(services.map(s => s.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(svc => {
      const matchesSearch = svc.name.toLowerCase().includes(search.toLowerCase()) ||
        svc.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || svc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, selectedCategory]);

  const handleLogout = async () => {
    await studentSignOut();
    navigate('/', { replace: true });
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
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="#0f172a" gutterBottom sx={{ letterSpacing: '-0.025em', fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
              {getGreeting()}, {studentName || 'Student'}! 👋
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap' }}>
              <Chip
                icon={<BadgeIcon sx={{ fontSize: '14px !important', color: '#2563eb !important' }} />}
                label={`Student ID: ${studentId || 'N/A'}`}
                size="small"
                sx={{ fontWeight: 800, fontFamily: 'monospace', borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.2)' }}
              />
              <Typography variant="body2" color="#64748b" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                Check real-time counter status and estimate your wait time.
              </Typography>
            </Stack>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon sx={{ fontSize: '0.85rem !important' }} />}
            onClick={handleLogout}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, px: 2, py: 0.8, color: '#64748b', borderColor: '#cbd5e1', whiteSpace: 'nowrap', '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', color: '#0f172a', borderColor: '#94a3b8' } }}
          >
            Student Logout
          </Button>
        </Box>

        {firestoreError && (
          <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Unable to sync live queue data
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Unable to load queue entries. Please refresh the page or contact campus staff.
            </Typography>
            {import.meta.env?.DEV && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontFamily: 'monospace' }}>
                Diagnostic info: {firestoreError}
              </Typography>
            )}
          </Alert>
        )}

        {/* Active Token Banner */}
        {activeEntry && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              mb: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              boxShadow: '0 12px 30px -5px rgba(15, 23, 42, 0.25)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.08)',
                  p: 1.8,
                  borderRadius: 3,
                  display: 'flex',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <ConfirmationNumberIcon sx={{ fontSize: 36, color: '#38bdf8' }} />
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, fontSize: '0.72rem' }}>
                    YOUR ACTIVE TOKEN TICKET
                  </Typography>
                  <Chip
                    label={activeEntry.status}
                    size="small"
                    sx={{
                      bgcolor: activeEntry.status === 'CALLED' ? '#d97706' : '#2563eb',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      height: 22,
                    }}
                  />
                </Stack>
                <Typography variant="h4" fontWeight={900} sx={{ fontFamily: 'monospace', color: '#f8fafc', fontSize: '1.6rem', letterSpacing: '-0.02em' }}>
                  {activeEntry.tokenNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Service: <strong style={{ color: '#f1f5f9' }}>{servicesMap[activeEntry.serviceId]?.name || 'Academic Service'}</strong>
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ fontSize: '0.95rem !important' }} />}
              onClick={() => navigate(`/student/live/${activeEntry.id}`)}
              sx={{
                bgcolor: '#2563eb',
                color: 'white',
                fontWeight: 800,
                px: 3,
                py: 1.2,
                borderRadius: 2.5,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                '&:hover': { bgcolor: '#1d4ed8' },
                textTransform: 'none',
                fontSize: '0.875rem',
                alignSelf: { xs: 'stretch', md: 'auto' },
              }}
            >
              Track Live Status
            </Button>
          </Paper>
        )}

        {/* Counters Status Overview */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.05rem' }}>
            <StorefrontIcon sx={{ color: '#2563eb', fontSize: '1.2rem' }} /> Counter Station Status
          </Typography>

          {counters.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: '#ffffff', border: '1px dashed #cbd5e1' }}>
              <Typography variant="body2" color="text.secondary">
                No counter stations are currently configured.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {counters.map(counter => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={counter.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: '#cbd5e1', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0f172a" noWrap>
                        {counter.name}
                      </Typography>
                      <Typography variant="caption" color="#64748b" display="block">
                        {counter.location || 'Main Hall'}
                      </Typography>
                    </Box>
                    <CounterStatusBadge status={counter.status} />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Services List */}
        <Box>
          {activeEntry && (
            <Alert severity="warning" icon={<ConfirmationNumberIcon />} sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'warning.main' }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Token Generation Disabled — Active Token #{activeEntry.tokenNumber} in Use
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                You currently have active queue token <strong>{activeEntry.tokenNumber}</strong> for <strong>{servicesMap[activeEntry.serviceId]?.name || 'Academic Service'}</strong>. To request a token for a new service, you must first complete or cancel your existing token.
              </Typography>
            </Alert>
          )}

          {/* Available Services Section */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                Available Campus Services
              </Typography>
              <Typography variant="caption" color="#64748b">
                Select a service below to check processing details and generate a queue token
              </Typography>
            </Box>

            <TextField
              placeholder="Search service..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
          </Box>

          {/* Category Filters */}
          <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
            {categories.map(cat => (
              <Chip
                key={cat}
                label={cat === 'ALL' ? 'All Services' : cat}
                clickable
                color={selectedCategory === cat ? 'primary' : 'default'}
                variant={selectedCategory === cat ? 'filled' : 'outlined'}
                onClick={() => setSelectedCategory(cat)}
                sx={{ fontWeight: 700, borderRadius: 2.5, px: 0.5 }}
              />
            ))}
          </Stack>

          {/* Service Cards Grid */}
          {services.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: '#ffffff', border: '1px dashed #cbd5e1' }}>
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                No services are currently available.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredServices.map(service => {
                const waitingCount = getWaitingCountForService(service.id);
                const estMinutes = Math.max(1, Math.ceil(waitingCount * (service.averageProcessingTime || 5)));
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service.id}>
                    <ServiceCard
                      service={service}
                      waitingCount={waitingCount}
                      estimatedWait={estMinutes}
                      hasActiveToken={Boolean(activeEntry)}
                      onClick={() => navigate(`/student/service/${service.id}`)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default StudentDashboard;
