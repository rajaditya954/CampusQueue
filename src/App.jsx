import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './features/auth/AuthContext';
import { DemoProvider } from './features/demo/DemoContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { isDemoMode } from './firebase/config';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import ServiceDetails from './pages/ServiceDetails';
import LiveTracking from './pages/LiveTracking';
import QueueHistory from './pages/QueueHistory';
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import AdminCounters from './pages/AdminCounters';
import DataSetup from './pages/admin/DataSetup';
import DemoMode from './pages/DemoMode';
import NotFound from './pages/NotFound';

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DemoProvider>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Student Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/student/login" element={<Login />} />
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/service/:serviceId" element={<ServiceDetails />} />
                <Route path="/student/live/:entryId" element={<LiveTracking />} />
                <Route path="/student/history" element={<QueueHistory />} />

                {/* Staff / Admin Authentication & Protected Portal */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/services"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/counters"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminCounters />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/data-setup"
                  element={
                    <ProtectedRoute requireAdmin={true} requireStrictAdmin={true}>
                      <DataSetup />
                    </ProtectedRoute>
                  }
                />

                {/* Interactive Simulator */}
                <Route path="/demo" element={<DemoMode />} />

                {/* Aliases & Fallbacks */}
                <Route path="/dashboard" element={<Navigate to="/student" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </DemoProvider>
    </ThemeProvider>
  );
}

export default App;
