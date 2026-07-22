import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Alert, Chip,
  Tooltip, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const EMPTY_FORM = { name: '', email: '', password: '', role_id: '', department_id: '' };

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const canAdd = ['Admin', 'HR'].includes(user?.role);
  const canEdit = ['Admin', 'HR'].includes(user?.role);
  const canDelete = user?.role === 'Admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, roleRes, deptRes] = await Promise.all([
        API.get('/employees'),
        API.get('/roles'),
        API.get('/departments'),
      ]);
      setEmployees(empRes.data.data || []);
      setRoles(roleRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (err) {
      setErrorMsg('Data load karne mein problem hui.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAddDialog = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setIsEdit(false);
    setEditId(null);
    setDialogOpen(true);
  };

  const openEditDialog = (emp) => {
    setForm({
      name: emp.name,
      email: emp.email,
      password: '',
      role_id: emp.role_id,
      department_id: emp.department_id || '',
    });
    setFormError('');
    setIsEdit(true);
    setEditId(emp.id);
    setDialogOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!form.name || !form.email || (!isEdit && !form.password) || !form.role_id || !form.department_id) {
      setFormError('Sab required fields fill karein.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      if (isEdit) {
        const payload = { name: form.name, email: form.email, role_id: form.role_id, department_id: form.department_id };
        if (form.password) payload.password = form.password;
        await API.put(`/employees/${editId}`, payload);
        setSuccessMsg('Employee update ho gaya!');
      } else {
        await API.post('/employees/add', form);
        setSuccessMsg('Employee add ho gaya!');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Kuch error hua.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/employees/${deleteDialog.id}`);
      setSuccessMsg('Employee delete ho gaya!');
      setDeleteDialog({ open: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Delete nahi hua.');
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.role_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight="bold">Employees</Typography>
        {canAdd && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
            Add Employee
          </Button>
        )}
      </Box>

      {successMsg && <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <TextField
        placeholder="Search by name, email or role..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: { xs: '100%', sm: 320 } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                {['#', 'Name', 'Email', 'Role', 'Department', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Koi employee nahi mila.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((emp, i) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Chip label={emp.role_name} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{emp.department_name || '—'}</TableCell>
                    <TableCell>
                      {canEdit && (
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => openEditDialog(emp)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: emp.id, name: emp.name })}>
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
        <DialogTitle>{isEdit ? 'Employee Update Karen' : 'Naya Employee Add Karen'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 1 }}>{formError}</Alert>}
          <TextField fullWidth label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} margin="normal" />
          <TextField
            fullWidth label={isEdit ? 'New Password (optional)' : 'Password'}
            type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} margin="normal"
          />
          <TextField
            fullWidth select label="Role" value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: e.target.value })} margin="normal"
          >
            {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.role_name}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth select label="Department" value={form.department_id}
            onChange={(e) => setForm({ ...form, department_id: e.target.value })} margin="normal"
          >
            {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.department_name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit} disabled={formLoading}>
            {formLoading ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}>
        <DialogTitle>Delete Confirm</DialogTitle>
        <DialogContent>
          <Typography>
            Kya aap <strong>{deleteDialog.name}</strong> ko delete karna chahte hain? Yeh action undo nahi hoga.
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

export default Employees;
