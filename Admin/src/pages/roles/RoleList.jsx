import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import CustomButton from '../../components/common/CustomButton';
import RoleBadge from '../../components/roles/RoleBadge';
import AddRole from './AddRole';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { roleService } from '../../services/roleService';
import { colors } from '../../theme/colors';

const RoleList = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const canAdd = hasRole('Admin');

  const { data: res, loading, refetch } = useFetch(() => roleService.getAll(), []);
  const roles = res?.data || [];
  const [addOpen, setAddOpen] = useState(false);

  const handleViewEmployees = (roleName) => {
    navigate(`/employees?role=${encodeURIComponent(roleName)}`);
  };

  const columns = [
    { key: 'id', label: '#', render: (row) => row.id, sx: { width: 80 } },
    { key: 'role_name', label: 'Role', render: (row) => <RoleBadge role={row.role_name} /> },
    { 
      key: 'status', 
      label: 'Status', 
      render: (row) => (
        <Chip 
          label={row.status === 1 ? 'Active' : 'Inactive'} 
          size="small"
          sx={{ 
            bgcolor: row.status === 1 ? colors.successSoft : colors.neutralSoft, 
            color: row.status === 1 ? colors.success : colors.inkSoft,
            fontWeight: 700,
            fontSize: 11.5,
            height: 22
          }}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <CustomButton
          size="small"
          variant="text"
          color="primary"
          onClick={() => handleViewEmployees(row.role_name)}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
          sx={{ fontWeight: 700, p: 0, '&:hover': { background: 'none', textDecoration: 'underline' } }}
        >
          View Employees
        </CustomButton>
      )
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Roles"
        crumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Roles' }]}
        action={canAdd && (
          <CustomButton startIcon={<AddRoundedIcon />} onClick={() => setAddOpen(true)}>
            Add Role
          </CustomButton>
        )}
      />

      <DataTable
        columns={columns}
        rows={roles}
        loading={loading}
        searchKeys={['role_name']}
        searchPlaceholder="Search roles..."
        emptyLabel="No roles found."
      />

      <AddRole open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refetch} />
    </Box>
  );
};

export default RoleList;
