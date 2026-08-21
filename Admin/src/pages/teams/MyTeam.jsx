import { useState, useEffect } from 'react';
import { Box, Card, Typography, Grid, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, MenuItem, FormControl, InputLabel, Select, Divider, useMediaQuery, useTheme } from '@mui/material';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import { teamService } from '../../services/teamService';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';
import { colors } from '../../theme/colors';

const StatCard = ({ icon, label, value, tone }) => (
  <Card sx={{ p: { xs: 1.75, sm: 2.5 }, height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      alignItems: 'center', 
      textAlign: { xs: 'center', sm: 'left' },
      gap: { xs: 1, sm: 2 } 
    }}>
      <Box
        sx={{
          width: { xs: 36, sm: 44 },
          height: { xs: 36, sm: 44 },
          borderRadius: 2.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: tone.bg,
          color: tone.fg,
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ lineHeight: 1.1, fontWeight: 700, fontSize: { xs: '18px', sm: '24px' } }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '11px', sm: '14px' } }}>
          {label}
        </Typography>
      </Box>
    </Box>
  </Card>
);

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const MyTeam = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [teamsData, setTeamsData] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('all');

  const fetchManagerTeamData = async () => {
    setLoading(true);
    try {
      const teamRes = await teamService.getMyTeam();
      const fetchedTeams = teamRes.data?.data?.teams || [];
      setTeamsData(fetchedTeams);

      const dashRes = await teamService.getManagerDashboard();
      setDashboardData(dashRes.data?.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerTeamData();
  }, []);

  if (loading) {
    return <Loader label="Loading Team Dashboard..." minHeight="60vh" />;
  }

  if (teamsData.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Card sx={{ p: 4, maxWidth: 600, mx: 'auto', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No Active Team Assigned
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You are currently not registered as a manager for any active team. Please contact HR or Admin to assign your team.
          </Typography>
        </Card>
      </Box>
    );
  }

  // 1. Process Unique Employees across all teams for "All Teams" view
  const uniqueEmployees = [];
  teamsData.forEach((t) => {
    t.members.forEach((m) => {
      const existing = uniqueEmployees.find((x) => x.employee_id === m.employee_id);
      if (!existing) {
        uniqueEmployees.push({
          ...m,
          teamNames: [t.team_name],
          department_name: t.department_name
        });
      } else {
        if (!existing.teamNames.includes(t.team_name)) {
          existing.teamNames.push(t.team_name);
        }
      }
    });
  });

  // 2. Determine current members based on dropdown filter
  let currentMembers = [];
  if (selectedTeamId === 'all') {
    currentMembers = uniqueEmployees;
  } else {
    const selectedTeam = teamsData.find((t) => t.team_id === parseInt(selectedTeamId));
    if (selectedTeam) {
      currentMembers = selectedTeam.members.map((m) => ({
        ...m,
        teamNames: [selectedTeam.team_name],
        department_name: selectedTeam.department_name
      }));
    }
  }

  const currentMemberIds = currentMembers.map((m) => m.employee_id);

  // 3. Filter Attendance & Leaves for current selection
  const {
    todayTeamAttendance = [],
    teamLeaveRequests = [],
    upcomingTeamLeaves = []
  } = dashboardData || {};

  const filteredAttendance = todayTeamAttendance.filter((a) => currentMemberIds.includes(a.employee_id));
  const presentCount = filteredAttendance.filter((a) =>
    ['Present', 'Late', 'Half Day'].includes(a.status)
  ).length;
  const absentCount = currentMembers.length - presentCount;

  // Deduplicate leaves across teams just in case
  const uniqueLeaveRequests = [];
  teamLeaveRequests.forEach((leave) => {
    if (!uniqueLeaveRequests.find((x) => x.leave_id === leave.leave_id)) {
      uniqueLeaveRequests.push(leave);
    }
  });
  const filteredLeaveRequests = uniqueLeaveRequests.filter((l) => currentMemberIds.includes(l.employee_id));

  const uniqueUpcomingLeaves = [];
  upcomingTeamLeaves.forEach((leave) => {
    if (!uniqueUpcomingLeaves.find((x) => x.leave_id === leave.leave_id)) {
      uniqueUpcomingLeaves.push(leave);
    }
  });
  const filteredUpcomingLeaves = uniqueUpcomingLeaves.filter((l) => currentMemberIds.includes(l.employee_id));

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
      <PageHeader
        title="My Teams Dashboard"
        crumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'My Teams' }]}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
            <FormControl size="small" sx={{ minWidth: 200, width: '100%' }}>
              <InputLabel id="team-filter-label">Filter Team</InputLabel>
              <Select
                labelId="team-filter-label"
                value={selectedTeamId}
                label="Filter Team"
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                <MenuItem value="all">All Teams</MenuItem>
                {teamsData.map((t) => (
                  <MenuItem key={t.team_id} value={t.team_id}>
                    {t.team_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 4, mt: 1 }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            icon={<GroupRoundedIcon />}
            label="Total Members"
            value={currentMembers.length}
            tone={{ fg: colors.navy, bg: colors.navySoft }}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            icon={<CheckCircleRoundedIcon />}
            label="Present Today"
            value={presentCount}
            tone={{ fg: colors.success, bg: colors.successSoft }}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            icon={<CancelRoundedIcon />}
            label="Absent Today"
            value={absentCount}
            tone={{ fg: colors.neutral, bg: colors.neutralSoft }}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            icon={<EventNoteRoundedIcon />}
            label="Pending Leaves"
            value={filteredLeaveRequests.length}
            tone={{ fg: colors.amberDeep, bg: colors.amberSoft }}
          />
        </Grid>
      </Grid>

      {/* Tabs / Content Section */}
      <Card sx={{ borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Team Members" sx={{ fontWeight: 600 }} />
          <Tab label="Today's Attendance" sx={{ fontWeight: 600 }} />
          <Tab label="Pending Leaves" sx={{ fontWeight: 600 }} />
          <Tab label="Upcoming Leaves" sx={{ fontWeight: 600 }} />
        </Tabs>

        {/* Tab 1: Team Members */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Team(s)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No team members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentMembers.map((member) => (
                      <TableRow key={member.employee_id}>
                        <TableCell sx={{ fontWeight: 600 }}>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          {member.teamNames.map((n) => (
                            <Chip key={n} label={n} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                          ))}
                        </TableCell>
                        <TableCell>{member.department_name}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile view for Team Members */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {currentMembers.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 3 }}>No team members found.</Typography>
            ) : (
              <Grid container spacing={2}>
                {currentMembers.map((member) => (
                  <Grid item xs={12} key={member.employee_id}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{member.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                        {member.email}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                        {member.teamNames.map((n) => (
                          <Chip key={n} label={n} size="small" sx={{ fontSize: '10px' }} />
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Dept: {member.department_name}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>

        {/* Tab 2: Today's Attendance */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Work Hours</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No attendance records found for today.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendance.map((att) => (
                      <TableRow key={att.employee_id}>
                        <TableCell sx={{ fontWeight: 600 }}>{att.employee_name}</TableCell>
                        <TableCell>{att.check_in ? new Date(att.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                        <TableCell>{att.check_out ? new Date(att.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                        <TableCell>{att.work_hours ? `${att.work_hours} hrs` : '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={att.status || 'Absent'}
                            size="small"
                            color={
                              ['Present', 'Late', 'Half Day'].includes(att.status)
                                ? 'success'
                                : 'error'
                            }
                            sx={{ fontWeight: 700, fontSize: '11px' }}
                          />
                        </TableCell>
                        <TableCell>{att.remarks || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile View: Today's Attendance */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {filteredAttendance.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 3 }}>No attendance records found.</Typography>
            ) : (
              <Grid container spacing={2}>
                {filteredAttendance.map((att) => (
                  <Grid item xs={12} key={att.employee_id}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{att.employee_name}</Typography>
                        <Chip
                          label={att.status || 'Absent'}
                          size="small"
                          color={['Present', 'Late', 'Half Day'].includes(att.status) ? 'success' : 'error'}
                          sx={{ fontSize: '10px', fontWeight: 700 }}
                        />
                      </Box>
                      <Typography variant="body2" display="block">
                        In: {att.check_in ? new Date(att.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} | Out: {att.check_out ? new Date(att.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Hours: {att.work_hours ? `${att.work_hours} hrs` : '—'}
                      </Typography>
                      {att.remarks && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                          Remarks: {att.remarks}
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>

        {/* Tab 3: Pending Leaves */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeaveRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No pending leave requests.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaveRequests.map((leave) => (
                      <TableRow key={leave.leave_id}>
                        <TableCell sx={{ fontWeight: 600 }}>{leave.employee_name}</TableCell>
                        <TableCell>{leave.leave_name}</TableCell>
                        <TableCell>{leave.start_date}</TableCell>
                        <TableCell>{leave.end_date}</TableCell>
                        <TableCell>{leave.total_days} Days</TableCell>
                        <TableCell>{leave.reason || '—'}</TableCell>
                        <TableCell>
                          <Chip label={leave.status} size="small" color="warning" sx={{ fontWeight: 700, fontSize: '11px' }} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile View: Pending Leaves */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {filteredLeaveRequests.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 3 }}>No pending leave requests.</Typography>
            ) : (
              <Grid container spacing={2}>
                {filteredLeaveRequests.map((leave) => (
                  <Grid item xs={12} key={leave.leave_id}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{leave.employee_name}</Typography>
                        <Chip label={leave.status} size="small" color="warning" sx={{ fontSize: '10px' }} />
                      </Box>
                      <Typography variant="body2" display="block" sx={{ mb: 1 }}>
                        {leave.leave_name} — {leave.total_days} Days
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Dates: {leave.start_date} to {leave.end_date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                        Reason: {leave.reason || '—'}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>

        {/* Tab 4: Upcoming Leaves */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUpcomingLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No upcoming leaves.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUpcomingLeaves.map((leave) => (
                      <TableRow key={leave.leave_id}>
                        <TableCell sx={{ fontWeight: 600 }}>{leave.employee_name}</TableCell>
                        <TableCell>{leave.leave_name}</TableCell>
                        <TableCell>{leave.start_date}</TableCell>
                        <TableCell>{leave.end_date}</TableCell>
                        <TableCell>{leave.total_days} Days</TableCell>
                        <TableCell>{leave.reason || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile View: Upcoming Leaves */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {filteredUpcomingLeaves.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 3 }}>No upcoming leaves found.</Typography>
            ) : (
              <Grid container spacing={2}>
                {filteredUpcomingLeaves.map((leave) => (
                  <Grid item xs={12} key={leave.leave_id}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{leave.employee_name}</Typography>
                      <Typography variant="body2" display="block" sx={{ mb: 1 }}>
                        {leave.leave_name} — {leave.total_days} Days
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Dates: {leave.start_date} to {leave.end_date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                        Reason: {leave.reason || '—'}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default MyTeam;
