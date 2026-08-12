import { useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Printer, Wallet, TrendingUp, TrendingDown, Banknote } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import DataTable, { TablePagination } from '@/components/DataTable';
import LedgerSummary from '@/components/LedgerSummary';
import EmptyState from '@/components/EmptyState';
import FormDialog from '@/components/FormDialog';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { useCustomer, useCustomerLedger, useAddCustomerLedgerEntry, type LedgerEntry } from '@/hooks/useCustomers';
import { formatCurrency, formatDate } from '@/utils/format';
import { exportTableToPDF, printDocument } from '@/components/PDFButton';

export default function CustomerLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [formOpen, setFormOpen] = useState(false);

  const customerQuery = useCustomer(id!);
  const ledgerQuery = useCustomerLedger(id!, { page, limit: rowsPerPage });
  const addEntryMut = useAddCustomerLedgerEntry(id!);

  const customer = customerQuery.data;
  const entries: LedgerEntry[] = ledgerQuery.data?.data ?? [];
  const meta = ledgerQuery.data?.meta;

  const totalDebit = entries.filter((e) => e.debit > 0).reduce((s, e) => s + e.debit, 0);
  const totalCredit = entries.filter((e) => e.credit > 0).reduce((s, e) => s + e.credit, 0);
  const opening = customer?.opening_balance ?? 0;
  const current = customer?.current_balance ?? 0;

  const handleAdd = (vals: Record<string, string | number>) => {
    addEntryMut.mutate(
      {
        date: vals.date,
        description: String(vals.description),
        debit: Number(vals.debit),
        credit: Number(vals.credit),
        payment_method: String(vals.method).toLowerCase(),
      },
      { onSuccess: () => setFormOpen(false) }
    );
  };

  const handleExport = () => {
    exportTableToPDF(
      `Ledger - ${customer?.name ?? id}`,
      ['Date', 'Description', 'Debit', 'Credit', 'Balance', 'Method'],
      entries.map((e) => [formatDate(e.date), e.description, formatCurrency(e.debit), formatCurrency(e.credit), formatCurrency(e.balance), e.payment_method]),
      `Customer: ${customer?.name} (${id})`
    );
  };

  const handlePrint = () => {
    const rowsHtml = entries.map((e) => `<tr><td>${formatDate(e.date)}</td><td>${e.description}</td><td>${formatCurrency(e.debit)}</td><td>${formatCurrency(e.credit)}</td><td>${formatCurrency(e.balance)}</td><td>${e.payment_method}</td></tr>`).join('');
    printDocument(`Customer Ledger - ${customer?.name}`, `<h1>Customer Ledger</h1><p class="sub">${customer?.name} · ${customer?.phone}</p><table><thead><tr><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th><th>Method</th></tr></thead><tbody>${rowsHtml}</tbody></table>`);
  };

  const columns = [
    { id: 'date', label: 'Date', render: (r: typeof entries[number]) => formatDate(r.date) },
    { id: 'description', label: 'Description' },
    { id: 'debit', label: 'Debit', align: 'right' as const, render: (r: typeof entries[number]) => (r.debit ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(r.debit)}</span> : '—') },
    { id: 'credit', label: 'Credit', align: 'right' as const, render: (r: typeof entries[number]) => (r.credit ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(r.credit)}</span> : '—') },
    { id: 'balance', label: 'Balance', align: 'right' as const, render: (r: typeof entries[number]) => <strong>{formatCurrency(r.balance)}</strong> },
    { id: 'payment_method', label: 'Method', render: (r: typeof entries[number]) => <span style={{ textTransform: 'capitalize' }}>{r.payment_method}</span> },
  ];

  const summaryCards = [
    { title: 'Opening Balance', value: formatCurrency(opening), icon: Wallet, color: '#2563eb' },
    { title: 'Current Balance', value: formatCurrency(current), icon: Banknote, color: '#0891b2' },
    { title: 'Total Sales', value: formatCurrency(totalDebit), icon: TrendingUp, color: '#16a34a' },
    { title: 'Total Paid', value: formatCurrency(totalCredit), icon: TrendingDown, color: '#d97706' },
  ];

  return (
    <Box>
      <PageHeader
        title={customer ? `${customer.name} - Ledger` : 'Customer Ledger'}
        subtitle={`${customer?.phone ?? ''} · ${customer?.address ?? ''}`}
        breadcrumbs={[{ label: 'Customers', path: '/customers' }, { label: customer?.name ?? 'Ledger' }]}
        action={<Button variant="outlined" startIcon={<ArrowLeft size={18} />} onClick={() => navigate('/customers')} sx={{ borderRadius: 2 }}>Back</Button>}
      />

      {customerQuery.isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : customerQuery.isError ? (
        <ErrorState message="Failed to load customer" onRetry={() => customerQuery.refetch()} />
      ) : (
        <LedgerSummary cards={summaryCards} />
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<Plus size={18} />} onClick={() => setFormOpen(true)} sx={{ borderRadius: 2 }}>Add Transaction</Button>
        <Button variant="outlined" startIcon={<Printer size={18} />} onClick={handlePrint} sx={{ borderRadius: 2 }}>Print</Button>
        <Button variant="contained" startIcon={<FileText size={18} />} onClick={handleExport} sx={{ borderRadius: 2 }}>Export PDF</Button>
      </Stack>

      {ledgerQuery.isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : ledgerQuery.isError ? (
        <ErrorState message="Failed to load ledger" onRetry={() => ledgerQuery.refetch()} />
      ) : entries.length === 0 ? (
        <EmptyState title="No transactions" message="Add a transaction to start this ledger." actionLabel="Add Transaction" onAction={() => setFormOpen(true)} />
      ) : (
        <>
          <DataTable columns={columns} rows={entries} rowKey={(r) => r.id} />
          <TablePagination count={meta?.total ?? entries.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
        </>
      )}

      <FormDialog
        open={formOpen}
        title="Add Transaction"
        fields={[
          { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) },
          { name: 'description', label: 'Description', required: true },
          { name: 'debit', label: 'Debit (Sale)', type: 'number', defaultValue: 0 },
          { name: 'credit', label: 'Credit (Payment)', type: 'number', defaultValue: 0 },
          { name: 'method', label: 'Payment Method', type: 'select', options: ['cash', 'bank', 'adjustment'], defaultValue: 'cash' },
        ]}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAdd}
      />
    </Box>
  );
}
