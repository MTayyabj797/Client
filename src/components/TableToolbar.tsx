import { InputAdornment, TextField, Button, Stack, IconButton, Tooltip } from '@mui/material';
import { Search, Filter, Plus, FileText } from 'lucide-react';

interface TableToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  onAdd?: () => void;
  onFilter?: () => void;
  onExport?: () => void;
  addLabel?: string;
  showAdd?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
}

export default function TableToolbar({
  search,
  onSearchChange,
  onAdd,
  onFilter,
  onExport,
  addLabel = 'Add',
  showAdd = true,
  showFilter = true,
  showExport = true,
}: TableToolbarProps) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
      <TextField
        size="small"
        placeholder="Search…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: { xs: '100%', md: 280 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} />
            </InputAdornment>
          ),
        }}
      />
      <Stack direction="row" spacing={1} flexShrink={0}>
        {showFilter && (
          <Tooltip title="Filter">
            <IconButton onClick={onFilter} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Filter size={18} />
            </IconButton>
          </Tooltip>
        )}
        {showExport && (
          <Button variant="outlined" startIcon={<FileText size={18} />} onClick={onExport} sx={{ borderRadius: 2 }}>
            PDF
          </Button>
        )}
        {showAdd && (
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={onAdd} sx={{ borderRadius: 2 }}>
            {addLabel}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
