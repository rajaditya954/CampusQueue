import { useState } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useCounters } from '../hooks/useCounters';
import { useServices } from '../hooks/useServices';
import { CounterStatusBadge } from '../components/StatusBadge';

export function AdminCounters() {
  const { counters, addCounter, updateCounter, setCounterStatus } = useCounters();
  const { services, servicesMap } = useServices();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCounter, setEditingCounter] = useState(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('17:00');
  const [selectedServices, setSelectedServices] = useState([]);

  const handleOpenCreate = () => {
    setEditingCounter(null);
    setCode('CTR-5');
    setName('General Enquiry Counter');
    setLocation('Admin Block Room 105');
    setOpenTime('09:00');
    setCloseTime('17:00');
    setSelectedServices(services.map(s => s.id));
    setDialogOpen(true);
  };

  const handleOpenEdit = (counter) => {
    setEditingCounter(counter);
    setCode(counter.code);
    setName(counter.name);
    setLocation(counter.location || '');
    setOpenTime(counter.operatingHours?.open || '09:00');
    setCloseTime(counter.operatingHours?.close || '17:00');
    setSelectedServices(counter.supportedServices || []);
    setDialogOpen(true);
  };

  const handleToggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = () => {
    const payload = {
      code,
      name,
      location,
      operatingHours: {
        open: openTime,
        close: closeTime,
      },
      supportedServices: selectedServices,
      status: editingCounter ? editingCounter.status : 'OPEN',
    };

    if (editingCounter) {
      updateCounter(editingCounter.id, payload);
    } else {
      addCounter(payload);
    }

    setDialogOpen(false);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <StorefrontIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Counter Station Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure counter stations, operating hours, and supported service assignments.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none' }}
        >
          Add New Counter
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Counter Code & Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Hours</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Supported Services</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {counters.map((ctr) => (
              <TableRow key={ctr.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {ctr.name} ({ctr.code})
                  </Typography>
                </TableCell>
                <TableCell>{ctr.location || 'Main Office'}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {ctr.operatingHours?.open || '09:00'} - {ctr.operatingHours?.close || '17:00'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {ctr.supportedServices?.map(svcId => (
                      <Chip
                        key={svcId}
                        label={servicesMap[svcId]?.name || svcId}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <CounterStatusBadge status={ctr.status} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => handleOpenEdit(ctr)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle fontWeight={700}>
          {editingCounter ? 'Edit Counter Station' : 'Add New Counter Station'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                sx={{ width: 140 }}
                required
              />
              <TextField
                label="Counter Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Stack>

            <TextField
              label="Physical Location"
              fullWidth
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Opening Time"
                type="time"
                fullWidth
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Closing Time"
                type="time"
                fullWidth
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <Typography variant="subtitle2" fontWeight={700}>
              Supported Services
            </Typography>
            <FormGroup>
              {services.map(svc => (
                <FormControlLabel
                  key={svc.id}
                  control={
                    <Checkbox
                      checked={selectedServices.includes(svc.id)}
                      onChange={() => handleToggleService(svc.id)}
                    />
                  }
                  label={svc.name}
                />
              ))}
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2 }}>
            Save Counter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminCounters;
