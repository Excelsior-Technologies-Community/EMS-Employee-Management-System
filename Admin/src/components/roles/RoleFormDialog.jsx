import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import CustomInput from '../common/CustomInput';
import CustomButton from '../common/CustomButton';
import { roleService } from '../../services/roleService';
import { getErrorMessage } from '../../services/api';

const RoleFormDialog = ({ open, onClose, onSuccess }) => {
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { role_name: '' },
  });

  useEffect(() => {
    if (open) reset({ role_name: '' });
  }, [open, reset]);

  const onSubmit = async (values) => {
    try {
      await roleService.add(values);
      toast.success('Role added successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add New Role</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <CustomInput
            name="role_name"
            control={control}
            label="Role name"
            autoFocus
            rules={{ required: 'Role name is required' }}
            startIcon={<AdminPanelSettingsRoundedIcon fontSize="small" />}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <CustomButton variant="text" color="inherit" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CustomButton>
          <CustomButton type="submit" loading={isSubmitting}>
            Add Role
          </CustomButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RoleFormDialog;
