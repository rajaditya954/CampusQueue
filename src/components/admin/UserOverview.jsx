import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, isDemoMode } from '../../firebase/config';

export function UserOverview() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemoMode) {
      setUsers([
        { id: 'u1', name: 'Admin Controller', email: 'admin@campus.edu', role: 'admin', active: true },
        { id: 'u2', name: 'Counter Staff', email: 'staff@campus.edu', role: 'staff', active: true },
      ]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));
        setUsers(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching users from Firestore:', err);
        setError('Unable to load user accounts from Firestore.');
        setUsers([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Authorized Staff & Admin Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of authenticated campus queue controllers and administrative accounts.
          </Typography>
        </Box>
      </Box>

      {/* Security Note */}
      <Alert severity="info" icon={<SecurityIcon />} sx={{ mb: 3, borderRadius: 3 }}>
        <strong>Security Architecture Notice:</strong> Staff & Admin authentication credentials are managed strictly through <strong>Firebase Authentication</strong>. Passwords are never stored in or exposed via Cloud Firestore.
      </Alert>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {users.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="body1" color="text.secondary">
            No administrative user profiles recorded in Firestore collection <code>users</code>.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Account Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                const active = u.active !== false;
                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {u.name || u.displayName || 'Staff Controller'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {u.email || 'N/A'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={isAdmin ? 'Administrator' : 'Counter Staff'}
                        color={isAdmin ? 'secondary' : 'primary'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<CheckCircleIcon fontSize="small" />}
                        label={active ? 'Active' : 'Inactive'}
                        color={active ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default UserOverview;
