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
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import BadgeIcon from '@mui/icons-material/Badge';
import { useStudents } from '../../hooks/useStudents';

export function StudentManagement() {
  const { students, addStudent, updateStudent, setStudentActiveStatus, error, clearError } = useStudents();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form State
  const [studentIdInput, setStudentIdInput] = useState('');
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState(null);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter(stu => {
      const sId = (stu.studentId || stu.id || '').toLowerCase();
      const sName = (stu.name || '').toLowerCase();
      const query = search.toLowerCase();

      const matchesSearch = sId.includes(query) || sName.includes(query);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && stu.active !== false) ||
        (statusFilter === 'INACTIVE' && stu.active === false);

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setStudentIdInput('');
    setName('');
    setIsActive(true);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (stu) => {
    setEditingStudent(stu);
    setStudentIdInput(stu.studentId || stu.id);
    setName(stu.name || '');
    setIsActive(stu.active !== false);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);
    const formattedId = studentIdInput.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!formattedId) {
      setFormError('Student ID is required.');
      return;
    }
    if (!trimmedName) {
      setFormError('Student Name is required.');
      return;
    }

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.studentId || editingStudent.id, {
          name: trimmedName,
          active: isActive,
        });
      } else {
        await addStudent({
          studentId: formattedId,
          name: trimmedName,
          active: isActive,
        });
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save student record.');
    }
  };

  const handleToggleStatus = async (stu) => {
    try {
      const targetId = stu.studentId || stu.id;
      await setStudentActiveStatus(targetId, !stu.active);
    } catch (err) {
      console.error('Toggle student status error:', err);
    }
  };

  return (
    <Box>
      {/* Header Controls */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Student Records Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure student accounts authorized to access campus service queues.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', px: 3 }}
        >
          Add New Student
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
          placeholder="Search by Student ID or Name..."
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
              label={st === 'ALL' ? 'All Students' : st.charAt(0) + st.slice(1).toLowerCase()}
              clickable
              color={statusFilter === st ? 'primary' : 'default'}
              variant={statusFilter === st ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter(st)}
              size="small"
            />
          ))}
        </Stack>
      </Paper>

      {/* Student Data Table */}
      {filteredStudents.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No student records found matching search.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ mt: 1, borderRadius: 2 }}>
            Add Your First Student Record
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((stu) => {
                const active = stu.active !== false;
                const sId = stu.studentId || stu.id;
                return (
                  <TableRow key={sId} hover sx={{ opacity: active ? 1 : 0.65 }}>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <BadgeIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                          {sId}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {stu.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip label="student" size="small" variant="outlined" sx={{ textTransform: 'lowercase', fontSize: '0.75rem' }} />
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
                      <Tooltip title={active ? 'Deactivate Student Account' : 'Activate Student Account'}>
                        <Switch
                          size="small"
                          checked={active}
                          onChange={() => handleToggleStatus(stu)}
                          color="primary"
                        />
                      </Tooltip>

                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(stu)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Student Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle fontWeight={700}>
          {editingStudent ? 'Edit Student Record' : 'Add New Student Record'}
        </DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField
              label="Student ID"
              placeholder="e.g. 23CSE1010"
              fullWidth
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              disabled={!!editingStudent}
              required
              autoFocus
              helperText={editingStudent ? 'Student ID cannot be changed once created.' : 'Must be unique campus identifier'}
            />

            <TextField
              label="Student Name"
              placeholder="e.g. Rahul Sharma"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextField
              label="Role"
              value="student"
              fullWidth
              disabled
              helperText="Role is automatically set to student"
            />

            <FormControlLabel
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="primary" />}
              label={<strong>Active Account Status</strong>}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2, fontWeight: 700 }}>
            {editingStudent ? 'Update Student' : 'Create Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StudentManagement;
