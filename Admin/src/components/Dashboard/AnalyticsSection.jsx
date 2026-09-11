import { useEffect, useState } from 'react';

import {
  Box,
  Divider,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';

import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';

import { departmentService } from '../../services/departmentService';
import { roleService } from '../../services/roleService';
import { employeeService } from '../../services/employeeService';

import { colors } from '../../theme/colors';

import ChartContainer from './ChartContainer';

import DepartmentChart from './charts/DepartmentChart';
import AttendanceChart from './charts/AttendanceChart';
import LeaveChart from './charts/LeaveChart';
import JoiningChart from './charts/JoiningChart';

const AnalyticsSection = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    departmentId: '',
    roleId: '',
    employeeId: '',
    status: ''
  });

  const [appliedFilters, setAppliedFilters] =
    useState({
      startDate: '',
      endDate: '',
      departmentId: '',
      roleId: '',
      employeeId: '',
      status: ''
    });

  const [departments, setDepartments] =
    useState([]);

  const [roles, setRoles] =
    useState([]);

  const [employees, setEmployees] =
    useState([]);

  useEffect(() => {
    departmentService
      .getAll()
      .then((res) =>
        setDepartments(
          res.data?.data || []
        )
      );

    roleService
      .getAll()
      .then((res) =>
        setRoles(
          res.data?.data || []
        )
      );

    employeeService
      .getAll({ limit: 1000 })
      .then((res) =>
        setEmployees(
          res.data?.data || []
        )
      );
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...filters
    });
  };

  const handleResetFilters = () => {
    const cleared = {
      startDate: '',
      endDate: '',
      departmentId: '',
      roleId: '',
      employeeId: '',
      status: ''
    };

    setFilters(cleared);
    setAppliedFilters(cleared);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 4 }} />

      <Box
        sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <FilterAltRoundedIcon
          sx={{
            color: colors.navy,
            fontSize: 28
          }}
        />

        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: colors.navy
          }}
        >
          Company Analytics & Reports
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 3,
          mb: 4,
          border: `1px solid ${colors.line}`,
          borderRadius: 3
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
        >

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
              lg: 2
            }}
          >
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              size="small"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value
                }))
              }
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
              lg: 2
            }}
          >
            <TextField
              label="End Date"
              type="date"
              fullWidth
              size="small"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value
                }))
              }
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
              lg: 2
            }}
          >
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>
                Department
              </InputLabel>

              <Select
                label="Department"
                value={filters.departmentId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    departmentId:
                      e.target.value
                  }))
                }
              >
                <MenuItem value="">
                  <em>
                    All Departments
                  </em>
                </MenuItem>

                {departments.map((dept) => (
                  <MenuItem
                    key={dept.id}
                    value={dept.id}
                  >
                    {dept.department_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
              lg: 2
            }}
          >
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>
                Role
              </InputLabel>

              <Select
                label="Role"
                value={filters.roleId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    roleId:
                      e.target.value
                  }))
                }
              >
                <MenuItem value="">
                  <em>
                    All Roles
                  </em>
                </MenuItem>

                {roles.map((r) => (
                  <MenuItem
                    key={r.id}
                    value={r.id}
                  >
                    {r.role_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
              lg: 2
            }}
          >
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>
                Employee
              </InputLabel>

              <Select
                label="Employee"
                value={filters.employeeId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    employeeId:
                      e.target.value
                  }))
                }
              >
                <MenuItem value="">
                  <em>
                    All Employees
                  </em>
                </MenuItem>

                {employees.map((emp) => (
                  <MenuItem
                    key={emp.id}
                    value={emp.id}
                  >
                    {emp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
              lg: 2
            }}
          >
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>
                Leave Status
              </InputLabel>

              <Select
                label="Leave Status"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status:
                      e.target.value
                  }))
                }
              >
                <MenuItem value="">
                  <em>
                    All Statuses
                  </em>
                </MenuItem>

                <MenuItem value="Pending">
                  Pending
                </MenuItem>

                <MenuItem value="Approved">
                  Approved
                </MenuItem>

                <MenuItem value="Rejected">
                  Rejected
                </MenuItem>

                <MenuItem value="Cancelled">
                  Cancelled
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            size={{ xs: 12 }}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              mt: 1
            }}
          >
            <Button
              variant="outlined"
              size="medium"
              startIcon={
                <RefreshRoundedIcon />
              }
              onClick={
                handleResetFilters
              }
              sx={{
                borderRadius: 2
              }}
            >
              Reset Filters
            </Button>

            <Button
              variant="contained"
              size="medium"
              startIcon={
                <FactCheckRoundedIcon />
              }
              onClick={
                handleApplyFilters
              }
              sx={{
                borderRadius: 2,
                bgcolor: colors.navy,
                '&:hover': {
                  bgcolor:
                    colors.navyDeep
                }
              }}
            >
              Apply Filters
            </Button>
          </Grid>

        </Grid>
      </Paper>

      <Grid
        container
        spacing={3.5}
      >
        <Grid
          size={{
            xs: 12,
            md: 6
          }}
        >
          <ChartContainer title="Employees by Department">
            <DepartmentChart
              appliedFilters={
                appliedFilters
              }
            />
          </ChartContainer>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6
          }}
        >
          <ChartContainer title="Monthly Attendance Trend">
            <AttendanceChart
              appliedFilters={
                appliedFilters
              }
            />
          </ChartContainer>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6
          }}
        >
          <ChartContainer title="Monthly Leave Stats">
            <LeaveChart
              appliedFilters={
                appliedFilters
              }
            />
          </ChartContainer>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6
          }}
        >
          <ChartContainer title="Monthly Joining Trend">
            <JoiningChart
              appliedFilters={
                appliedFilters
              }
            />
          </ChartContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsSection;