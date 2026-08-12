import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { PlusCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import TableToolbar from '@/components/TableToolbar';
import DataTable, { TablePagination } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import FormDialog from '@/components/FormDialog';
import FilterDialog from '@/components/FilterDialog';
import EmptyState from '@/components/EmptyState';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { usePurchases,useDeletePurchase, useCreatePurchase, type Purchase } from '@/hooks/useSales';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProducts } from '@/hooks/useProducts';
import { useBankAccounts } from '@/hooks/useCashBank';
import { formatCurrency, formatDate } from '@/utils/format';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function Purchases() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [formOpen, setFormOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<{
  id: string;
  invoice_no: string;
  total_amount: number;
  } | null>(null);

  const { data: result, isLoading, isError, refetch } = usePurchases({ page, limit: rowsPerPage, search: search || undefined, payment_method: methodFilter || undefined });
  const createMut = useCreatePurchase();
  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const { data: productsData } = useProducts({ limit: 100 });
  const { data: banksData } = useBankAccounts();

  const purchases: Purchase[] = result?.data ?? [];
  const meta = result?.meta;
  const suppliers = suppliersData?.data ?? [];
  const products = productsData?.data ?? [];
  const banks = banksData?.data ?? [];
  const deleteMut = useDeletePurchase();
  const handleAdd = (vals: Record<string, string | number>) => {
    createMut.mutate({
      supplier_id: String(vals.supplier_id),
      payment_method: String(vals.payment_method).toLowerCase(),
      paid_amount: Number(vals.paid_amount),
      bank_account_id: vals.bank_account_id || undefined,
      items: [{ product_id: String(vals.product_id), quantity: Number(vals.quantity), unit_price: Number(vals.unit_price) }],
    }, { onSuccess: () => setFormOpen(false) });
  };

const handleDelete = () => {
  if (!deleteRow) return;

  deleteMut.mutate(deleteRow.id, {
    onSuccess: () => {
      setDeleteRow(null);
    },
  });
};

  const handleExport = () => {
    import('@/components/PDFButton').then(({ exportTableToPDF }) => {
      exportTableToPDF('Purchases Report', ['Invoice', 'Supplier', 'Date', 'Amount', 'Paid', 'Remaining', 'Method', 'Status'],
      
      purchases.map((p) => [
        p.invoice_no,
        p.supplier_id?.name ?? '',
        p.items?.map((item) => item.product_id?.name ?? '').join(', ') ?? '',
        formatDate(p.date),
        formatCurrency(p.total_amount),
        formatCurrency(p.paid_amount),
        formatCurrency(p.remaining_amount),
        p.payment_method,
      ]));
        // purchases.map((p) => [p.invoice_no, p.supplier_id?.name ?? '', formatDate(p.date), formatCurrency(p.total_amount), formatCurrency(p.paid_amount), formatCurrency(p.remaining_amount), p.payment_method, p.status]));
 });
  };

  const columns = [
    { id: 'invoice_no', label: 'Invoice', render: (r: typeof purchases[number]) => <strong>{r.invoice_no}</strong> },
    { id: 'supplier_id', label: 'Supplier', render: (r: typeof purchases[number]) => r.supplier_id?.name ?? '—' },
      {
    id: 'product',
    label: 'Product',
    render: (r: typeof purchases[number]) =>
      r.items?.map(
        (item) => item.product_id?.name ?? '—'
      ).join(', ') || '—',
  },
    { id: 'date', label: 'Date', render: (r: typeof purchases[number]) => formatDate(r.date) },
    { id: 'total_amount', label: 'Amount', align: 'right' as const, render: (r: typeof purchases[number]) => formatCurrency(r.total_amount) },
    { id: 'paid_amount', label: 'Paid', align: 'right' as const, render: (r: typeof purchases[number]) => <span style={{ color: '#16a34a' }}>{formatCurrency(r.paid_amount)}</span> },
    { id: 'remaining_amount', label: 'Remaining', align: 'right' as const, render: (r: typeof purchases[number]) => (r.remaining_amount ? <span style={{ color: '#d97706' }}>{formatCurrency(r.remaining_amount)}</span> : '—') },
    { id: 'payment_method', label: 'Method', render: (r: typeof purchases[number]) => <span style={{ textTransform: 'capitalize' }}>{r.payment_method}</span> },
  ];

  return (
    <Box>
      <PageHeader title="Purchases" subtitle="Record and track all purchase orders" breadcrumbs={[{ label: 'Purchases' }]}
        action={<Button variant="contained" startIcon={<PlusCircle size={18} />} onClick={() => setFormOpen(true)} sx={{ borderRadius: 2 }}>Add Purchase</Button>} />

      <TableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} onAdd={() => setFormOpen(true)} onFilter={() => setFilterOpen(true)} onExport={handleExport} addLabel="Add Purchase" />

      {isLoading ? <LoadingSkeleton rows={6} /> : isError ? <ErrorState message="Failed to load purchases" onRetry={() => refetch()} /> : purchases.length === 0 && !search ? (
        <EmptyState title="No purchases yet" message="Add your first purchase order to get started." actionLabel="Add Purchase" onAction={() => setFormOpen(true)} />
      ) : (
        <>
          {/* <DataTable columns={columns} rows={purchases} rowKey={(r) => r.id} onView={() => {}} /> */}
         <DataTable
            columns={columns}
            rows={purchases}
            rowKey={(r) => r.id}
            // onView={() => {}}
            onDelete={(purchase) => {
              setDeleteRow({
                id: purchase.id,
                invoice_no: purchase.invoice_no,
                total_amount: purchase.total_amount,
              });
            }}
          />
          <TablePagination count={meta?.total ?? purchases.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
        </>
      )}

      <FormDialog open={formOpen} title="Add Purchase" fields={[
        { name: 'supplier_id', label: 'Supplier', type: 'select', options: suppliers.map((s) => ({ value: s.id, label: s.name })), required: true },
        { name: 'product_id', label: 'Product', type: 'select', options: products.map((p) => ({ value: p.id, label: p.name })), required: true },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'unit_price', label: 'Unit Price', type: 'number', required: true },
        { name: 'paid_amount', label: 'Paid Amount', type: 'number', required: true, defaultValue: 0 },
        // { name: 'payment_method', label: 'Payment Method', type: 'select', options: ['cash', 'bank', 'credit', 'mixed'], defaultValue: 'cash' },
        { name: 'payment_method',  label: 'Payment Method',  type: 'select',  options: ['cash', 'bank'], defaultValue: 'cash', },
        { name: 'bank_account_id', label: 'Bank Account', type: 'select', options: banks.map((b) => ({ value: b.id, label: `${b.bank_name} — ${b.account_number}` })), visibleWhen: { field: 'payment_method', equals: ['bank', 'mixed'] } },
      ]} onClose={() => setFormOpen(false)} onSubmit={handleAdd} />
      <FilterDialog open={filterOpen} fields={[{ name: 'payment_method', label: 'Method', options: ['cash', 'bank'],}]}  onApply={(f) => { setMethodFilter(f.payment_method || ''); setPage(1); }} onClose={() => setFilterOpen(false)} />
      <ConfirmationDialog
      open={!!deleteRow}
      title="Delete Purchase"
      message={
        `Are you sure you want to delete this purchase?\n\n` +
        `${deleteRow?.invoice_no} — ${formatCurrency(
          deleteRow?.total_amount ?? 0
        )}`
      }
      onConfirm={handleDelete}
      onClose={() => setDeleteRow(null)}
    />
    </Box>
  );
}
