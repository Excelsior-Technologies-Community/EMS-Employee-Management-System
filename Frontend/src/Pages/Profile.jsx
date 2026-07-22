import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  CircularProgress, Alert, Avatar, Divider, Chip, Grid, Paper
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const roleColors = {
  admin:    { color: '#ef4444', bg: '#fef2f2' },
  hr:       { color: '#f59e0b', bg: '#fffbeb' },
  manager:  { color: '#3b82f6', bg: '#eff6ff' },
  employee: { color: '#10b981', bg: '#f0fdf4' },
};

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
    <Box sx={{
      width: 38, height: 38, borderRadius: 2,
      bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#64748b', flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, mb: 0.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{value || '—'}</Typography>
    </Box>
  </Box>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/employees/${id}`);
      setEmployee(res.data.data);
      setForm({ name: res.data.data.name, email: res.data.data.email, password: '' });
    } catch (err) {
      setErrorMsg('Profile load nahi ho saka.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployee(); }, [id]);

  const canEdit =
    user?.id === parseInt(id) ||
    user?.role?.toLowerCase() === 'admin' ||
    user?.role?.toLowerCase() === 'hr';

  const handleSave = async () => {
    setFormLoading(true);
    setErrorMsg('');
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await API.put(`/employees/${id}`, payload);
      setSuccessMsg('Profile successfully updated!');
      setEditMode(false);
      fetchEmployee();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Update nahi hua.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return <Alert severity="error" sx={{ mt: 4, mx: 'auto', maxWidth: 500 }}>Employee nahi mila.</Alert>;
  }

  const rc = roleColors[employee.role_name?.toLowerCase()] || { color: '#6b7280', bg: '#f9fafb' };

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', py: 2 }}>

      {/* Header Banner */}
      <Box sx={{
        borderRadius: 3,
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1976d2 100%)',
        p: 3, mb: 3,
        display: 'flex', alignItems: 'center', gap: 2.5,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decorations */}
        <Box sx={{
          position: 'absolute', right: -20, top: -20,
          width: 120, height: 120, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.06)',
        }} />
        <Box sx={{
          position: 'absolute', right: 60, bottom: -30,
          width: 80, height: 80, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.04)',
        }} />

        <Avatar sx={{
          width: 72, height: 72, fontSize: 28, fontWeight: 700,
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          border: '3px solid rgba(255,255,255,0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          {employee.name?.charAt(0).toUpperCase()}
        </Avatar>

        <Box>
          <Typography sx={{ color: 'white', fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
            {employee.name}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, mb: 1 }}>
            {employee.email}
          </Typography>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center',
            px: 1.5, py: 0.4, borderRadius: 10,
            bgcolor: rc.color + '33', border: `1px solid ${rc.color}66`,
          }}>
            <Typography sx={{ color: rc.color, fontSize: 12, fontWeight: 700 }}>
              {employee.role_name}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Alerts */}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 2, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 2, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Main Card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
        <CardContent sx={{ p: 3 }}>

          {editMode ? (
            /* ---- Edit Mode ---- */
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1e293b', mb: 2.5 }}>
                Edit Profile
              </Typography>
              <TextField
                fullWidth label="Full Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                margin="normal" size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth label="Email Address" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                margin="normal" size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth label="New Password (optional)" type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                margin="normal" size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={formLoading ? null : <SaveRoundedIcon />}
                  onClick={handleSave}
                  disabled={formLoading}
                  sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600 }}
                >
                  {formLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelRoundedIcon />}
                  onClick={() => setEditMode(false)}
                  sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600 }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            /* ---- View Mode ---- */
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>
                  Profile Details
                </Typography>
                {canEdit && (
                  <Button
                    variant="outlined"
                    startIcon={<EditRoundedIcon />}
                    onClick={() => setEditMode(true)}
                    size="small"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>

              <Divider sx={{ mb: 1 }} />

              <InfoRow
                icon={<BadgeRoundedIcon fontSize="small" />}
                label="Full Name"
                value={employee.name}
              />
              <Divider sx={{ opacity: 0.5 }} />
              <InfoRow
                icon={<EmailRoundedIcon fontSize="small" />}
                label="Email Address"
                value={employee.email}
              />
              <Divider sx={{ opacity: 0.5 }} />
              <InfoRow
                icon={<WorkRoundedIcon fontSize="small" />}
                label="Role"
                value={employee.role_name}
              />
              <Divider sx={{ opacity: 0.5 }} />
              <InfoRow
                icon={<BusinessRoundedIcon fontSize="small" />}
                label="Department"
                value={employee.department_name}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
