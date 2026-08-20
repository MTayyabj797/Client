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
import { useSupplier, useSupplierLedger, useAddSupplierLedgerEntry,   useUpdateSupplierLedgerEntry , type LedgerEntry } from '@/hooks/useSuppliers';
import { formatCurrency, formatDate } from '@/utils/format';
import { exportTableToPDF, printDocument } from '@/components/PDFButton';
import { useBankAccounts } from '@/hooks/useCashBank';

export default function SupplierLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [formOpen, setFormOpen] = useState(false);

  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);

  const supplierQuery = useSupplier(id!);
  const ledgerQuery = useSupplierLedger(id!, { page, limit: rowsPerPage });
  const addEntryMut = useAddSupplierLedgerEntry(id!);
  const updateEntryMut = useUpdateSupplierLedgerEntry(id!);

  const { data: banksData } = useBankAccounts();
  const banks = banksData?.data ?? [];

  const supplier = supplierQuery.data;
  const entries: LedgerEntry[] = ledgerQuery.data?.data ?? [];
  const meta = ledgerQuery.data?.meta;

  const totalCredit = entries.filter((e) => e.credit > 0).reduce((s, e) => s + e.credit, 0);
  const totalDebit = entries.filter((e) => e.debit > 0).reduce((s, e) => s + e.debit, 0);
  const opening = supplier?.opening_balance ?? 0;
  const current = supplier?.current_balance ?? 0;

//   const handleAdd = (vals: Record<string, string | number>) => {
//     addEntryMut.mutate({
//       date: vals.date, description: String(vals.description),
//       debit: Number(vals.debit), credit: Number(vals.credit), payment_method: String(vals.method).toLowerCase(),
//     }, { onSuccess: () => setFormOpen(false) });
//   };

//   const handleEdit = (vals: Record<string, string | number>) => {
//   if (!editingEntry) return;

//   const paymentMethod = String(vals.method).toLowerCase();

//   updateEntryMut.mutate(
//     {
//       entryId: editingEntry.id,
//       body: {
//         date: vals.date,
//         description: String(vals.description),
//         debit: Number(vals.debit),
//         credit: Number(vals.credit),
//         payment_method: paymentMethod,
//         ...(paymentMethod === 'bank' && vals.bank_account_id
//           ? {
//               bank_account_id: String(vals.bank_account_id),
//             }
//           : {}),
//       },
//     },
//     {
//       onSuccess: () => {
//         setEditingEntry(null);
//         setFormOpen(false);
//       },
//     }
//   );
// };

const handleAdd = (vals: Record<string, string | number>) => {
  const paymentMethod = String(vals.method).toLowerCase();

  addEntryMut.mutate(
    {
      date: vals.date,
      description: String(vals.description),
      debit: Number(vals.debit),
      credit: Number(vals.credit),
      payment_method: paymentMethod,
      ...(paymentMethod === 'bank'
        ? {
            bank_account_id: String(vals.bank_account_id),
          }
        : {}),
    },
    {
      onSuccess: () => {
        setFormOpen(false);
        setEditingEntry(null);
      },
    }
  );
};

