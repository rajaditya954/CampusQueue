import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '../hooks/useAuth';
import { useQueue } from '../hooks/useQueue';
import { useServices } from '../hooks/useServices';
import { useCounters } from '../hooks/useCounters';
import { QueueStatusBadge } from '../components/StatusBadge';
import { formatTime, formatDate } from '../utils/formatters';

export function QueueHistory() {
  const navigate = useNavigate();
  const { studentSessionId, studentId, studentUser } = useAuth();
  const { queueEntries } = useQueue();
  const { servicesMap } = useServices();
  const { counters } = useCounters();

  const studentEntries = useMemo(() => {
    const sId = studentId || studentUser?.studentId;
    const sUid = studentUser?.uid || studentSessionId;

    return queueEntries
      .filter(e =>
        (sId && e.studentId === sId) ||
        (sUid && (e.studentUid === sUid || e.studentId === sUid))
      )
      .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
  }, [studentId, studentSessionId, studentUser, queueEntries]);

  const countersMap = useMemo(() => {
    return counters.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});
  }, [counters]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/student')}
        sx={{ mb: 3, textTransform: 'none', color: 'text.secondary' }}
      >
        Back to Dashboard
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <HistoryIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Your Queue History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all your past queue tokens, wait times, and service completion history.
          </Typography>
        </Box>
      </Box>

      {studentEntries.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          You haven't joined any campus service queues yet.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Token</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Counter</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actual Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentEntries.map((entry) => {
                const serviceName = servicesMap[entry.serviceId]?.name || 'Academic Service';
                const counterName = countersMap[entry.counterId] || 'Counter';

                return (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                        {entry.tokenNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{serviceName}</TableCell>
                    <TableCell>{counterName}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(entry.joinedAt)}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatTime(entry.joinedAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <QueueStatusBadge status={entry.status} />
                    </TableCell>
                    <TableCell>
                      {entry.actualProcessingTime ? (
                        <Chip label={`${entry.actualProcessingTime} mins`} size="small" variant="outlined" color="success" />
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default QueueHistory;
