import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, isDemoMode } from '../firebase/config';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  Alert,
  Avatar,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useAuth } from '../hooks/useAuth';
import { SEED_STUDENTS } from '../utils/seedData';
import coverBg from '../assets/campus_cover_bg.png';

export function Login() {
  const navigate = useNavigate();
  const { studentSignIn, error, clearError } = useAuth();
  const [studentIdInput, setStudentIdInput] = useState('');
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firestoreStudents, setFirestoreStudents] = useState([]);

  useEffect(() => {
    if (isDemoMode) {
      setFirestoreStudents(SEED_STUDENTS);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const list = snapshot.docs.map(d => ({
          studentId: d.id,
          ...d.data(),
        }));
        setFirestoreStudents(list);
      },
      (err) => {
        console.warn('Error fetching student IDs from Firestore:', err);
        setFirestoreStudents([]);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLocalError(null);
    clearError();

    if (!studentIdInput.trim()) {
      setLocalError('Please enter your Student ID.');
      return;
    }

    try {
      setLoading(true);
      await studentSignIn(studentIdInput);
      navigate('/student', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoId = (id) => {
    setStudentIdInput(id);
    setLocalError(null);
    clearError();
  };

  const displayError = localError || error;

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
            bgcolor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(255,255,255,0.6) inset',
          }}
        >
          {/* Back & Staff Login Header */}
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

            <Button
              startIcon={<AdminPanelSettingsIcon sx={{ fontSize: '0.85rem !important' }} />}
              onClick={() => navigate('/admin/login')}
              color="primary"
              size="small"
              sx={{
                borderRadius: 1.8,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
                py: 0.2,
                px: 1,
              }}
            >
              Staff Login
            </Button>
          </Box>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 1.8 }}>
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
              <SchoolIcon sx={{ fontSize: 20 }} />
            </Avatar>

            <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: '1.2rem', letterSpacing: '-0.02em', mb: 0.3 }}>
              Student Login
            </Typography>
            <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.78rem' }}>
              Check real-time counter status and estimate your wait time.
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin} sx={{ mb: 1.8 }}>
            {displayError && (
              <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, py: 0.3, fontSize: '0.78rem' }}>
                {displayError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Student ID"
              placeholder="e.g. 23CSE1005"
              value={studentIdInput}
              onChange={(e) => { setStudentIdInput(e.target.value); setLocalError(null); }}
              margin="dense"
              size="small"
              slotProps={{
                input: {
                  startAdornment: <BadgeIcon color="action" sx={{ mr: 1, fontSize: '1rem' }} />,
                },
              }}
              sx={{ mb: 1.5 }}
              autoFocus
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="small"
              disabled={loading}
              endIcon={<ArrowForwardIcon sx={{ fontSize: '0.85rem !important' }} />}
              sx={{
                py: 0.8,
                fontSize: '0.82rem',
                fontWeight: 800,
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: '#0f172a',
                boxShadow: '0 3px 12px rgba(15, 23, 42, 0.15)',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              {loading ? 'Verifying...' : 'Continue to Dashboard'}
            </Button>
          </Box>

          <Divider sx={{ my: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ px: 1, fontSize: '0.62rem', letterSpacing: 0.5 }}>
              DEMO ACCOUNTS
            </Typography>
          </Divider>

          {/* Demo Student IDs */}
          <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: 'rgba(248,250,252,0.7)', borderColor: '#e2e8f0', mb: 1.5 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ fontSize: '0.78rem' }}>
                  Demo Student IDs
                </Typography>
                <Chip label="Testing" size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 18 }} />
              </Box>

              <Stack spacing={0.8}>
                {firestoreStudents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1.5, fontSize: '0.85rem' }}>
                    No student records found. Enter your Student ID above.
                  </Typography>
                ) : (
                  firestoreStudents.map((demo) => (
                    <Box
                      key={demo.studentId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        px: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.7)',
                        border: '1px solid #f1f5f9',
                        transition: 'all 0.15s',
                        '&:hover': { bgcolor: 'white', borderColor: '#e2e8f0' },
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {demo.studentId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                          {demo.name}
                        </Typography>
                      </Box>

                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleUseDemoId(demo.studentId)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          minWidth: 48,
                          color: '#2563eb',
                        }}
                      >
                        Use
                      </Button>
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
