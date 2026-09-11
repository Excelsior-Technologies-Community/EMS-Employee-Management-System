import { useEffect, useState } from 'react';

import {
  Box,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import { analyticsService } from '../../../services/analyticsService';
import { getErrorMessage } from '../../../services/api';
import { colors } from '../../../theme/colors';

const JoiningChart = ({ appliedFilters }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};

        if (appliedFilters.startDate) {
          params.start_date = appliedFilters.startDate;
        }

        if (appliedFilters.endDate) {
          params.end_date = appliedFilters.endDate;
        }

        if (appliedFilters.departmentId) {
          params.department_id = appliedFilters.departmentId;
        }

        if (appliedFilters.roleId) {
          params.role_id = appliedFilters.roleId;
        }

        const res =
          await analyticsService.getMonthlyEmployeeJoining(params);

        setData(res.data?.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appliedFilters]);

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
      <LineChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={colors.line}
        />

        <XAxis
          dataKey="month"
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

        <Tooltip cursor={{ stroke: colors.navySoft }} />

        <Legend />

        <Line
          type="monotone"
          dataKey="employee_count"
          name="New Employees"
          stroke={colors.navy}
          strokeWidth={2.5}
          dot={{ fill: colors.navy, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default JoiningChart;