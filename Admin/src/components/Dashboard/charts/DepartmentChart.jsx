import { useEffect, useState } from 'react';

import {
  Box,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import { analyticsService } from '../../../services/analyticsService';
import { getErrorMessage } from '../../../services/api';
import { colors } from '../../../theme/colors';

const DepartmentChart = ({ appliedFilters }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};

        if (appliedFilters.roleId) {
          params.role_id = appliedFilters.roleId;
        }

        const res =
          await analyticsService.getEmployeesByDepartment(params);

        setData(res.data?.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appliedFilters.roleId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 5
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (data.length === 0) {
    return (
      <Typography
        align="center"
        color="text.secondary"
        sx={{ py: 5 }}
      >
        No data available for selected filters.
      </Typography>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={colors.line}
        />

        <XAxis
          dataKey="department_name"
          tick={{
            fill: colors.inkSoft,
            fontSize: 12
          }}
        />

        <YAxis
          tick={{
            fill: colors.inkSoft,
            fontSize: 12
          }}
        />

        <Tooltip cursor={{ fill: colors.navySoft }} />

        <Legend />

        <Bar
          dataKey="employee_count"
          name="Employees"
          fill={colors.navy}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DepartmentChart;