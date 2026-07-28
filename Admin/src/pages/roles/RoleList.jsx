import { useState } from 'react';
import { Box } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import CustomButton from '../../components/common/CustomButton';
import RoleBadge from '../../components/roles/RoleBadge';
import AddRole from './AddRole';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { roleService } from '../../services/roleService';

const RoleList = () => {
  const { hasRole } = useAuth();
  const canAdd = hasRole('Admin');

  const { data: res, loading, refetch } = useFetch(() => roleService.getAll(), []);
  const roles = res?.data || [];
  const [addOpen, setAddOpen] = useState(false);

  const columns = [
    { key: 'id', label: '#', render: (row) => `#${row.id}` },
    { key: 'role_name', label: 'Role', render: (row) => <RoleBadge role={row.role_name} /> },
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
