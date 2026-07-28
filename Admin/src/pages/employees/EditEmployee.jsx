import EmployeeFormDialog from '../../components/employees/EmployeeFormDialog';

const EditEmployee = ({ open, employee, onClose, onSuccess }) => (
  <EmployeeFormDialog open={open} mode="edit" employee={employee} onClose={onClose} onSuccess={onSuccess} />
);

export default EditEmployee;
