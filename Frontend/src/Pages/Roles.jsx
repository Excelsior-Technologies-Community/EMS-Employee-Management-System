import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import API from '../api/axios';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await API.get('/roles');
      setRoles(res.data.data || []);
    } catch {
      setErrorMsg('Roles load nahi ho sake.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleAddRole = async () => {
    if (!roleName.trim()) {
      setFormError('Role name required hai.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      await API.post('/roles', { role_name: roleName });
      setSuccessMsg('Role add ho gaya!');
      setDialogOpen(false);
      setRoleName('');
      fetchRoles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Kuch error hua.');
    } finally {
      setFormLoading(false);
    }
  };

  const roleColors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Roles</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setDialogOpen(true); setFormError(''); setRoleName(''); }}>
          Add Role
        </Button>
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
            <TableHead sx={{ bgcolor: 'warning.main' }}>
              <TableRow>
                {['#', 'Role Name'].map((h) => (
                  <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Koi role nahi hai.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role, i) => (
                  <TableRow key={role.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Chip
                        label={role.role_name}
                        color={roleColors[i % roleColors.length]}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Role Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Naya Role Add Karen</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 1 }}>{formError}</Alert>}
          <TextField
            fullWidth autoFocus label="Role Name" value={roleName}
            onChange={(e) => setRoleName(e.target.value)} margin="normal"
            onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRole} disabled={formLoading}>
            {formLoading ? <CircularProgress size={20} color="inherit" /> : 'Add Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Roles;
