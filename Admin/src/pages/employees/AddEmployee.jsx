import EmployeeFormDialog from '../../components/employees/EmployeeFormDialog';

const AddEmployee = ({ open, onClose, onSuccess }) => (
  <EmployeeFormDialog open={open} mode="add" onClose={onClose} onSuccess={onSuccess} />
);

export default AddEmployee;
