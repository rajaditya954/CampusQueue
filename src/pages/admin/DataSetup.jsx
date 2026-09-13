import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Button,
  Alert,
  Stack,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ScienceIcon from '@mui/icons-material/Science';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ServiceManagement from '../../components/admin/ServiceManagement';
import StudentManagement from '../../components/admin/StudentManagement';
import QueueSettings from '../../components/admin/QueueSettings';
import UserOverview from '../../components/admin/UserOverview';
import DemoDataManager from '../../components/admin/DemoDataManager';
import { initializeFirestoreDatabase } from '../../utils/firestoreSeed';

export function DataSetup() {
  const [currentTab, setCurrentTab] = useState(0);
  const [initializing, setInitializing] = useState(false);
  const [initSteps, setInitSteps] = useState([]);
  const [initResult, setInitResult] = useState(null);
  const [initError, setInitError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleInitializeDatabase = async () => {
    setInitializing(true);
    setInitSteps([]);
    setInitResult(null);
    setInitError(null);

    const stepTracker = [];
    const onProgress = (stepName) => {
      if (!stepTracker.includes(stepName)) {
        stepTracker.push(stepName);
        setInitSteps([...stepTracker]);
      }
    };

    try {
      const summary = await initializeFirestoreDatabase(onProgress);
      setInitResult(summary);
    } catch (err) {
      console.error('Initialize database error:', err);
      setInitError(err.message || 'Database initialization failed.');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Title & Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Admin Data Setup ⚙️
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage master campus data, service definitions, authorized student accounts, and system rules.
        </Typography>
      </Box>

      {/* Prominent Initialize Database Card */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: '2px solid',
          borderColor: 'primary.main',
          background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
          boxShadow: '0 8px 24px -8px rgba(37, 99, 235, 0.15)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 3 }}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <RocketLaunchIcon color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight={800} color="primary.dark">
                  Initialize Database
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
                Create the initial services, demo students, queue configuration, and required setup documents in Cloud Firestore.
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={initializing ? <CircularProgress size={22} color="inherit" /> : <RocketLaunchIcon />}
              onClick={handleInitializeDatabase}
              disabled={initializing}
              sx={{
                py: 1.5,
                px: 3.5,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              {initializing ? 'Initializing Database...' : 'Initialize Database'}
            </Button>
          </Box>

          {/* Real-time Progress Stepper Feedback */}
          {initializing && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'primary.200' }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" gutterBottom>
                Initializing database...
              </Typography>
              <Stack spacing={0.5}>
                {['Verifying admin authorization', 'Checking services', 'Checking students', 'Checking configuration', 'Checking counters'].map((st) => {
                  const done = initSteps.includes(st);
                  return (
                    <Typography key={st} variant="caption" sx={{ color: done ? 'success.dark' : 'text.secondary', fontWeight: done ? 700 : 400, display: 'flex', alignItems: 'center', gap: 1 }}>
                      {done ? '✓' : '•'} {st}
                    </Typography>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Success Banner */}
          {initResult && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ mt: 3, borderRadius: 3 }}
              onClose={() => setInitResult(null)}
            >
              {initResult.alreadyInitialized ? (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Database is already initialized.
                  </Typography>
                  <Typography variant="body2">
                    All required services, demo students, queue configuration, and counter setup documents exist in Cloud Firestore.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Database initialized successfully.
                  </Typography>

                  <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                    Created in Cloud Firestore:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, mt: 0.5, fontSize: '0.875rem' }}>
                    <li>{initResult.servicesCreated > 0 ? `${initResult.servicesCreated} services created` : '5 services verified'}</li>
                    <li>{initResult.studentsCreated > 0 ? `${initResult.studentsCreated} demo students created` : '5 demo students verified'}</li>
                    <li>Queue configuration verified</li>
                    <li>Counter configuration verified</li>
                  </Box>
                </Box>
              )}
            </Alert>
          )}

          {/* Failure Alert */}
          {initError && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }} onClose={() => setInitError(null)}>
              <Typography variant="subtitle2" fontWeight={700}>
                Database initialization failed.
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Please check:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, mt: 0.5, fontSize: '0.85rem' }}>
                <li>Firebase configuration</li>
                <li>Firestore connection</li>
                <li>Authentication</li>
                <li>Firestore Security Rules</li>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Error details: {initError}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            pt: 1,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              minHeight: 48,
              borderRadius: 2,
              mr: 1,
            },
          }}
        >
          <Tab icon={<BuildIcon fontSize="small" />} iconPosition="start" label="Services Catalog" />
          <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Students Roster" />
          <Tab icon={<SettingsIcon fontSize="small" />} iconPosition="start" label="Queue Settings" />
          <Tab icon={<AdminPanelSettingsIcon fontSize="small" />} iconPosition="start" label="Staff Overview" />
          <Tab icon={<ScienceIcon fontSize="small" />} iconPosition="start" label="Demo Environment" />
        </Tabs>

        <Divider />

        {/* Tab Content Panel */}
        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {currentTab === 0 && <ServiceManagement />}
          {currentTab === 1 && <StudentManagement />}
          {currentTab === 2 && <QueueSettings />}
          {currentTab === 3 && <UserOverview />}
          {currentTab === 4 && <DemoDataManager />}
        </Box>
      </Paper>
    </Container>
  );
}

export default DataSetup;
