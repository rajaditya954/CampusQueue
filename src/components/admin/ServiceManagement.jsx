import { useState, useMemo } from 'react';
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
  InputAdornment,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { useServices } from '../../hooks/useServices';
import { ConfidenceBadge } from '../StatusBadge';
import { getConfidenceLevel } from '../../features/queue/queueEstimator';

export function ServiceManagement() {
  const { services, addService, updateService, deleteService, error, clearError } = useServices();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [avgTime, setAvgTime] = useState(5);
  const [minTime, setMinTime] = useState(2);
  const [maxTime, setMaxTime] = useState(10);
  const [reqDocs, setReqDocs] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState(null);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter(svc => {
      const matchesSearch =
        svc.name.toLowerCase().includes(search.toLowerCase()) ||
        (svc.description || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && svc.isActive !== false) ||
        (statusFilter === 'INACTIVE' && svc.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setCategory('Academic');
    setAvgTime(5);
    setMinTime(2);
    setMaxTime(10);
    setReqDocs('Student ID Card');
    setIsActive(true);
    setFormError(null);
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
    setIsActive(svc.isActive !== false);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Service Name cannot be empty.');
      return;
    }

    const durationNum = Number(avgTime);
    if (isNaN(durationNum) || durationNum <= 0) {
      setFormError('Estimated Duration must be a positive number greater than 0.');
      return;
    }

    // Duplicate check for new service
    if (!editingService) {
      const exists = services.some(s => s.name.toLowerCase() === trimmedName.toLowerCase());
      if (exists) {
        setFormError(`A service with the name "${trimmedName}" already exists.`);
        return;
      }
    }

    const docsArray = reqDocs.split(',').map(d => d.trim()).filter(Boolean);
    const servicePayload = {
      name: trimmedName,
      description: description.trim(),
      category: category.trim() || 'General',
      averageProcessingTime: durationNum,
      minimumProcessingTime: Number(minTime) || 2,
      maximumProcessingTime: Number(maxTime) || 10,
      requiredDocuments: docsArray,
      isActive,
    };

    try {
      if (editingService) {
        await updateService(editingService.id, servicePayload);
      } else {
        await addService(servicePayload);
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save service.');
    }
  };

  const handleToggleActiveStatus = async (svc) => {
    try {
      await updateService(svc.id, { isActive: !svc.isActive });
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteService(serviceToDelete.id);
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      console.error('Delete service error:', err);
    }
  };

  return (
    <Box>
      {/* Header & Controls */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BuildIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Campus Services Catalog
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage master service definitions, default durations, and document prerequisites.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', px: 3 }}
        >
          Add New Service
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Filter Toolbar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search by service name or description..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />

        <Stack direction="row" spacing={1}>
          {['ALL', 'ACTIVE', 'INACTIVE'].map(st => (
            <Chip
              key={st}
              label={st === 'ALL' ? 'All Services' : st.charAt(0) + st.slice(1).toLowerCase()}
              clickable
              color={statusFilter === st ? 'primary' : 'default'}
              variant={statusFilter === st ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter(st)}
              size="small"
            />
          ))}
        </Stack>
      </Paper>

      {/* Table */}
      {filteredServices.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No services found matching criteria.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ mt: 1, borderRadius: 2 }}>
            Configure Your First Service
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Service Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Baseline Duration</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Confidence & Stats</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredServices.map((svc) => {
                const confidence = getConfidenceLevel(svc);
                const active = svc.isActive !== false;
                return (
                  <TableRow key={svc.id} hover sx={{ opacity: active ? 1 : 0.65 }}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {svc.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 260, display: 'block' }}>
                        {svc.description || 'No description provided'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip label={svc.category || 'General'} size="small" variant="outlined" />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {svc.averageProcessingTime || 5} mins
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Range: {svc.minimumProcessingTime || 2}–{svc.maximumProcessingTime || 10} min
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
                      <Chip
                        icon={active ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                        label={active ? 'Active' : 'Inactive'}
                        color={active ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title={active ? 'Deactivate Service' : 'Activate Service'}>
                        <Switch
                          size="small"
                          checked={active}
                          onChange={() => handleToggleActiveStatus(svc)}
                          color="primary"
                        />
                      </Tooltip>

                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(svc)}>
                        <EditIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => { setServiceToDelete(svc); setDeleteConfirmOpen(true); }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth paperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>
          {editingService ? 'Edit Service Definition' : 'Add New Campus Service'}
        </DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField
              label="Service Name"
              placeholder="e.g. Fee & Cash Payment"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

            <TextField
              label="Description"
              placeholder="Describe the campus service process..."
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <TextField
              label="Category"
              placeholder="Academic, Finance, Administration..."
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Estimated Duration (Minutes)"
                type="number"
                fullWidth
                value={avgTime}
                onChange={(e) => setAvgTime(e.target.value)}
                required
                helperText="Baseline for queue wait estimator"
              />
              <TextField
                label="Min Duration"
                type="number"
                fullWidth
                value={minTime}
                onChange={(e) => setMinTime(e.target.value)}
              />
              <TextField
                label="Max Duration"
                type="number"
                fullWidth
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
              />
            </Stack>

            <TextField
              label="Required Documents (Comma Separated)"
              placeholder="Student ID, Fee Receipt, Clearance Form"
              fullWidth
              value={reqDocs}
              onChange={(e) => setReqDocs(e.target.value)}
            />

            <FormControlLabel
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="primary" />}
              label={<strong>Service Active Status</strong>}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2, fontWeight: 700 }}>
            {editingService ? 'Update Service' : 'Create Service'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} paperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete Service?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete service <strong>{serviceToDelete?.name}</strong>?
          </Typography>
          <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
            Note: Deactivating a service is recommended instead of deleting if students have existing queue records.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ServiceManagement;
