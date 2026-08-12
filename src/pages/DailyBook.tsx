import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import TableToolbar from '@/components/TableToolbar';
import DataTable, { TablePagination } from '@/components/DataTable';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { useDailyBook, type DailyEntry } from '@/hooks/useCashBank';
import { formatCurrency } from '@/utils/format';

export default function DailyBook() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const { data: result, isLoading, isError, refetch } = useDailyBook({ page, limit: rowsPerPage });
  const entries: DailyEntry[] = result?.data ?? [];
  const meta = result?.meta;

  const handleExport = () => {
    import('@/components/PDFButton').then(({ exportTableToPDF }) => {
      exportTableToPDF('Daily Book (Roznamcha)', ['Date', 'Description', 'Ref Type', 'Debit', 'Credit', 'Balance'],
        entries.map((e) => [e.date, e.description, e.ref_type ?? '', formatCurrency(e.debit), formatCurrency(e.credit), formatCurrency(e.running_balance)]));
    });
  };

  const columns = [
    { id: 'date', label: 'Date', render: (r: typeof entries[number]) => new Date(r.date).toLocaleString('en-GB') },
    { id: 'description', label: 'Transaction', render: (r: typeof entries[number]) => <strong>{r.description}</strong> },
    { id: 'ref_type', label: 'Reference', render: (r: typeof entries[number]) => <Chip label={r.ref_type ?? '—'} size="small" variant="outlined" /> },
    { id: 'debit', label: 'Debit', align: 'right' as const, render: (r: typeof entries[number]) => (r.debit ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(r.debit)}</span> : '—') },
    { id: 'credit', label: 'Credit', align: 'right' as const, render: (r: typeof entries[number]) => (r.credit ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(r.credit)}</span> : '—') },
    { id: 'running_balance', label: 'Balance', align: 'right' as const, render: (r: typeof entries[number]) => <strong>{formatCurrency(r.running_balance)}</strong> },
  ];

  return (
    <Box>
      <PageHeader title="Daily Book (Roznamcha)" subtitle="Chronological record of every transaction" breadcrumbs={[{ label: 'Daily Book' }]}
        action={<Button variant="contained" startIcon={<FileText size={18} />} onClick={handleExport} sx={{ borderRadius: 2 }}>Export PDF</Button>} />

      <TableToolbar search={search} onSearchChange={setSearch} onExport={handleExport} showAdd={false} showFilter={false} />

      {isLoading ? <LoadingSkeleton rows={8} /> : isError ? <ErrorState message="Failed to load daily book" onRetry={() => refetch()} /> : !isMobile ? (
        <>
          <DataTable columns={columns} rows={entries} rowKey={(r) => r.id} />
          <TablePagination count={meta?.total ?? entries.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
        </>
      ) : (
        <Box>
          <Box sx={{ position: 'relative', pl: 3 }}>
            <Box sx={{ position: 'absolute', left: 11, top: 8, bottom: 8, width: 2, bgcolor: 'divider' }} />
            {entries.map((e, i) => (
              <Box key={e.id} sx={{ position: 'relative', mb: 2 }}>
                <Box sx={{ position: 'absolute', left: -22, top: 6, width: 12, height: 12, borderRadius: '50%', bgcolor: e.debit > 0 ? 'error.main' : 'success.main', border: 2, borderColor: 'background.paper' }} />
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{e.description}</Typography>
                        <Chip label={e.ref_type ?? '—'} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{new Date(e.date).toLocaleString('en-GB')}</Typography>
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          {e.debit > 0 ? <span style={{ color: '#dc2626' }}>Dr: {formatCurrency(e.debit)}</span> : <span style={{ color: '#16a34a' }}>Cr: {formatCurrency(e.credit)}</span>}
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>Bal: {formatCurrency(e.running_balance)}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Box>
          <TablePagination count={meta?.total ?? entries.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
        </Box>
      )}
    </Box>
  );
}
