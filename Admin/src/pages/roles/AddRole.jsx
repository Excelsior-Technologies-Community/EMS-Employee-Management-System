import RoleFormDialog from '../../components/roles/RoleFormDialog';

const AddRole = ({ open, onClose, onSuccess }) => (
  <RoleFormDialog open={open} onClose={onClose} onSuccess={onSuccess} />
);

export default AddRole;
