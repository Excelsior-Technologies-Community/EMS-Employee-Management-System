import { TextField, InputAdornment } from '@mui/material';
import { Controller } from 'react-hook-form';

const CustomInput = ({
  control,
  name,
  rules,
  label,
  type = 'text',
  startIcon,
  endAdornment,
  fullWidth = true,
  select = false,
  children,
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
        select={select}
        type={type}
        label={label}
        fullWidth={fullWidth}
        margin="normal"
        error={!!fieldState.error}
        helperText={fieldState.error?.message || rest.helperText}
        InputProps={
          select
            ? undefined
            : {
                startAdornment: startIcon ? (
                  <InputAdornment position="start">{startIcon}</InputAdornment>
                ) : undefined,
                endAdornment,
              }
        }
      >
        {children}
      </TextField>
    )}
  />
);

export default CustomInput;
