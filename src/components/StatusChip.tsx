import { Chip } from '@mui/material';

type Status = 'Active' | 'Inactive' | 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Paid' | 'Partial' | 'Unpaid' | 'Cancelled';

const statusColor: Record<Status, 'success' | 'warning' | 'error' | 'default'> = {
  Active: 'success',
  Inactive: 'default',
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'error',
  Paid: 'success',
  Partial: 'warning',
  Unpaid: 'error',
  Cancelled: 'warning'
};

export default function StatusChip({ status }: { status: Status }) {
  return (
    <Chip
      label={status}
      size="small"
      color={statusColor[status]}
      variant="outlined"
      sx={{ fontWeight: 600, fontSize: 12, borderWidth: 1.2, borderRadius: 1.5 }}
    />
  );
}
