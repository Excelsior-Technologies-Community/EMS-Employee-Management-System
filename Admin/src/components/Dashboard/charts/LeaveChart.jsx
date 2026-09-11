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

const LeaveChart = ({ appliedFilters }) => {
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
          params.start_date =
            appliedFilters.startDate;
        }

        if (appliedFilters.endDate) {
          params.end_date =
            appliedFilters.endDate;
        }

        if (appliedFilters.departmentId) {
          params.department_id =
            appliedFilters.departmentId;
        }

        if (appliedFilters.employeeId) {
          params.employee_id =
            appliedFilters.employeeId;
        }

        if (appliedFilters.status) {
          params.status =
            appliedFilters.status;
        }

        const res =
          await analyticsService.getMonthlyLeaveStats(
            params
          );

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
      <BarChart data={data}>
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

        <Tooltip cursor={{ fill: colors.navySoft }} />

        <Legend />

        <Bar
          dataKey="pending"
          name="Pending"
          fill={colors.amber}
          radius={[2, 2, 0, 0]}
        />

        <Bar
          dataKey="approved"
          name="Approved"
          fill={colors.success}
          radius={[2, 2, 0, 0]}
        />

        <Bar
          dataKey="rejected"
          name="Rejected"
          fill={colors.danger}
          radius={[2, 2, 0, 0]}
        />

        <Bar
          dataKey="cancelled"
          name="Cancelled"
          fill={colors.neutral}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LeaveChart;