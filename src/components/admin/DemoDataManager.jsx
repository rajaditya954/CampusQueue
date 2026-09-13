import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import StorageIcon from '@mui/icons-material/Storage';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { seedFirestore, clearDemoData } from '../../utils/firestoreSeed';

export function DemoDataManager() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const handleSeedAll = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await seedFirestore();
      if (res.services.skipped && res.counters.skipped && res.queueEntries.skipped) {
        setStatus({
          severity: 'info',
          message: 'Firestore already contains demo master data. Idempotent seed action complete.',
        });
      } else {
        setStatus({
          severity: 'success',
          message: `Successfully populated Cloud Firestore with real demo records! Created ${res.services.seeded} services, ${res.counters.seeded} counters, ${res.students?.seeded || 5} students, and ${res.queueEntries.seeded} demo queue entries (all marked isDemo: true).`,
        });
      }
    } catch (err) {
      console.error('Seed error:', err);
      setStatus({ severity: 'error', message: `Failed to seed demo data: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleClearDemoData = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const count = await clearDemoData();
      setStatus({
        severity: 'success',
        message: `Successfully removed ${count} demo documents (tagged isDemo: true) from Cloud Firestore. Production data remains completely untouched.`,
      });
    } catch (err) {
      console.error('Clear demo data error:', err);
      setStatus({ severity: 'error', message: `Failed to clear demo data: ${err.message}` });
    } finally {
      setLoading(false);
      setClearConfirmOpen(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <ScienceIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Demo Environment & Presentation Setup
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage simulated students, services, and tokens stored directly in Cloud Firestore with <code>isDemo: true</code>.
          </Typography>
        </Box>
      </Box>

      {status && (
        <Alert severity={status.severity} sx={{ mb: 3, borderRadius: 3 }} onClose={() => setStatus(null)}>
          {status.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Seed Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <StorageIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Populate Demo Master Data
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Writes standard presentation records to Firestore (Services, Counters, Queue Tokens, and Student Credentials <code>23CSE1001</code> to <code>23CSE1005</code>).
                </Typography>
                <Chip label="Idempotent Operation" size="small" variant="outlined" color="primary" sx={{ fontSize: '0.7rem' }} />
              </Box>

              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                onClick={handleSeedAll}
                disabled={loading}
                sx={{ mt: 3, borderRadius: 3, fontWeight: 700, textTransform: 'none', py: 1.2 }}
              >
                {loading ? 'Processing Firestore...' : 'Create Demo Students & Services'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Clear Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 4, height: '100%', borderColor: 'error.light' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <DeleteSweepIcon color="error" />
                  <Typography variant="subtitle1" fontWeight={700} color="error.main">
                    Clear Demo Data Only
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Safely purge demo students and queue entries from Cloud Firestore where <code>isDemo == true</code>.
                </Typography>
                <Alert severity="warning" icon={<WarningAmberIcon fontSize="small" />} sx={{ borderRadius: 2, py: 0.5, fontSize: '0.75rem' }}>
                  Real production student data & history will be preserved.
                </Alert>
              </Box>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={() => setClearConfirmOpen(true)}
                disabled={loading}
                sx={{ mt: 3, borderRadius: 3, fontWeight: 700, textTransform: 'none', py: 1.2 }}
              >
                Clear Demo Data
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={clearConfirmOpen} onClose={() => setClearConfirmOpen(false)} paperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete Demo Data?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            This action will remove demo students, demo queue entries, and demo services explicitly marked with <code>isDemo: true</code> from Cloud Firestore.
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} color="success.dark">
            Real production data will not be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setClearConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleClearDemoData} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Demo Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DemoDataManager;
