import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { Plus, FileText } from 'lucide-react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import TableToolbar from '@/components/TableToolbar';
import DataTable, { TablePagination } from '@/components/DataTable';
import LedgerSummary from '@/components/LedgerSummary';
import EmptyState from '@/components/EmptyState';
import FormDialog from '@/components/FormDialog';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { useCashBook, useCreateCashEntry, type CashEntry } from '@/hooks/useCashBank';
import { formatCurrency, formatDate } from '@/utils/format';

export default function CashBook() {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [formOpen, setFormOpen] = useState(false);  
  const [search, setSearch] = useState('');
  const createMut = useCreateCashEntry();

  // const { data: result, isLoading, isError, refetch } = useCashBook({ page, limit: rowsPerPage });
  const { data: result, isLoading, isError, refetch } =
  useCashBook({
    page,
    limit: rowsPerPage,
    search: search || undefined,
  });


  const entries: CashEntry[] = result?.data ?? [];
  const meta = result?.meta;
  const summary = (meta as Record<string, unknown> | undefined)?.summary as { cash_in: number; cash_out: number; closing_balance: number } | undefined;

  const current = summary?.closing_balance ?? entries[0]?.running_balance ?? 0;
  const totalIn = summary?.cash_in ?? entries.reduce((s, e) => s + e.cash_in, 0);
  const totalOut = summary?.cash_out ?? entries.reduce((s, e) => s + e.cash_out, 0);
  const opening = current - totalIn + totalOut;

  const handleAdd = (vals: Record<string, string | number>) => {
    createMut.mutate({
      date: vals.date,
      description: String(vals.description),
      cash_in: Number(vals.cashIn),
      cash_out: Number(vals.cashOut),
    }, { onSuccess: () => setFormOpen(false) });
  };

  const handleExport = () => {
    import('@/components/PDFButton').then(({ exportTableToPDF }) => {
      exportTableToPDF('Cash Book', ['Date', 'Description', 'Cash In', 'Cash Out', 'Balance'],
        entries.map((e) => [formatDate(e.date), e.description, formatCurrency(e.cash_in), formatCurrency(e.cash_out), formatCurrency(e.running_balance)]));
    });
  };

  const columns = [
    { id: 'date', label: 'Date', render: (r: typeof entries[number]) => formatDate(r.date) },
    { id: 'description', label: 'Description' },
    { id: 'cash_in', label: 'Cash In', align: 'right' as const, render: (r: typeof entries[number]) => (r.cash_in ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(r.cash_in)}</span> : '—') },
    { id: 'cash_out', label: 'Cash Out', align: 'right' as const, render: (r: typeof entries[number]) => (r.cash_out ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(r.cash_out)}</span> : '—') },
    { id: 'running_balance', label: 'Balance', align: 'right' as const, render: (r: typeof entries[number]) => <strong>{formatCurrency(r.running_balance)}</strong> },
  ];

  const summaryCards = [
    { title: 'Opening Cash', value: formatCurrency(opening), icon: Wallet, color: '#2563eb' },
    { title: 'Total Cash In', value: formatCurrency(totalIn), icon: TrendingUp, color: '#16a34a' },
    { title: 'Total Cash Out', value: formatCurrency(totalOut), icon: TrendingDown, color: '#dc2626' },
    { title: 'Current Cash', value: formatCurrency(current), icon: Wallet, color: '#0891b2' },
  ];

  return (
    <Box>
      <PageHeader title="Cash Book" subtitle="Track all cash inflows and outflows" breadcrumbs={[{ label: 'Cash Book' }]}
        action={<Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setFormOpen(true)} sx={{ borderRadius: 2 }}>Add Entry</Button>} />

      {isLoading ? <LoadingSkeleton rows={4} /> : isError ? <ErrorState message="Failed to load cash book" onRetry={() => refetch()} /> : <LedgerSummary cards={summaryCards} />}

      {/* <TableToolbar search="" onSearchChange={() => {}} onExport={handleExport} addLabel="Add Entry" onAdd={() => setFormOpen(true)} showFilter={false} /> */}
      <TableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onExport={handleExport}
        addLabel="Add Entry"
        onAdd={() => setFormOpen(true)}
        showFilter={false}
      />

      {isLoading ? <LoadingSkeleton rows={8} /> : isError ? <ErrorState message="Failed to load cash entries" onRetry={() => refetch()} /> : entries.length === 0 ? (
        <EmptyState title="No cash entries" message="Add a cash entry to start your cash book." actionLabel="Add Entry" onAction={() => setFormOpen(true)} />
      ) : (
        <>
          <DataTable columns={columns} rows={entries} rowKey={(r) => r.id} />
          <TablePagination count={meta?.total ?? entries.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
        </>
      )}

      <FormDialog open={formOpen} title="Add Cash Entry" fields={[
        { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) },
        { name: 'description', label: 'Description', required: true },
        { name: 'cashIn', label: 'Cash In', type: 'number', defaultValue: 0 },
        { name: 'cashOut', label: 'Cash Out', type: 'number', defaultValue: 0 },
      ]} onClose={() => setFormOpen(false)} onSubmit={handleAdd} />
    </Box>
  );
}