const handleEdit = (vals: Record<string, string | number>) => {
  if (!editingEntry) return;

  const paymentMethod = String(vals.method).toLowerCase();

  updateEntryMut.mutate(
    {
      entryId: editingEntry.id,
      body: {
        date: vals.date,
        description: String(vals.description),
        debit: Number(vals.debit),
        credit: Number(vals.credit),
        payment_method: paymentMethod,
        ...(paymentMethod === 'bank'
          ? {
              bank_account_id: String(vals.bank_account_id),
            }
          : {}),
      },
    },
    {
      onSuccess: () => {
        setEditingEntry(null);
        setFormOpen(false);
      },
    }
  );
};

  const handleExport = () => {
    exportTableToPDF(`Supplier Ledger - ${supplier?.name ?? id}`,
      ['Date', 'Description', 'Debit', 'Credit', 'Balance', 'Method'],
      entries.map((e) => [formatDate(e.date), e.description, formatCurrency(e.debit), formatCurrency(e.credit), formatCurrency(e.balance), e.payment_method]),
      `Supplier: ${supplier?.name} (${id})`);
  };

  const handlePrint = () => {
    const rowsHtml = entries.map((e) => `<tr><td>${formatDate(e.date)}</td><td>${e.description}</td><td>${formatCurrency(e.debit)}</td><td>${formatCurrency(e.credit)}</td><td>${formatCurrency(e.balance)}</td><td>${e.payment_method}</td></tr>`).join('');
    printDocument(`Supplier Ledger - ${supplier?.name}`, `<h1>Supplier Ledger</h1><p class="sub">${supplier?.name} · ${supplier?.phone}</p><table><thead><tr><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th><th>Method</th></tr></thead><tbody>${rowsHtml}</tbody></table>`);
  };

  const columns = [
    { id: 'date', label: 'Date', render: (r: typeof entries[number]) => formatDate(r.date) },
    { id: 'description', label: 'Description' },
    { id: 'debit', label: 'Debit (Payment)', align: 'right' as const, render: (r: typeof entries[number]) => (r.debit ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(r.debit)}</span> : '—') },
    { id: 'credit', label: 'Credit (Purchase)', align: 'right' as const, render: (r: typeof entries[number]) => (r.credit ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(r.credit)}</span> : '—') },
    { id: 'balance', label: 'Balance', align: 'right' as const, render: (r: typeof entries[number]) => <strong>{formatCurrency(r.balance)}</strong> },
    { id: 'payment_method', label: 'Method', render: (r: typeof entries[number]) => <span style={{ textTransform: 'capitalize' }}>{r.payment_method}</span> },
    {
  id: 'actions',
  label: 'Actions',
  align: 'right' as const,
  render: (r: typeof entries[number]) =>
    r.ref_type === 'SUPPLIER_MANUAL' ? (
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          setEditingEntry(r);
          setFormOpen(true);
        }}
        sx={{ borderRadius: 1.5 }}
      >
        Edit
      </Button>
    ) : null,
},
  ];

  const summaryCards = [
    { title: 'Opening Balance', value: formatCurrency(opening), icon: Wallet, color: '#2563eb' },
    { title: 'Current Balance', value: formatCurrency(current), icon: Banknote, color: '#0891b2' },
    { title: 'Total Purchases', value: formatCurrency(totalCredit), icon: TrendingUp, color: '#dc2626' },
    { title: 'Total Paid', value: formatCurrency(totalDebit), icon: TrendingDown, color: '#16a34a' },
  ];

  return (
    <Box>
      <PageHeader title={supplier ? `${supplier.name} - Ledger` : 'Supplier Ledger'} subtitle={`${supplier?.phone ?? ''} · ${supplier?.address ?? ''}`}
        breadcrumbs={[{ label: 'Suppliers', path: '/suppliers' }, { label: supplier?.name ?? 'Ledger' }]}
        action={<Button variant="outlined" startIcon={<ArrowLeft size={18} />} onClick={() => navigate('/suppliers')} sx={{ borderRadius: 2 }}>Back</Button>} />

      {supplierQuery.isLoading ? <LoadingSkeleton rows={4} /> : supplierQuery.isError ? <ErrorState message="Failed to load supplier" onRetry={() => supplierQuery.refetch()} /> : <LedgerSummary cards={summaryCards} />}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<Plus size={18} />} onClick={() => setFormOpen(true)} sx={{ borderRadius: 2 }}>Add Transaction</Button>
        <Button variant="outlined" startIcon={<Printer size={18} />} onClick={handlePrint} sx={{ borderRadius: 2 }}>Print</Button>
        <Button variant="contained" startIcon={<FileText size={18} />} onClick={handleExport} sx={{ borderRadius: 2 }}>Export PDF</Button>
      </Stack>

      {ledgerQuery.isLoading ? <LoadingSkeleton rows={8} /> : ledgerQuery.isError ? <ErrorState message="Failed to load ledger" onRetry={() => ledgerQuery.refetch()} /> : entries.length === 0 ? (
        <EmptyState title="No transactions" message="Add a transaction to start this ledger." actionLabel="Add Transaction" onAction={() => setFormOpen(true)} />
      ) : (
        <>
          <DataTable columns={columns} rows={entries} rowKey={(r) => r.id} />
          <TablePagination count={meta?.total ?? entries.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
        </>
      )}

      {/* <FormDialog open={formOpen}   title={editingEntry ? 'Edit Transaction' : 'Add Transaction'}
      //  fields={[
      //   { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) },
      //   { name: 'description', label: 'Description', required: true },
      //   { name: 'debit', label: 'Debit (Payment)', type: 'number', defaultValue: 0 },
      //   { name: 'credit', label: 'Credit (Purchase)', type: 'number', defaultValue: 0 },
      //   { name: 'method', label: 'Payment Method', type: 'select', options: ['cash', 'bank', 'adjustment'], defaultValue: 'cash' },

      // ]}
            fields={[
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          required: true,
          defaultValue: editingEntry
            ? new Date(editingEntry.date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        },
        {
          name: 'description',
          label: 'Description',
          required: true,
          defaultValue: editingEntry?.description ?? '',
        },
        {
          name: 'debit',
          label: 'Debit (Payment)',
          type: 'number',
          defaultValue: editingEntry?.debit ?? 0,
        },
        {
          name: 'credit',
          label: 'Credit (Purchase)',
          type: 'number',
          defaultValue: editingEntry?.credit ?? 0,
        },
        {
          name: 'method',
          label: 'Payment Method',
          type: 'select',
          options: [
            { value: 'cash', label: 'Cash' },
            { value: 'bank', label: 'Bank' },
            { value: 'adjustment', label: 'Adjustment' },
          ],
          defaultValue: editingEntry?.payment_method ?? 'cash',
        },
      ]}
       onClose={() => setFormOpen(false)} onSubmit={handleAdd} /> */}

           <FormDialog
               open={formOpen}
               title={editingEntry ? 'Edit Transaction' : 'Add Transaction'}
               fields={[
                 {
                   name: 'date',
                   label: 'Date',
                   type: 'date',
                   required: true,
                   defaultValue: editingEntry
                     ? new Date(editingEntry.date).toISOString().slice(0, 10)
                     : new Date().toISOString().slice(0, 10),
                 },
                 {
                   name: 'description',
                   label: 'Description',
                   required: true,
                   defaultValue: editingEntry?.description ?? '',
                 },
                 {
                   name: 'debit',
                   label: 'Debit (Sale)',
                   type: 'number',
                   defaultValue: editingEntry?.debit ?? 0,
                 },
                 {
                   name: 'credit',
                   label: 'Credit (Payment)',
                   type: 'number',
                   defaultValue: editingEntry?.credit ?? 0,
                 },
                 {
                   name: 'method',
                   label: 'Payment Method',
                   type: 'select',
                   options: [
                     { value: 'cash', label: 'Cash' },
                     { value: 'bank', label: 'Bank' },
                     { value: 'adjustment', label: 'Adjustment' },
                   ],
                   defaultValue: editingEntry?.payment_method ?? 'cash',
                 },
                 {
                   name: 'bank_account_id',
                   label: 'Bank Account',
                   type: 'select',
                   options: banks.map((bank) => ({
                     value: bank.id,
                     label: `${bank.bank_name} — ${bank.account_number}`,
                   })),
                  //  defaultValue: editingEntry?.bank_account_id ?? '',
                  //  visibleWhen: {
                  //    field: 'method',
                  //    equals: ['bank'],
                  //  },

                  defaultValue: typeof editingEntry?.bank_account_id === 'object'
                  ? editingEntry.bank_account_id?.id ?? ''
                  : editingEntry?.bank_account_id ?? '',
                   },
               ]}
               
               onClose={() => {
                 setFormOpen(false);
                 setEditingEntry(null);
               }}
               onSubmit={editingEntry ? handleEdit : handleAdd}
             />
       
    </Box>
  );
}
