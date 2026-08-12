import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import TableToolbar from '@/components/TableToolbar';
import DataTable, { TablePagination } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import FormDialog from '@/components/FormDialog';
import FilterDialog from '@/components/FilterDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import EmptyState from '@/components/EmptyState';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, type Customer } from '@/hooks/useCustomers';
import { formatCurrency } from '@/utils/format';

export default function Customers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState<{ id: string; name: string; phone: string; address: string; opening_balance: number; status: string } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<{ id: string; name: string } | null>(null);

  const { data: result, isLoading, isError, refetch } = useCustomers({
    page,
    limit: rowsPerPage,
    search: search || undefined,
    status: statusFilter || undefined,
  });
  const createMut = useCreateCustomer();
  const updateMut = useUpdateCustomer();
  const deleteMut = useDeleteCustomer();

  const customers: Customer[] = result?.data ?? [];
  const meta = result?.meta as { total?: number; pages?: number; page?: number; limit?: number } | undefined;

  const fields = [
    { name: 'name', label: 'Customer Name', required: true, defaultValue: editRow?.name },
    { name: 'phone', label: 'Phone', required: true, defaultValue: editRow?.phone },
    { name: 'address', label: 'Address', defaultValue: editRow?.address },
    { name: 'opening_balance', label: 'Opening Balance', type: 'number' as const, defaultValue: editRow?.opening_balance ?? 0 },
    { name: 'status', label: 'Status', type: 'select' as const, options: ['active', 'inactive'], defaultValue: editRow?.status ?? 'active' },
  ];

  const handleSave = (vals: Record<string, string | number>) => {
    const payload = {
      name: String(vals.name),
      phone: String(vals.phone),
      address: String(vals.address),
      opening_balance: Number(vals.opening_balance),
      status: vals.status as 'active' | 'inactive',
    };
    if (editRow) {
      updateMut.mutate({ id: editRow.id, body: payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      createMut.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteRow) deleteMut.mutate(deleteRow.id, { onSuccess: () => setDeleteRow(null) });
  };

  const handleExport = () => {
    // Export uses current page data
    import('@/components/PDFButton').then(({ exportTableToPDF }) => {
      exportTableToPDF(
        'Customers Report',
        ['ID', 'Name', 'Phone', 'Address', 'Opening', 'Current', 'Status'],
        customers.map((c) => [c.id, c.name, c.phone, c.address, formatCurrency(c.opening_balance), formatCurrency(c.current_balance), c.status])
      );
    });
  };

  const columns = [
    { id: 'name', label: 'Customer Name', render: (r: typeof customers[number]) => <strong>{r.name}</strong> },
    { id: 'phone', label: 'Phone' },
    { id: 'address', label: 'Address', render: (r: typeof customers[number]) => <span style={{ color: '#94a3b8' }}>{r.address}</span> },
    { id: 'opening_balance', label: 'Opening', align: 'right' as const, render: (r: typeof customers[number]) => formatCurrency(r.opening_balance) },
    { id: 'current_balance', label: 'Current', align: 'right' as const, render: (r: typeof customers[number]) => <strong>{formatCurrency(r.current_balance)}</strong> },
    { id: 'status', label: 'Status', render: (r: typeof customers[number]) => <StatusChip status={r.status === 'active' ? 'Active' : 'Inactive'} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer accounts and balances"
        breadcrumbs={[{ label: 'Customers' }]}
        action={<Button variant="contained" startIcon={<PlusCircle size={18} />} onClick={() => { setEditRow(null); setFormOpen(true); }} sx={{ borderRadius: 2 }}>Add Customer</Button>}
      />

      <TableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onAdd={() => { setEditRow(null); setFormOpen(true); }}
        onFilter={() => setFilterOpen(true)}
        onExport={handleExport}
        addLabel="Add Customer"
      />

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : isError ? (
        <ErrorState message="Failed to load customers" onRetry={() => refetch()} />
      ) : customers.length === 0 && !search ? (
        <EmptyState title="No customers yet" message="Add your first customer to start tracking sales and balances." actionLabel="Add Customer" onAction={() => setFormOpen(true)} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={customers}
            rowKey={(r) => r.id}
            onView={(r) => navigate(`/customers/${r.id}`)}
            onEdit={(r) => { setEditRow(r); setFormOpen(true); }}
            onDelete={(r) => setDeleteRow(r)}
          />
          <TablePagination
            count={meta?.total ?? customers.length}
            page={page - 1}
            rowsPerPage={rowsPerPage}
            onPageChange={(p) => setPage(p + 1)}
          />
        </>
      )}

      <FormDialog
        open={formOpen}
        title={editRow ? 'Edit Customer' : 'Add Customer'}
        fields={fields}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
      />
      <FilterDialog
        open={filterOpen}
        fields={[{ name: 'status', label: 'Status', options: ['active', 'inactive'] }]}
        onApply={(f) => { setStatusFilter(f.status || ''); setPage(1); }}
        onClose={() => setFilterOpen(false)}
      />
      <ConfirmationDialog
        open={!!deleteRow}
        title="Delete Customer"
        message={`Are you sure you want to delete ${deleteRow?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteRow(null)}
      />
    </Box>
  );
}
