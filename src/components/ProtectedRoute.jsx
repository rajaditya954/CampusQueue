import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function ProtectedRoute({ children, requireAdmin = false, requireStrictAdmin = false }) {
  const { loading, isAdmin, isStrictAdmin } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  // Admin/Staff routes require staff authentication
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireStrictAdmin && !isStrictAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
