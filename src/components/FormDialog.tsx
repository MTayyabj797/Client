import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack } from '@mui/material';
import { useForm, Controller, type Control } from 'react-hook-form';
import { TextField, MenuItem } from '@mui/material';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'date';
  options?: string[] | SelectOption[];
  required?: boolean;
  defaultValue?: string | number;
  /** Show this field only when the referenced field equals one of these values. */
  visibleWhen?: { field: string; equals: string[] };
}

interface FormDialogProps {
  open: boolean;
  title: string;
  fields: FieldDef[];
  onClose: () => void;
  onSubmit: (data: Record<string, string | number>) => void;
}

function normalizeOptions(opts?: string[] | SelectOption[]): SelectOption[] {
  if (!opts) return [];
  if (opts.length === 0) return [];
  if (typeof opts[0] === 'string') {
    return (opts as string[]).map((v) => ({ value: v, label: v }));
  }
  return opts as SelectOption[];
}

export default function FormDialog({ open, title, fields, onClose, onSubmit }: FormDialogProps) {
  const defaultValues = fields.reduce(
    (acc, f) => ({ ...acc, [f.name]: f.defaultValue ?? (f.type === 'number' ? 0 : '') }),
    {} as Record<string, string | number>
  );
  const { control, handleSubmit, reset, watch, setValue } = useForm<Record<string, string | number>>({ defaultValues });

  // Reset form state whenever the dialog opens or the field set changes.
  useEffect(() => {
    if (open) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const watchedValues = watch();

  // When a field with conditional dependents changes, clear dependents that should now be hidden.
  useEffect(() => {
    fields.forEach((f) => {
      if (f.visibleWhen) {
        const depVal = String(watchedValues[f.visibleWhen.field] ?? '');
        const shouldShow = f.visibleWhen.equals.includes(depVal);
        if (!shouldShow && watchedValues[f.name]) {
          setValue(f.name, '');
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues]);

  const handleClose = () => { reset(); onClose(); };

  const submit = (data: Record<string, string | number>) => {
    // Strip values from hidden conditional fields before submitting.
    const cleaned: Record<string, string | number> = { ...data };
    fields.forEach((f) => {
      if (f.visibleWhen) {
        const depVal = String(cleaned[f.visibleWhen.field] ?? '');
        if (!f.visibleWhen.equals.includes(depVal)) {
          cleaned[f.name] = '';
        }
      }
    });
    onSubmit(cleaned);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <form onSubmit={handleSubmit(submit)}>
        <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {fields.map((field) => {
              // Conditional visibility — hidden unless the dependency matches.
              if (field.visibleWhen) {
                const depVal = String(watchedValues[field.visibleWhen.field] ?? '');
                if (!field.visibleWhen.equals.includes(depVal)) return null;
              }

              const options = normalizeOptions(field.options);
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control as Control<Record<string, string | number>>}
                  render={({ field: { value, onChange } }) =>
                    field.type === 'select' ? (
                      <TextField select fullWidth label={field.label} value={value} onChange={onChange} required={field.required}>
                        {options.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField
                        fullWidth
                        label={field.label}
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        value={value}
                        onChange={onChange}
                        required={field.required}
                        InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                      />
                    )
                  }
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 2 }}>Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
