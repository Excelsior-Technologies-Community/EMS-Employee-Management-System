import { useState } from 'react';
import { Box, IconButton, Tooltip, Switch } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CustomButton from '../../components/common/CustomButton';
import RoleBadge from '../../components/roles/RoleBadge';
import DepartmentAvatar from '../../components/departments/DepartmentAvatar';
import AddEmployee from './AddEmployee';
import EditEmployee from './EditEmployee';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { employeeService } from '../../services/employeeService';
import { getErrorMessage } from '../../services/api';

const EmployeeList = () => {
  const { hasRole } = useAuth();
  const canAdd = hasRole('Admin', 'HR');
  const canEdit = hasRole('Admin', 'HR');
  const canDelete = hasRole('Admin');
  const canToggleStatus = hasRole('Admin', 'HR');

  const { data: res, loading, refetch } = useFetch(() => employeeService.getAll({ limit: 1000 }), []);
  const employees = res?.data || [];

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const handleToggleStatus = async (row) => {
    setTogglingId(row.id);
    try {
      const next = row.status === 1 ? 0 : 1;
      await employeeService.toggleStatus(row.id, next);
      toast.success(`${row.name} ${next === 1 ? 'activated' : 'deactivated'}.`);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeService.remove(deleteTarget.id);
      toast.success('Employee deleted successfully!');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role_name', label: 'Role', render: (row) => <RoleBadge role={row.role_name} /> },
    { key: 'department_name', label: 'Department', render: (row) => <DepartmentAvatar name={row.department_name} size={26} /> },
    ...(canToggleStatus
      ? [{
          key: 'status',
          label: 'Status',
          sortable: false,
          render: (row) => (
            <Switch
              size="small"
              color="success"
              checked={row.status === 1}
              disabled={togglingId === row.id}
              onChange={() => handleToggleStatus(row)}
            />
          ),
        }]
      : []),
    ...((canEdit || canDelete)
      ? [{
          key: 'actions',
          label: 'Actions',
          sortable: false,
          render: (row) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {canEdit && (
                <Tooltip title="Edit">
                  <IconButton size="small" color="primary" onClick={() => setEditTarget(row)}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {canDelete && (
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ),
        }]
      : []),
  ];

  return (
    <Box>
      <PageHeader
        title="Employees"
        crumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Employees' }]}
        action={canAdd && (
          <CustomButton startIcon={<AddRoundedIcon />} onClick={() => setAddOpen(true)}>
            Add Employee
          </CustomButton>
        )}
      />

      <DataTable
        columns={columns}
        rows={employees}
        loading={loading}
        searchKeys={['name', 'email', 'role_name', 'department_name']}
        searchPlaceholder="Search by name, email, or role..."
        emptyLabel="No employees found."
      />

      <AddEmployee open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refetch} />
      <EditEmployee open={!!editTarget} employee={editTarget} onClose={() => setEditTarget(null)} onSuccess={refetch} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Employee"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default EmployeeList;
