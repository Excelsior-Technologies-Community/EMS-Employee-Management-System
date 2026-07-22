import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const EMPTY_FORM = { department_name: '', description: '' };

const Departments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const canAdd = user?.role === 'Admin';
  const canEdit = user?.role === 'Admin';
  const canDelete = user?.role === 'Admin';

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/departments');
      setDepartments(res.data.data || []);
    } catch {
      setErrorMsg('Departments load nahi ho sake.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const openAddDialog = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setIsEdit(false);
    setEditId(null);
    setDialogOpen(true);
  };

  const openEditDialog = (dept) => {
    setForm({ department_name: dept.department_name, description: dept.description || '' });
    setFormError('');
    setIsEdit(true);
    setEditId(dept.id);
    setDialogOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!form.department_name) {
      setFormError('Department name required hai.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      if (isEdit) {
        await API.put(`/departments/${editId}`, form);
        setSuccessMsg('Department update ho gaya!');
      } else {
        await API.post('/departments', form);
        setSuccessMsg('Department add ho gaya!');
      }
      setDialogOpen(false);
      fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Kuch error hua.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/departments/${deleteDialog.id}`);
      setSuccessMsg('Department delete ho gaya!');
      setDeleteDialog({ open: false, id: null, name: '' });
      fetchDepartments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Delete nahi hua.');
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Departments</Typography>
        {canAdd && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
            Add Department
          </Button>
        )}
      </Box>

      {successMsg && <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 2 }}>{errorMsg}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'success.main' }}>
              <TableRow>
                {['#', 'Department Name', 'Description', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Koi department nahi hai.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept, i) => (
                  <TableRow key={dept.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell><strong>{dept.department_name}</strong></TableCell>
                    <TableCell>{dept.description || '—'}</TableCell>
                    <TableCell>
                      {canEdit && (
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => openEditDialog(dept)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: dept.id, name: dept.department_name })}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Department Update Karen' : 'Naya Department Add Karen'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 1 }}>{formError}</Alert>}
          <TextField
            fullWidth label="Department Name" value={form.department_name}
            onChange={(e) => setForm({ ...form, department_name: e.target.value })} margin="normal"
          />
          <TextField
            fullWidth label="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            margin="normal" multiline rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit} disabled={formLoading}>
            {formLoading ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}>
        <DialogTitle>Delete Confirm</DialogTitle>
        <DialogContent>
          <Typography>
            Kya aap <strong>{deleteDialog.name}</strong> department delete karna chahte hain?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Departments;
