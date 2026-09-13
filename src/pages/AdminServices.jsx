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
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import { useServices } from '../hooks/useServices';
import { ConfidenceBadge } from '../components/StatusBadge';
import { getConfidenceLevel } from '../features/queue/queueEstimator';

export function AdminServices() {
  const { services, addService, updateService, deleteService } = useServices();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [avgTime, setAvgTime] = useState(5);
  const [minTime, setMinTime] = useState(2);
  const [maxTime, setMaxTime] = useState(10);
  const [reqDocs, setReqDocs] = useState('');

  const handleOpenCreate = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setCategory('Academic');
    setAvgTime(5);
    setMinTime(2);
    setMaxTime(10);
    setReqDocs('Student ID Card');
    setDialogOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setName(svc.name);
    setDescription(svc.description || '');
    setCategory(svc.category || 'Academic');
    setAvgTime(svc.averageProcessingTime || 5);
    setMinTime(svc.minimumProcessingTime || 2);
    setMaxTime(svc.maximumProcessingTime || 10);
    setReqDocs(svc.requiredDocuments ? svc.requiredDocuments.join(', ') : '');
    setDialogOpen(true);
  };

  const handleSave = () => {
    const docsArray = reqDocs.split(',').map(d => d.trim()).filter(Boolean);
    const servicePayload = {
      name,
      description,
      category,
      averageProcessingTime: Number(avgTime),
      minimumProcessingTime: Number(minTime),
      maximumProcessingTime: Number(maxTime),
      requiredDocuments: docsArray,
    };

    if (editingService) {
      updateService(editingService.id, servicePayload);
    } else {
      addService(servicePayload);
    }

    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(id);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Background Ambient Glowing Color Orbs */}
      <Box
        sx={{
          position: 'fixed',
          top: '-10%',
          right: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(37, 99, 235, 0.01) 60%, transparent 80%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-10%',
          left: '-5%',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0.01) 60%, transparent 80%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BuildIcon sx={{ color: '#2563eb', fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ letterSpacing: '-0.01em' }}>
                Service Catalog Management
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.85rem' }}>
                Configure campus services, baseline processing durations, and document requirements.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: '0.9rem !important' }} />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', py: 0.9, px: 2.2, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}
          >
            Add New Service
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(226, 232, 240, 0.8)', bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Service Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Avg Duration</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sample Size & Confidence</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Required Docs</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((svc) => {
              const confidence = getConfidenceLevel(svc);
              return (
                <TableRow key={svc.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {svc.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 240, display: 'block' }}>
                      {svc.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={svc.category || 'General'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {svc.averageProcessingTime || 5} min
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({svc.minimumProcessingTime || 2} - {svc.maximumProcessingTime || 10} min)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <ConfidenceBadge level={confidence} />
                      <Typography variant="caption" color="text.secondary">
                        ({svc.completedCount || 0} completed)
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {svc.requiredDocuments?.length || 0} docs
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(svc)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(svc.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle fontWeight={700}>
          {editingService ? 'Edit Campus Service' : 'Add New Campus Service'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField
              label="Service Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              label="Category"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Avg Time (min)"
                type="number"
                fullWidth
                value={avgTime}
                onChange={(e) => setAvgTime(e.target.value)}
              />
              <TextField
                label="Min Time (min)"
                type="number"
                fullWidth
                value={minTime}
                onChange={(e) => setMinTime(e.target.value)}
              />
              <TextField
                label="Max Time (min)"
                type="number"
                fullWidth
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
              />
            </Stack>
            <TextField
              label="Required Documents (comma separated)"
              fullWidth
              value={reqDocs}
              onChange={(e) => setReqDocs(e.target.value)}
              placeholder="Student ID, Fee Receipt, Application Form"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2 }}>
            Save Service
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}

export default AdminServices;
