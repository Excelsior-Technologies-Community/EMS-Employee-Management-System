import { useState, useEffect } from 'react';
import { Box, Card, Typography, Grid, IconButton, Tooltip, Chip, MenuItem, FormControl, InputLabel, Select, Divider, useMediaQuery, useTheme } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import CustomButton from '../../components/common/CustomButton';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { teamService } from '../../services/teamService';
import { employeeService } from '../../services/employeeService';
import { getErrorMessage } from '../../services/api';
import { colors } from '../../theme/colors';

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [team, setTeam] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);

  const fetchTeamDetails = async () => {
    try {
      const res = await teamService.getById(id);
      setTeam(res.data?.data);
      setErrorMsg('');

      const empRes = await employeeService.getAll({ limit: 1000 });
      setAllEmployees(empRes.data?.data || []);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  if (loading) {
    return <Loader label="Loading Team Details..." minHeight="60vh" />;
  }

  if (errorMsg) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <WarningAmberRoundedIcon /> {errorMsg}
        </Typography>
        <CustomButton startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/teams')}>
          Back to Teams
        </CustomButton>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="h6" sx={{ mb: 2 }}>Team not found.</Typography>
        <CustomButton startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/teams')}>
          Back to Teams
        </CustomButton>
      </Box>
    );
  }

  const isManagerOfTeam = user?.role === 'Manager' && team.manager_id === user.id;
  const canManage = hasRole('Admin', 'HR') || isManagerOfTeam;

  const activeMembers = team.members ? team.members.filter(m => m.status === 1) : [];

  const activeMemberIds = activeMembers.map(m => m.employee_id);
  const eligibleEmployees = allEmployees.filter(e => 
    e.status === 1 && 
    e.role_name === 'Employee' && 
    e.department_id === team.department_id && 
    !activeMemberIds.includes(e.id)
  );

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    setAddingMember(true);
    try {
      await teamService.addMember(team.id, selectedEmpId);
      toast.success('Employee added to team successfully.');
      setSelectedEmpId('');
      fetchTeamDetails();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!deleteTarget) return;

    setRemovingMember(true);
    try {
      await teamService.removeMember(team.id, deleteTarget.employee_id);
      toast.success('Employee removed from team successfully.');
      setDeleteTarget(null);
      fetchTeamDetails();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingMember(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Name', 
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.name}
        </Typography>
      )
    },
    { key: 'email', label: 'Email', render: (row) => row.email },
    { key: 'department', label: 'Department', render: (row) => row.department || '—' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (row) => (
        <Chip
          label={row.status === 1 ? 'Active' : 'Inactive'}
          size="small"
          color="success"
          sx={{ fontWeight: 600, fontSize: '11px' }}
        />
      )
    },
    ...(canManage
      ? [{
          key: 'actions',
          label: 'Actions',
          sortable: false,
          render: (row) => (
            <Tooltip title="Remove Member">
              <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }]
      : [])
  ];

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
      <PageHeader
        title={team.team_name}
        crumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Teams', path: hasRole('Admin', 'HR') ? '/teams' : undefined },
          { label: team.team_name }
        ]}
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Left Column: Team Info Card (30% on desktop) */}
        <Grid item xs={12} lg={3.6} xl={3}>
          <Card sx={{ borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.navy, mb: 1, letterSpacing: '0.5px' }}>
              TEAM INFORMATION
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={6} lg={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Team Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.ink }}>
                  {team.team_name}
                </Typography>
              </Grid>

              <Grid item xs={6} lg={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Department
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {team.department_name}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Manager
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {team.manager_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {team.manager_email}
                </Typography>
              </Grid>

              <Grid item xs={6} lg={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Members
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {activeMembers.length}
                </Typography>
              </Grid>

              <Grid item xs={6} lg={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Status
                </Typography>
                <Chip
                  label={team.status === 1 ? 'Active' : 'Inactive'}
                  size="small"
                  color={team.status === 1 ? 'success' : 'default'}
                  sx={{ fontWeight: 700, fontSize: '11px' }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Column: Members Card (70% on desktop) */}
        <Grid item xs={12} lg={8.4} xl={9}>
          <Card sx={{ borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
            {/* Header section with add form */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', md: 'center' },
                gap: 2,
                mb: 2.5
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.navy }}>
                Team Members ({activeMembers.length})
              </Typography>

              {canManage && (
                <Box
                  component="form"
                  onSubmit={handleAddMember}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'row', sm: 'row' },
                    gap: 1.5,
                    alignItems: 'center',
                    width: { xs: '100%', md: 'auto' },
                    minWidth: { md: 360 }
                  }}
                >
                  <FormControl fullWidth size="small">
                    <InputLabel id="add-member-label">Select Employee</InputLabel>
                    <Select
                      labelId="add-member-label"
                      value={selectedEmpId}
                      label="Select Employee"
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                    >
                      {eligibleEmployees.length === 0 ? (
                        <MenuItem disabled value="">
                          <em>No eligible employees available</em>
                        </MenuItem>
                      ) : (
                        eligibleEmployees.map((emp) => (
                          <MenuItem key={emp.id} value={emp.id}>
                            {emp.name} ({emp.email})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  <CustomButton
                    type="submit"
                    variant="contained"
                    size="medium"
                    startIcon={<AddRoundedIcon />}
                    disabled={!selectedEmpId || eligibleEmployees.length === 0 || addingMember}
                    loading={addingMember}
                    sx={{ flexShrink: 0 }}
                  >
                    Add
                  </CustomButton>
                </Box>
              )}
            </Box>

            {eligibleEmployees.length === 0 && canManage && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1.5, mb: 2, fontStyle: 'italic' }}>
                No eligible employees available.
              </Typography>
            )}

            <Divider sx={{ mb: 2.5 }} />

            {/* Desktop and Tablet table view */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <DataTable
                columns={columns}
                rows={activeMembers}
                loading={false}
                searchKeys={['name', 'email']}
                searchPlaceholder="Search members..."
                emptyLabel={
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <GroupRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                    <Typography color="text.secondary">No team members added yet.</Typography>
                  </Box>
                }
              />
            </Box>

            {/* Responsive Mobile Cards view (< 600px / sm) */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              {activeMembers.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <GroupRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                  <Typography color="text.secondary">No team members added yet.</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {activeMembers.map((member) => (
                    <Grid item xs={12} key={member.employee_id}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
                        <Box sx={{ pr: 4 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            {member.email}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={member.department || 'IT'} size="small" variant="outlined" />
                            <Chip label="Active" size="small" color="success" variant="outlined" />
                          </Box>
                        </Box>
                        {canManage && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(member)}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Member"
        description={`Are you sure you want to remove ${deleteTarget?.name} from ${team.team_name} Team?`}
        confirmLabel="Remove"
        loading={removingMember}
        onConfirm={handleRemoveMember}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default TeamDetails;
