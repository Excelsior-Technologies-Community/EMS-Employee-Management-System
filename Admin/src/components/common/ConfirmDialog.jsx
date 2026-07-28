import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box,
} from '@mui/material';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import CustomButton from './CustomButton';
import { colors } from '../../theme/colors';

/**
 * Generic confirmation dialog. Used before deletes or other irreversible actions.
 * `loading` disables both buttons and shows a spinner on Confirm.
 */
const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  confirmColor = 'error',
  loading = false,
  onConfirm,
  onClose,
}) => (
  <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: 34, height: 34, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          bgcolor: colors.dangerSoft, color: colors.danger,
        }}
      >
        <WarningRoundedIcon fontSize="small" />
      </Box>
      {title}
    </DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <CustomButton variant="text" color="inherit" onClick={onClose} disabled={loading}>
        Cancel
      </CustomButton>
      <CustomButton color={confirmColor} loading={loading} onClick={onConfirm}>
        {confirmLabel}
      </CustomButton>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
