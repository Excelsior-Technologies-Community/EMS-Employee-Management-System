import DepartmentFormDialog from '../../components/departments/DepartmentFormDialog';

const AddDepartment = ({ open, onClose, onSuccess }) => (
  <DepartmentFormDialog open={open} mode="add" onClose={onClose} onSuccess={onSuccess} />
);

export default AddDepartment;
