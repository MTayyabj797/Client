import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Stack, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export interface Column<T> {
  id: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, rows, onView, onEdit, onDelete, rowKey, emptyMessage = 'No records found' }: DataTableProps<T>) {
  const hasActions = Boolean(onView || onEdit || onDelete);

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Table sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align || 'left'} sx={{ fontWeight: 700, fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {col.label}
              </TableCell>
            ))}
            {hasActions && (
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13, color: 'text.secondary' }}>Actions</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} align="center" sx={{ py: 8 }}>
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <motion.tr
                key={rowKey(row)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                style={{ display: 'table-row' }}
              >
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align || 'left'} sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.id] ?? '')}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {onView && (
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => onView(row)} color="info"><Eye size={16} /></IconButton>
                        </Tooltip>
                      )}
                      {onEdit && (
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => onEdit(row)} color="primary"><Pencil size={16} /></IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => onDelete(row)} color="error"><Trash2 size={16} /></IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                )}
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function TablePagination({ count, page, rowsPerPage, onPageChange }: { count: number; page: number; rowsPerPage: number; onPageChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Showing {Math.min(page * rowsPerPage + 1, count)}–{Math.min((page + 1) * rowsPerPage, count)} of {count}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" disabled={page === 0} onClick={() => onPageChange(page - 1)} sx={{ borderRadius: 2 }}>Prev</Button>
        <Typography variant="body2" sx={{ alignSelf: 'center', px: 1 }}>{page + 1} / {totalPages}</Typography>
        <Button size="small" variant="outlined" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} sx={{ borderRadius: 2 }}>Next</Button>
      </Stack>
    </Box>
  );
}
