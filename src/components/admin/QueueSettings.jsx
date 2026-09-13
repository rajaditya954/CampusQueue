import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Stack,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { firestoreGetQueueSettings, firestoreSaveQueueSettings } from '../../firebase/firestoreService';

export function QueueSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [queueEnabled, setQueueEnabled] = useState(true);
  const [maxQueueSize, setMaxQueueSize] = useState(100);
  const [allowSkip, setAllowSkip] = useState(true);
  const [allowRejoin, setAllowRejoin] = useState(true);
  const [skipRejoinPolicy, setSkipRejoinPolicy] = useState('MOVE_TO_END');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await firestoreGetQueueSettings();
        if (data) {
          setQueueEnabled(data.queueEnabled !== false);
          setMaxQueueSize(data.maxQueueSize || 100);
          setAllowSkip(data.allowSkip !== false);
          setAllowRejoin(data.allowRejoin !== false);
          setSkipRejoinPolicy(data.skipRejoinPolicy || 'MOVE_TO_END');
        }
      } catch (err) {
        console.warn('Error loading queue settings:', err);
        setError('Failed to load queue settings from Firestore.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setError(null);
    setSaveSuccess(false);

    const maxCapacity = Number(maxQueueSize);
    if (isNaN(maxCapacity) || maxCapacity <= 0) {
      setError('Maximum Queue Capacity must be a positive number.');
      return;
    }

    try {
      setSaving(true);
      await firestoreSaveQueueSettings({
        queueEnabled,
        maxQueueSize: maxCapacity,
        allowSkip,
        allowRejoin,
        skipRejoinPolicy,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Save queue settings error:', err);
      setError(err.message || 'Failed to save settings to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSave}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SettingsIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Global Queue System Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure operational capacity, skip/rejoin rules, and system availability.
            </Typography>
          </Box>
        </Box>

        <Button
          type="submit"
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={saving}
          sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', px: 3 }}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {saveSuccess && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 3 }}>
          Queue configuration saved to Firestore successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* System Operations Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                System Status & Operational Capacity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Control whether new students can join service queues across campus.
              </Typography>

              <Stack spacing={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: queueEnabled ? 'success.50' : 'action.hover' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={queueEnabled}
                        onChange={(e) => setQueueEnabled(e.target.checked)}
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Global Queue System Enabled
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {queueEnabled ? 'Students can request tokens and join active queues.' : 'Queues are paused; students cannot join.'}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>

                <TextField
                  fullWidth
                  label="Maximum Active Queue Capacity"
                  type="number"
                  value={maxQueueSize}
                  onChange={(e) => setMaxQueueSize(e.target.value)}
                  helperText="Maximum total active tokens permitted system-wide"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Skip & Rejoin Policy Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Skip & Rejoin Business Rules
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Define student options when missing a token call at serving counters.
              </Typography>

              <Stack spacing={2.5}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowSkip}
                      onChange={(e) => setAllowSkip(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Allow Staff Token Skipping
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Counters can skip non-present tokens to keep lines moving.
                      </Typography>
                    </Box>
                  }
                />

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      checked={allowRejoin}
                      onChange={(e) => setAllowRejoin(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Allow Skipped Token Rejoin
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Skipped students can rejoin line without losing token record.
                      </Typography>
                    </Box>
                  }
                />

                <FormControl fullWidth size="small" disabled={!allowRejoin}>
                  <InputLabel>Skip Rejoin Placement Policy</InputLabel>
                  <Select
                    value={skipRejoinPolicy}
                    label="Skip Rejoin Placement Policy"
                    onChange={(e) => setSkipRejoinPolicy(e.target.value)}
                  >
                    <MenuItem value="MOVE_TO_END">Move to end of waiting queue</MenuItem>
                    <MenuItem value="REJOIN_AFTER_NEXT">Rejoin after next served student</MenuItem>
                    <MenuItem value="ADMIN_DECIDES">Counter staff manual placement</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default QueueSettings;
