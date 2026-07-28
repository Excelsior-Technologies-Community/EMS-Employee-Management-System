import { TextField, InputAdornment } from '@mui/material';
import { Controller } from 'react-hook-form';

/**
 * TextField pre-wired to react-hook-form's Controller.
 * Pass `control`, `name`, and validation `rules` from the parent form.
 */
const CustomInput = ({
  control,
  name,
  rules,
  label,
  type = 'text',
  startIcon,
  endAdornment,
  fullWidth = true,
  ...rest
}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        {...rest}
        type={type}
        label={label}
        fullWidth={fullWidth}
        margin="normal"
        error={!!fieldState.error}
        helperText={fieldState.error?.message || rest.helperText}
        InputProps={{
          startAdornment: startIcon ? (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ) : undefined,
          endAdornment,
        }}
      />
    )}
  />
);

export default CustomInput;
