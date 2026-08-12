import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, MenuItem } from '@mui/material';
import { useState } from 'react';

interface FilterDialogProps {
  open: boolean;
  title?: string;
  fields: { name: string; label: string; options: string[] }[];
  onApply: (filters: Record<string, string>) => void;
  onClose: () => void;
}

export default function FilterDialog({ open, title = 'Filter', fields, onApply, onClose }: FilterDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const handle = (name: string, v: string) => setValues((prev) => ({ ...prev, [name]: v }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {fields.map((f) => (
            <TextField key={f.name} select fullWidth label={f.label} value={values[f.name] || ''} onChange={(e) => handle(f.name, e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {f.options.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={() => { setValues({}); onApply({}); onClose(); }} variant="outlined" sx={{ borderRadius: 2 }}>Reset</Button>
        <Button onClick={() => { onApply(values); onClose(); }} variant="contained" sx={{ borderRadius: 2 }}>Apply</Button>
      </DialogActions>
    </Dialog>
  );
}
