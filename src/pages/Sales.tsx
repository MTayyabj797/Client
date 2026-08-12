import { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { PlusCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import TableToolbar from '@/components/TableToolbar';
import DataTable, { TablePagination } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import SaleFormDialog from '@/components/SaleFormDialog';
import SaleDetailsDialog from '@/components/SaleDetailsDialog';
import FilterDialog from '@/components/FilterDialog';
import EmptyState from '@/components/EmptyState';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { useSales, useSale, useCreateSale, type Sale } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useBankAccounts } from '@/hooks/useCashBank';
import { formatCurrency, formatDate } from '@/utils/format';

export default function Sales() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [formOpen, setFormOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const queryParams = useMemo(() => ({
    page,
    limit: rowsPerPage,
    search: search.trim() || undefined,
    payment_method: methodFilter || undefined,
  }), [page, search, methodFilter]);

  const { data: result, isLoading, isError, refetch } = useSales(queryParams);
  const createMut = useCreateSale();
  const { data: customersData } = useCustomers({ limit: 100 });
  const { data: productsData } = useProducts({ limit: 100 });
  const { data: banksData } = useBankAccounts();
  const { data: selectedSale, isLoading: isSaleLoading, isError: isSaleError } = useSale(selectedSaleId ?? '');

  const sales: Sale[] = result?.data ?? [];
  const meta = result?.meta;
  const customers = customersData?.data ?? [];
  const products = productsData?.data ?? [];
  const banks = banksData?.data ?? [];

  const handleExport = () => {
    import('@/components/PDFButton').then(({ exportTableToPDF }) => {
      exportTableToPDF(
        'Sales Report',
        ['Invoice', 'Customer', 'Date', 'Total', 'Paid', 'Remaining', 'Method', 'Status'],
        sales.map((s) => [
          s.invoice_no,
          s.customer_id?.name ?? '',
          formatDate(s.date),
          formatCurrency(s.total_amount),
          formatCurrency(s.paid_amount),
          formatCurrency(s.remaining_amount),
          s.payment_method,
          s.status,
        ])
      );
    });
  };

  const columns = [
    { id: 'invoice_no', label: 'Invoice', render: (r: Sale) => <strong>{r.invoice_no}</strong> },
    { id: 'customer_id', label: 'Customer', render: (r: Sale) => r.customer_id?.name ?? '—' },
    { id: 'date', label: 'Date', render: (r: Sale) => formatDate(r.date) },
    { id: 'total_amount', label: 'Total', align: 'right' as const, render: (r: Sale) => formatCurrency(r.total_amount) },
    { id: 'paid_amount', label: 'Paid', align: 'right' as const, render: (r: Sale) => <span style={{ color: '#16a34a' }}>{formatCurrency(r.paid_amount)}</span> },
    { id: 'remaining_amount', label: 'Remaining', align: 'right' as const, render: (r: Sale) => r.remaining_amount ? <span style={{ color: '#d97706' }}>{formatCurrency(r.remaining_amount)}</span> : '—' },
    { id: 'payment_method', label: 'Method', render: (r: Sale) => <span style={{ textTransform: 'capitalize' }}>{r.payment_method}</span> },
    { id: 'status', label: 'Status', render: (r: Sale) => <StatusChip status={r.status === 'paid' ? 'Paid' : r.status === 'partial' ? 'Partial' : r.status === 'cancelled' ? 'Cancelled' : 'Unpaid'} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Sales"
        subtitle="Record and track all sales invoices"
        breadcrumbs={[{ label: 'Sales' }]}
        action={<Button variant="contained" startIcon={<PlusCircle size={18} />} onClick={() => setFormOpen(true)} sx={{ borderRadius: 2 }}>Create Sale</Button>}
      />

      <TableToolbar
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        onAdd={() => setFormOpen(true)}
        onFilter={() => setFilterOpen(true)}
        onExport={handleExport}
        addLabel="Create Sale"
      />

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : isError ? (
        <ErrorState message="Failed to load sales" onRetry={() => refetch()} />
      ) : sales.length === 0 ? (
        <EmptyState
          title={search || methodFilter ? 'No matching sales' : 'No sales yet'}
          message={search || methodFilter ? 'Try changing your search or filter.' : 'Create your first sale invoice to get started.'}
          actionLabel="Create Sale"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <>
          <DataTable columns={columns} rows={sales} rowKey={(r) => r.id} onView={(sale) => setSelectedSaleId(sale.id)} />
          <TablePagination count={meta?.total ?? sales.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
        </>
      )}

      <SaleFormDialog
        open={formOpen}
        customers={customers.map((c) => ({ value: c.id, label: c.name }))}
        products={products.map((p) => ({ value: p.id, label: p.name, sale_price: p.sale_price, stock_quantity: p.stock_quantity }))}
        banks={banks.map((b) => ({ value: b.id, label: `${b.bank_name} — ${b.account_number}` }))}
        loading={createMut.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={(data) => createMut.mutate(data, { onSuccess: () => setFormOpen(false) })}
      />

      <SaleDetailsDialog
        open={Boolean(selectedSaleId)}
        sale={selectedSale}
        loading={isSaleLoading}
        onClose={() => setSelectedSaleId(null)}
      />

      {selectedSaleId && isSaleError && !isSaleLoading ? (
        <Box sx={{ mt: 1 }}>
          <ErrorState message="Failed to load sale details. Close the dialog and try again." onRetry={() => setSelectedSaleId(selectedSaleId)} />
        </Box>
      ) : null}

      <FilterDialog
        open={filterOpen}
        fields={[{ name: 'payment_method', label: 'Method', options: ['cash', 'bank', 'credit', 'mixed'] }]}
        onApply={(filters) => { setMethodFilter(filters.payment_method || ''); setPage(1); }}
        onClose={() => setFilterOpen(false)}
      />
    </Box>
  );
}
