import { useState, useEffect } from 'react';
import { Box, Card, TextField, MenuItem, FormControl, InputLabel, Select, Grid, FormHelperText } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import CustomButton from '../../components/common/CustomButton';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { teamService } from '../../services/teamService';
import { departmentService } from '../../services/departmentService';
import { employeeService } from '../../services/employeeService';
import { getErrorMessage } from '../../services/api';

const TeamForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  const [formData, setFormData] = useState({
    team_name: '',
    department_id: '',
    manager_id: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch departments
        const deptRes = await departmentService.getAll();
        setDepartments(deptRes.data?.data || []);

        // Fetch employees to get manager list
        const empRes = await employeeService.getAll({ limit: 1000 });
        const employeesList = empRes.data?.data || [];
        setAllEmployees(employeesList);

        // Filter active managers
        const managerList = employeesList.filter(
          (e) => e.role_name === 'Manager' && e.status === 1
        );
        setManagers(managerList);

        // If edit mode, load team details
        if (isEdit) {
          const teamRes = await teamService.getById(id);
          const team = teamRes.data?.data;
          if (team) {
            setFormData({
              team_name: team.team_name,
              department_id: team.department_id,
              manager_id: team.manager_id
            });
          }
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/teams');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit, navigate]);

  // Filter managers based on selected department to avoid validation mismatch
  const filteredManagers = formData.department_id
    ? managers.filter((m) => m.department_id === parseInt(formData.department_id))
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset manager if department changes to avoid mismatch
      if (name === 'department_id') {
        updated.manager_id = '';
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.team_name.trim()) newErrors.team_name = 'Team Name is required.';
    if (!formData.department_id) newErrors.department_id = 'Department is required.';
    if (!formData.manager_id) newErrors.manager_id = 'Manager is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await teamService.update(id, formData);
        toast.success('Team updated successfully!');
      } else {
        await teamService.create(formData);
        toast.success('Team created successfully!');
      }
      navigate('/teams');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label={isEdit ? 'Loading Team Details...' : 'Loading Form Options...'} minHeight="60vh" />;
  }

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit Team' : 'Create Team'}
        crumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Teams', path: '/teams' },
          { label: isEdit ? 'Edit' : 'Create' }
        ]}
      />

      <Card sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="team_name"
                label="Team Name"
                value={formData.team_name}
                onChange={handleChange}
                fullWidth
                error={!!errors.team_name}
                helperText={errors.team_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.department_id}>
                <InputLabel id="dept-select-label">Department</InputLabel>
                <Select
                  labelId="dept-select-label"
                  name="department_id"
                  value={formData.department_id}
                  label="Department"
                  onChange={handleChange}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department_id && (
                  <FormHelperText>{errors.department_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                error={!!errors.manager_id}
                disabled={!formData.department_id}
              >
                <InputLabel id="manager-select-label">Team Manager</InputLabel>
                <Select
                  labelId="manager-select-label"
                  name="manager_id"
                  value={formData.manager_id}
                  label="Team Manager"
                  onChange={handleChange}
                >
                  {filteredManagers.length === 0 ? (
                    <MenuItem disabled value="">
                      <em>No managers in this department</em>
                    </MenuItem>
                  ) : (
                    filteredManagers.map((mgr) => (
                      <MenuItem key={mgr.id} value={mgr.id}>
                        {mgr.name} ({mgr.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.manager_id && (
                  <FormHelperText>{errors.manager_id}</FormHelperText>
                )}
                {!formData.department_id && (
                  <FormHelperText>Please select a department first.</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <CustomButton
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/teams')}
                disabled={saving}
              >
                Cancel
              </CustomButton>
              <CustomButton type="submit" loading={saving}>
                {isEdit ? 'Update Team' : 'Create Team'}
              </CustomButton>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
};

export default TeamForm;
