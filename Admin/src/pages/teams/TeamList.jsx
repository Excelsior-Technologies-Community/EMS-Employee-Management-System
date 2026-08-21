import { useState } from 'react';
import { Box, IconButton, Tooltip, Chip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import CustomButton from '../../components/common/CustomButton';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { teamService } from '../../services/teamService';

const TeamList = () => {
  const navigate = useNavigate();
  const { data: res, loading, refetch } = useFetch(() => teamService.getAll(), []);
  const teams = res?.data || [];

  const columns = [
    {
      key: 'team_name',
      label: 'Team Name',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.team_name}
        </Typography>
      )
    },
    {
      key: 'manager_name',
      label: 'Manager',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.manager_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.manager_email}
          </Typography>
        </Box>
      )
    },
    {
      key: 'department_name',
      label: 'Department',
      render: (row) => row.department_name
    },
    {
      key: 'active_member_count',
      label: 'Members Count',
      render: (row) => (
        <Chip
          label={`${row.active_member_count} Members`}
          size="small"
          color={row.active_member_count > 0 ? 'primary' : 'default'}
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.status === 1 ? 'Active' : 'Inactive'}
          size="small"
          color={row.status === 1 ? 'success' : 'neutral'}
          sx={{
            fontWeight: 700,
            fontSize: '11px',
            bgcolor: row.status === 1 ? 'success.soft' : 'neutral.soft'
          }}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/teams/${row.id}`)}
            >
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Team">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/teams/${row.id}/edit`)}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Teams Management"
        crumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Teams' }]}
        action={
          <CustomButton
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate('/teams/new')}
          >
            Create Team
          </CustomButton>
        }
      />

      <DataTable
        columns={columns}
        rows={teams}
        loading={loading}
        searchKeys={['team_name', 'manager_name', 'department_name']}
        searchPlaceholder="Search teams..."
        emptyLabel="No teams found."
      />
    </Box>
  );
};

export default TeamList;
