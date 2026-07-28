import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import CustomInput from '../common/CustomInput';
import CustomButton from '../common/CustomButton';
import { departmentService } from '../../services/departmentService';
import { getErrorMessage } from '../../services/api';

const DepartmentFormDialog = ({ open, mode = 'add', department, onClose, onSuccess }) => {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { department_name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset(isEdit && department
        ? { department_name: department.department_name, description: department.description || '' }
        : { department_name: '', description: '' });
    }
  }, [open, isEdit, department, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await departmentService.update(department.id, values);
        toast.success('Department updated successfully!');
      } else {
        await departmentService.add(values);
        toast.success('Department added successfully!');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Department' : 'Add New Department'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <CustomInput
            name="department_name"
            control={control}
            label="Department name"
            rules={{ required: 'Department name is required' }}
            startIcon={<ApartmentRoundedIcon fontSize="small" />}
          />
          <CustomInput
            name="description"
            control={control}
            label="Description"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <CustomButton variant="text" color="inherit" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CustomButton>
          <CustomButton type="submit" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Add Department'}
          </CustomButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DepartmentFormDialog;
