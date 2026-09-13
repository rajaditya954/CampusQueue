import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Grid, Card, Stack,
  Chip, Avatar, Paper,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InsightsIcon from '@mui/icons-material/Insights';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import CalculateIcon from '@mui/icons-material/Calculate';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DescriptionIcon from '@mui/icons-material/Description';
import PaymentsIcon from '@mui/icons-material/Payments';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import InfoIcon from '@mui/icons-material/Info';
import { useQueue } from '../hooks/useQueue';
import { useServices } from '../hooks/useServices';
import coverBg from '../assets/campus_cover_bg.png';

const ESTIMATOR_SERVICES = [
  { id: 'doc_verify', name: 'Document Verification', icon: <DescriptionIcon sx={{ fontSize: '0.95rem' }} />, avgMin: 8, desc: 'Original certificate check' },
  { id: 'fee_payment', name: 'Fee & Cash Payment', icon: <PaymentsIcon sx={{ fontSize: '0.95rem' }} />, avgMin: 3, desc: 'Fee & fine collection' },
  { id: 'cert_req', name: 'Certificate Request', icon: <WorkspacePremiumIcon sx={{ fontSize: '0.95rem' }} />, avgMin: 5, desc: 'Degree certificate issue' },
  { id: 'gen_inquiry', name: 'General Inquiry', icon: <InfoIcon sx={{ fontSize: '0.95rem' }} />, avgMin: 4, desc: 'Student assistance desk' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { queueEntries } = useQueue();
  const { servicesMap } = useServices();

  const [selectedServiceId, setSelectedServiceId] = useState('doc_verify');

  // Filter actual waiting entries strictly from Firestore / DB
  const waitingEntriesFromDB = (queueEntries || [])
    .filter(e => e.status === 'WAITING')
    .map((item, idx) => ({
      id: item.id,
      tokenNumber: item.tokenNumber || `T-${item.id?.substring(0, 4)}`,
      serviceName: servicesMap[item.serviceId]?.name || item.serviceName || 'Campus Service',
      duration: servicesMap[item.serviceId]?.avgTimeMinutes || item.avgTimeMinutes || 5,
      step: `0${idx + 1}`,
    }));

  const selectedService = ESTIMATOR_SERVICES.find(s => s.id === selectedServiceId) || ESTIMATOR_SERVICES[0];
  const totalCalculatedWait = waitingEntriesFromDB.reduce((acc, curr) => acc + (curr.duration || 5), 0);
  const peopleAheadCount = waitingEntriesFromDB.length;

  return (
    <Box sx={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', bgcolor: '#0b1329', overflowX: 'hidden' }}>
      {/* ─── Fixed Sleek Top Bar ────────────────────────────────────────── */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          py: 1.5,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          bgcolor: 'rgba(255, 255, 255, 0.88)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 2, sm: 4, md: 6, lg: 8 }, maxWidth: '100%', mx: 'auto' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#2563eb',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.85rem',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
              }}
            >
              CQ
            </Avatar>
            <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
              CampusQueue
            </Typography>
          </Box>

          {/* Center Nav Links (Desktop) */}
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Button
              onClick={() => navigate('/login')}
              sx={{ color: '#475569', textTransform: 'none', fontWeight: 600, fontSize: '0.92rem', borderRadius: 2, px: 2, py: 0.6, '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.06)', color: '#2563eb' } }}
            >
              Student Portal
            </Button>
            <Button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              sx={{ color: '#475569', textTransform: 'none', fontWeight: 600, fontSize: '0.92rem', borderRadius: 2, px: 2, py: 0.6, '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.06)', color: '#2563eb' } }}
            >
              How It Works
            </Button>
          </Stack>

          {/* Right Actions - Always visible on Mobile & Desktop */}
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/demo')}
              sx={{
                minWidth: { xs: 'auto', sm: 'auto' },
                textTransform: 'none',
                fontWeight: 700,
                color: '#2563eb',
                borderColor: '#93c5fd',
                px: { xs: 1, sm: 1.5 },
                py: 0.5,
                fontSize: { xs: '0.75rem', sm: '0.88rem' },
                bgcolor: 'rgba(37, 99, 235, 0.04)',
                '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.12)', borderColor: '#2563eb' },
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: '1rem', mr: { xs: 0, sm: 0.5 } }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Demo</Box>
            </Button>

            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/admin/login')}
              sx={{
                minWidth: { xs: 'auto', sm: 'auto' },
                textTransform: 'none',
                fontWeight: 600,
                color: '#64748b',
                px: { xs: 0.8, sm: 1.5 },
                py: 0.5,
                fontSize: { xs: '0.75rem', sm: '0.92rem' },
                display: 'inline-flex',
                '&:hover': { color: '#0f172a', bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              Staff
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/login')}
              sx={{
                minWidth: { xs: 'auto', sm: 'auto' },
                borderRadius: 5,
                px: { xs: 1.2, sm: 2.5 },
                py: 0.6,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.9rem' },
                bgcolor: '#2563eb',
                boxShadow: '0 2px 10px rgba(37, 99, 235, 0.28)',
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              <PersonIcon sx={{ fontSize: '1rem', mr: { xs: 0, sm: 0.5 } }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Get Token</Box>
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          pt: { xs: 11, md: 13 },
          pb: { xs: 7, md: 9 },
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#f8fafc',
        }}
      >
        {/* Ambient Glowing Color Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.03) 60%, transparent 80%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.16) 0%, rgba(124, 58, 237, 0.02) 60%, transparent 80%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Cover Background Image */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${coverBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.6,
            zIndex: 0,
          }}
        />

        {/* Dynamic Translucent Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(239,246,255,0.72) 0%, rgba(248,250,252,0.6) 50%, rgba(237,233,254,0.68) 100%)',
            zIndex: 1,
          }}
        />

        {/* Focused Container */}
        <Box sx={{ position: 'relative', zIndex: 2, px: { xs: 2.5, sm: 4, md: 6, lg: 8 } }}>
          <Grid container spacing={{ xs: 3, md: 5 }} sx={{ alignItems: 'center' }}>
            {/* Left Column: Headline & Value Proposition */}
            <Grid size={{ xs: 12, md: 6.5 }}>
              <Box className="fade-in">


                {/* Headline with Gradient Text */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.4rem', sm: '3rem', md: '3.5rem' },
                    fontWeight: 900,
                    lineHeight: 1.12,
                    letterSpacing: '-0.025em',
                    color: '#0f172a',
                    mb: 2,
                  }}
                >
                  4 people ahead<br />
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ≠ 4 minutes.
                  </Box>
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.4rem' },
                    fontWeight: 700,
                    lineHeight: 1.4,
                    mb: 1.8,
                    color: '#1e293b',
                  }}
                >
                  Know your exact wait time before stepping in line.
                </Typography>

                {/* Subtitle */}
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    lineHeight: 1.6,
                    mb: 3,
                    maxWidth: 520,
                    color: '#475569',
                    fontWeight: 450,
                  }}
                >
                  CampusQueue calculates real time based on actual service durations of everyone ahead — so you never waste a single minute standing around.
                </Typography>

                {/* CTAs */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    variant="contained"
                    size="medium"
                    onClick={() => navigate('/login')}
                    endIcon={<ArrowForwardIcon sx={{ fontSize: '0.9rem !important' }} />}
                    sx={{
                      px: 3.8,
                      py: 1.4,
                      fontSize: '1rem',
                      fontWeight: 800,
                      borderRadius: 5,
                      bgcolor: '#0f172a',
                      color: 'white',
                      boxShadow: '0 4px 18px rgba(15, 23, 42, 0.25)',
                      '&:hover': { bgcolor: '#1e293b', transform: 'translateY(-1px)' },
                      textTransform: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Join Queue Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    sx={{
                      px: 3.2,
                      py: 1.4,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 5,
                      color: '#334155',
                      borderColor: '#cbd5e1',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'white', borderColor: '#94a3b8', color: '#0f172a' },
                    }}
                  >
                    How it works ↓
                  </Button>
                </Stack>


              </Box>
            </Grid>

            {/* Right Column: Sleek Glassmorphic Wait Estimator Card */}
            <Grid size={{ xs: 12, md: 5.5 }}>
              <Paper
                elevation={0}
                className="slide-up"
                sx={{
                  maxWidth: { xs: '100%', sm: 480, md: 520 },
                  width: '100%',
                  mx: 'auto',
                  ml: { md: 'auto' },
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255,255,255,0.7) inset',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Widget Header */}
                <Box
                  sx={{
                    px: 3.5,
                    py: 1.8,
                    bgcolor: '#0f172a',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalculateIcon sx={{ color: '#60a5fa', fontSize: '1.2rem' }} />
                    <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: 0.5, fontSize: '0.85rem', color: '#ffffff' }}>
                      WAIT ESTIMATOR
                    </Typography>
                  </Box>


                </Box>

                <Box sx={{ p: 2.2 }}>
                  {/* Step 1: Select Service */}
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.8, display: 'block', fontSize: '0.74rem' }}>
                    1. Select Your Service
                  </Typography>

                  <Grid container spacing={1} sx={{ mb: 1.8 }}>
                    {ESTIMATOR_SERVICES.map((serv) => {
                      const isSelected = serv.id === selectedServiceId;
                      return (
                        <Grid size={{ xs: 6 }} key={serv.id}>
                          <Paper
                            elevation={0}
                            onClick={() => setSelectedServiceId(serv.id)}
                            sx={{
                              p: 1.5,
                              px: 1.8,
                              borderRadius: '10px !important',
                              border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                              bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                borderColor: isSelected ? '#2563eb' : '#cbd5e1',
                                bgcolor: isSelected ? '#eff6ff' : '#f8fafc',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Box sx={{ color: isSelected ? '#2563eb' : '#64748b', display: 'flex', pt: 0.1, flexShrink: 0 }}>
                                {serv.icon}
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={700} color={isSelected ? '#1e40af' : '#334155'} sx={{ fontSize: '0.84rem', lineHeight: 1.25 }}>
                                  {serv.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', display: 'block', mt: 0.3, fontWeight: 500 }}>
                                  ~{serv.avgMin} min avg
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Step 2: Queue Breakdown */}
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.8, display: 'block', fontSize: '0.74rem' }}>
                    2. Queue Ahead ({peopleAheadCount} People)
                  </Typography>

                  <Stack spacing={0.6} sx={{ mb: 1.5 }}>
                    {waitingEntriesFromDB.length === 0 ? (
                      <Box sx={{ p: 1.2, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
                          No queue currently — instant counter service!
                        </Typography>
                      </Box>
                    ) : (
                      waitingEntriesFromDB.map((item) => (
                        <Box
                          key={item.id || item.tokenNumber}
                          sx={{
                            p: 0.8,
                            px: 1.2,
                            borderRadius: 1.8,
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Typography variant="caption" fontWeight={800} color="#94a3b8" sx={{ fontSize: '0.65rem' }}>
                              {item.step}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="#334155" sx={{ fontSize: '0.84rem' }}>
                              #{item.tokenNumber} · {item.serviceName}
                            </Typography>
                          </Box>
                          <Chip
                            label={`+${item.duration}m`}
                            size="small"
                            sx={{ bgcolor: '#e2e8f0', color: '#334155', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
                          />
                        </Box>
                      ))
                    )}
                  </Stack>

                  {/* Total Wait Result */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.4,
                      bgcolor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1.2,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="#166534" fontWeight={700} display="block" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.4 }}>
                        Calculated Wait Time
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="#14532d" sx={{ fontSize: '1.3rem', mt: 0.1 }}>
                        ~{totalCalculatedWait} min
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate('/login')}
                      endIcon={<ArrowForwardIcon sx={{ fontSize: '0.75rem !important' }} />}
                      sx={{
                        bgcolor: '#16a34a',
                        color: 'white',
                        fontWeight: 700,
                        borderRadius: 5,
                        px: 1.6,
                        py: 0.6,
                        fontSize: '0.84rem',
                        textTransform: 'none',
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                        '&:hover': { bgcolor: '#15803d' },
                      }}
                    >
                      Get Token
                    </Button>
                  </Paper>

                  {/* Worth Waiting Insight */}
                  <Box
                    sx={{
                      p: 1,
                      px: 1.2,
                      bgcolor: totalCalculatedWait <= 20 ? 'rgba(37, 99, 235, 0.05)' : 'rgba(245, 158, 11, 0.07)',
                      borderRadius: 1.8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CheckCircleIcon sx={{ fontSize: '0.8rem', color: totalCalculatedWait <= 20 ? '#2563eb' : '#d97706' }} />
                      <Typography variant="caption" fontWeight={600} color={totalCalculatedWait <= 20 ? '#1e40af' : '#92400e'} sx={{ fontSize: '0.68rem' }}>
                        {totalCalculatedWait <= 20 ? 'Optimal time to visit' : 'Moderate queue volume'}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.64rem' }}>
                      Desk open 9 AM - 5 PM
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ─── How It Works Section ────────────────────────────────────────── */}
      <Box
        id="how-it-works"
        sx={{
          py: { xs: 7, md: 9 },
          background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
          borderTop: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        <Box sx={{ px: { xs: 2.5, sm: 4, md: 6, lg: 8 } }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="overline"
              sx={{ color: '#2563eb', fontWeight: 800, fontSize: '0.82rem', letterSpacing: 2, mb: 0.5, display: 'block' }}
            >
              SIMPLE PROCESS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.6rem', md: '2.1rem' }, letterSpacing: '-0.02em' }}>
              Four simple steps to your turn
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8, maxWidth: 500, mx: 'auto', fontSize: '1rem' }}>
              From line request to counter — track everything on your phone.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {[
              { step: '01', title: 'Select Service', desc: 'Choose your desk service request type', icon: <TouchAppIcon sx={{ fontSize: 24 }} /> },
              { step: '02', title: 'Get Token', desc: 'Instant digital token with live position', icon: <ConfirmationNumberIcon sx={{ fontSize: 24 }} /> },
              { step: '03', title: 'Track Wait', desc: 'Real-time minutes countdown updates', icon: <InsightsIcon sx={{ fontSize: 24 }} /> },
              { step: '04', title: 'Walk Up', desc: 'Head to counter when your number is called', icon: <CheckCircleIcon sx={{ fontSize: 24 }} /> },
            ].map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.step}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px !important',
                    bgcolor: '#ffffff',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.1)',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '8px',
                          bgcolor: 'rgba(37, 99, 235, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2563eb',
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Chip
                        label={item.step}
                        size="small"
                        sx={{
                          bgcolor: '#eff6ff',
                          color: '#2563eb',
                          fontWeight: 800,
                          fontSize: '0.76rem',
                          height: 24,
                          borderRadius: '6px',
                        }}
                      />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ fontSize: '1.05rem', mb: 0.6, lineHeight: 1.3 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* ─── Capabilities Section ─────────────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 7, md: 9 },
          background: 'linear-gradient(180deg, #edf2f7 0%, #ffffff 100%)',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ px: { xs: 2.5, sm: 4, md: 6, lg: 8 } }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="overline"
              sx={{ color: '#2563eb', fontWeight: 800, fontSize: '0.82rem', letterSpacing: 2, mb: 0.5, display: 'block' }}
            >
              SMART FEATURES
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.6rem', md: '2.1rem' }, letterSpacing: '-0.02em' }}>
              Built for stress-free campus visits
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8, maxWidth: 500, mx: 'auto', fontSize: '1rem' }}>
              Transparent real-time time estimates instead of unpredictable waiting rooms.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {[
              { icon: <AccessTimeIcon sx={{ fontSize: 24 }} />, title: 'Personalized Estimates', desc: 'Calculated using actual services ahead — not head count.' },
              { icon: <ElectricBoltIcon sx={{ fontSize: 24 }} />, title: 'Live Queue Updates', desc: 'Position and time refresh live as staff process tokens.' },
              { icon: <ScheduleIcon sx={{ fontSize: 24 }} />, title: 'Counter Closing Alerts', desc: 'Know if you will be served before office hours end.' },
              { icon: <TrendingUpIcon sx={{ fontSize: 24 }} />, title: 'Adaptive Accuracy', desc: 'Average times calibrate continuously to staff speed.' },
            ].map((f, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: '14px !important',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '8px',
                      bgcolor: 'rgba(37, 99, 235, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb',
                      mb: 2,
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ fontSize: '1.05rem', mb: 0.6, lineHeight: 1.3 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {f.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* ─── Call To Action Section ───────────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, transparent 70%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 2, px: { xs: 2.5, sm: 4, md: 6, lg: 8 }, maxWidth: 640, mx: 'auto' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.2, fontSize: { xs: '1.4rem', md: '1.8rem' }, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Ready to skip the line?
          </Typography>
          <Typography variant="body2" sx={{ mb: 3.5, fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55 }}>
            Get your digital token now and track your wait in real time.
          </Typography>
          <Button
            variant="contained"
            size="medium"
            onClick={() => navigate('/login')}
            endIcon={<ArrowForwardIcon sx={{ fontSize: '0.85rem !important' }} />}
            sx={{
              px: 3.5,
              py: 1.2,
              fontSize: '0.88rem',
              fontWeight: 700,
              borderRadius: 5,
              bgcolor: '#2563eb',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
              '&:hover': { bgcolor: '#1d4ed8' },
              textTransform: 'none',
            }}
          >
            Get Your Token
          </Button>
        </Box>
      </Box>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <Box sx={{ py: 2.5, textAlign: 'center', borderTop: '1px solid #1e293b', bgcolor: '#0b1329' }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>
          CampusQueue © {new Date().getFullYear()} · Smart Campus Queue Management
        </Typography>
      </Box>
    </Box>
  );
}
