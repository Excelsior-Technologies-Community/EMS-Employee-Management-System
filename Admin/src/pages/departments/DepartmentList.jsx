import { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CustomButton from '../../components/common/CustomButton';
import DepartmentAvatar from '../../components/departments/DepartmentAvatar';
import DepartmentFormDialog from '../../components/departments/DepartmentFormDialog';
import AddDepartment from './AddDepartment';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { departmentService } from '../../services/departmentService';
import { getErrorMessage } from '../../services/api';

const DepartmentList = () => {
  const { hasRole } = useAuth();
  const canWrite = hasRole('Admin');

  const { data: res, loading, refetch } = useFetch(() => departmentService.getAll(), []);
  const departments = res?.data || [];

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await departmentService.remove(deleteTarget.id);
      toast.success('Department deleted successfully!');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'department_name', label: 'Department', render: (row) => <DepartmentAvatar name={row.department_name} /> },
    { key: 'description', label: 'Description', render: (row) => row.description || '—', sx: { display: { xs: 'none', sm: 'table-cell' } } },
    ...(canWrite
      ? [{
          key: 'actions',
          label: 'Actions',
          sortable: false,
          render: (row) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Edit">
                <IconButton size="small" color="primary" onClick={() => setEditTarget(row)}>
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ),
        }]
      : []),
  ];

  return (
    <Box>
      <PageHeader
        title="Departments"
        crumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Departments' }]}
        action={canWrite && (
          <CustomButton startIcon={<AddRoundedIcon />} onClick={() => setAddOpen(true)}>
            Add Department
          </CustomButton>
        )}
      />

      <DataTable
        columns={columns}
        rows={departments}
        loading={loading}
        searchKeys={['department_name', 'description']}
        searchPlaceholder="Search departments..."
        emptyLabel="No departments found."
      />

      <AddDepartment open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refetch} />
      <DepartmentFormDialog
        open={!!editTarget}
        mode="edit"
        department={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Department"
        description={`Are you sure you want to delete "${deleteTarget?.department_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default DepartmentList;
