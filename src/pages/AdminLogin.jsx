import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../hooks/useAuth';
import coverBg from '../assets/campus_cover_bg.png';

const DEMO_ADMIN_EMAIL = import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'admin@campusqueue.demo';
const DEMO_ADMIN_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'CampusQueue@2026';

export function AdminLogin() {
  const navigate = useNavigate();
  const { signInWithEmail, demoStaffSignIn, staffUser, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Track whether the user initiated a login attempt so we only navigate after intentional sign-in
  const pendingLoginRef = useRef(false);

  // Navigate to admin dashboard once staffUser state is actually committed by React
  useEffect(() => {
    if (staffUser && pendingLoginRef.current) {
      pendingLoginRef.current = false;
      navigate('/admin', { replace: true });
    }
  }, [staffUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setSubmitting(true);
      pendingLoginRef.current = true;
      await signInWithEmail(email, password);
      // Navigation is handled by the useEffect above once staffUser is set
    } catch (err) {
      pendingLoginRef.current = false;
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail(DEMO_ADMIN_EMAIL);
    setPassword(DEMO_ADMIN_PASSWORD);
  };

  const handleQuickDemoAccess = () => {
    handleFillDemoCredentials();
    pendingLoginRef.current = true;
    demoStaffSignIn('admin');
    // Navigation is handled by the useEffect above once staffUser is set
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 6 },
      }}
    >
      {/* Ambient Glowing Color Orbs */}
      <Box
        sx={{
          position: 'fixed',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Cover Background */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url(${coverBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.55,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(239,246,255,0.72) 0%, rgba(248,250,252,0.6) 50%, rgba(237,233,254,0.7) 100%)',
          zIndex: 0,
        }}
      />

      <Container sx={{ maxWidth: '420px !important', position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          className="fade-in"
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3.5,
            border: '1px solid rgba(226, 232, 240, 0.7)',
            textAlign: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(255,255,255,0.6) inset',
          }}
        >
          {/* Back Button */}
          <Box sx={{ textAlign: 'left', mb: 1 }}>
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: '0.8rem !important' }} />}
              onClick={() => navigate('/')}
              color="inherit"
              size="small"
              sx={{
                borderRadius: 1.8,
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: '0.75rem',
                py: 0.2,
                px: 1,
                '&:hover': { color: 'text.primary', bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              Home
            </Button>
          </Box>

          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: '#0f172a',
              color: 'white',
              mx: 'auto',
              mb: 1,
              boxShadow: '0 4px 10px rgba(15, 23, 42, 0.12)',
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />
          </Avatar>

          <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: '1.2rem', letterSpacing: '-0.02em', mb: 0.3 }}>
            Staff Portal
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mb: 1.8, fontSize: '0.78rem' }}>
            Live queue management & counter station operations.
          </Typography>

          {error && (
            <Alert severity="error" onClose={clearError} sx={{ mb: 1.5, borderRadius: 2, py: 0.3, fontSize: '0.78rem' }}>
              {error}
            </Alert>
          )}

          {/* Standard Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
            <TextField
              fullWidth
              label="Staff Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="dense"
              required
              autoComplete="email"
              size="small"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="dense"
              required
              autoComplete="current-password"
              size="small"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="small"
              disabled={submitting}
              sx={{
                mt: 1.5,
                mb: 1,
                py: 0.8,
                borderRadius: 2,
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '0.82rem',
                bgcolor: '#0f172a',
                boxShadow: '0 3px 12px rgba(15, 23, 42, 0.15)',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              Sign In
            </Button>
          </Box>

          <Divider sx={{ my: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, fontSize: '0.62rem' }}>
              DEMO ACCESS
            </Typography>
          </Divider>

          {/* Compact Demo Access Card */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2.5,
              bgcolor: 'rgba(248,250,252,0.7)',
              borderColor: '#e2e8f0',
              textAlign: 'left',
              p: 0,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 1.4, '&:last-child': { pb: 1.4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                  <VpnKeyIcon sx={{ fontSize: 14, color: '#64748b' }} />
                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ fontSize: '0.76rem' }}>
                    Demo Staff Credentials
                  </Typography>
                </Stack>
                <Chip
                  label="Testing"
                  size="small"
                  variant="outlined"
                  sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700 }}
                />
              </Box>

              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.8)',
                  p: 0.8,
                  borderRadius: 1.8,
                  border: '1px solid #f1f5f9',
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  color: '#64748b',
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
                  <span>Email:</span>
                  <strong style={{ color: '#0F172A' }}>{DEMO_ADMIN_EMAIL}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Password:</span>
                  <strong style={{ color: '#0F172A' }}>{DEMO_ADMIN_PASSWORD}</strong>
                </Box>
              </Box>

              <Stack direction="row" spacing={0.8}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<AutoFixHighIcon sx={{ fontSize: '0.8rem !important' }} />}
                  onClick={handleFillDemoCredentials}
                  sx={{
                    borderRadius: 1.8,
                    py: 0.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    borderColor: '#cbd5e1',
                    color: '#475569',
                    bgcolor: 'rgba(255,255,255,0.7)',
                    '&:hover': { borderColor: '#94a3b8', bgcolor: 'white' },
                  }}
                >
                  Fill Form
                </Button>

                <Button
                  fullWidth
                  size="small"
                  variant="contained"
                  startIcon={<VpnKeyIcon sx={{ fontSize: '0.8rem !important' }} />}
                  onClick={handleQuickDemoAccess}
                  sx={{
                    borderRadius: 1.8,
                    py: 0.5,
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    bgcolor: '#0f172a',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
                    '&:hover': { bgcolor: '#1e293b' },
                  }}
                >
                  Instant Login
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminLogin;
