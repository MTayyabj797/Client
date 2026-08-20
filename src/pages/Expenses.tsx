// import { useState } from 'react';
// import { Box, Button, Stack } from '@mui/material';
// import { PlusCircle, Tag } from 'lucide-react';
// import PageHeader from '@/components/PageHeader';
// import TableToolbar from '@/components/TableToolbar';
// import DataTable, { TablePagination } from '@/components/DataTable';
// import FormDialog from '@/components/FormDialog';
// import FilterDialog from '@/components/FilterDialog';
// import EmptyState from '@/components/EmptyState';
// import LoadingSkeleton from '@/components/LoadingSkeleton';
// import ErrorState from '@/components/ErrorState';
// import {
//   useExpenses,
//   useExpenseCategories,
//   useCreateExpense,
//   useCreateExpenseCategory,
//   useDeleteExpense,
//   type Expense,
// } from '@/hooks/useExpenses';
// import { useBankAccounts } from '@/hooks/useCashBank';
// import { formatCurrency, formatDate } from '@/utils/format';

// export default function Expenses() {
//   const [search, setSearch] = useState('');
//   const [methodFilter, setMethodFilter] = useState('');
//   const [page, setPage] = useState(1);
//   const rowsPerPage = 10;
//   const [formOpen, setFormOpen] = useState(false);
//   const [filterOpen, setFilterOpen] = useState(false);

//   const { data: result, isLoading, isError, refetch } = useExpenses({ page, limit: rowsPerPage, search: search || undefined, payment_method: methodFilter || undefined });
//   const { data: categoriesData } = useExpenseCategories();
//   const { data: banksData } = useBankAccounts();
//   const createMut = useCreateExpense();
//   const createCatMut = useCreateExpenseCategory();
//   const [catFormOpen, setCatFormOpen] = useState(false);

//   const expenses: Expense[] = result?.data ?? [];
//   const meta = result?.meta;
//   const categories = categoriesData?.data ?? [];
//   const banks = banksData?.data ?? [];
//   const deleteMut = useDeleteExpense();

//   const handleAdd = (vals: Record<string, string | number>) => {
//     createMut.mutate({
//       category_id: String(vals.category_id),
//       description: String(vals.description),
//       amount: Number(vals.amount),
//       payment_method: String(vals.payment_method).toLowerCase(),
//       bank_account_id: vals.bank_account_id || undefined,
//       date: vals.date,
//     }, { onSuccess: () => setFormOpen(false) });
//   };

//   const handleExport = () => {
//     import('@/components/PDFButton').then(({ exportTableToPDF }) => {
//       exportTableToPDF('Expenses Report', ['Date', 'Category', 'Description', 'Amount', 'Method'],
//         expenses.map((e) => [formatDate(e.date), e.category_id?.name ?? '', e.description, formatCurrency(e.amount), e.payment_method]));
//     });
//   };

//   const columns = [
//     { id: 'date', label: 'Date', render: (r: typeof expenses[number]) => formatDate(r.date) },
//     { id: 'category_id', label: 'Category', render: (r: typeof expenses[number]) => <strong>{r.category_id?.name ?? '—'}</strong> },
//     { id: 'description', label: 'Description' },
//     { id: 'amount', label: 'Amount', align: 'right' as const, render: (r: typeof expenses[number]) => <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(r.amount)}</span> },
//     { id: 'payment_method', label: 'Method', render: (r: typeof expenses[number]) => <span style={{ textTransform: 'capitalize' }}>{r.payment_method}</span> },
//   ];

//   return (
//     <Box>
//       <PageHeader title="Expenses" subtitle="Track all business expenses by category" breadcrumbs={[{ label: 'Expenses' }]}
//         action={
//           <Stack direction="row" spacing={1}>
//             <Button variant="outlined" startIcon={<Tag size={18} />} onClick={() => setCatFormOpen(true)} sx={{ borderRadius: 2 }}>Add Category</Button>
//             <Button variant="contained" startIcon={<PlusCircle size={18} />} onClick={() => setFormOpen(true)} sx={{ borderRadius: 2 }}>Add Expense</Button>
//           </Stack>
//         } />

//       <TableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} onAdd={() => setFormOpen(true)} onFilter={() => setFilterOpen(true)} onExport={handleExport} addLabel="Add Expense" />

//       {isLoading ? <LoadingSkeleton rows={6} /> : isError ? <ErrorState message="Failed to load expenses" onRetry={() => refetch()} /> : expenses.length === 0 && !search ? (
//         <EmptyState title="No expenses yet" message="Add your first expense to start tracking." actionLabel="Add Expense" onAction={() => setFormOpen(true)} />
//       ) : (
//         <>
//           {/* <DataTable columns={columns} rows={expenses} rowKey={(r) => r.id} onEdit={() => {}} onDelete={() => {}} /> */}
//         <DataTable
//           columns={columns}
//           rows={expenses}
//           rowKey={(r) => r.id}
//           // onEdit={() => {}}
//           onDelete={(expense) => {
//             if (
//               window.confirm(
//                 `Are you sure you want to delete this expense?\n\n${expense.description} — ${formatCurrency(expense.amount)}`
//               )
//             ) {
//               deleteMut.mutate(expense.id);
//             }
//           }}
//         />
//           <TablePagination count={meta?.total ?? expenses.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
//         </>
//       )}

//       <FormDialog open={formOpen} title="Add Expense" fields={[
//         { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) },
//         { name: 'category_id', label: 'Category', type: 'select', options: categories.map((c) => ({ value: c.id, label: c.name })), required: true },
//         { name: 'description', label: 'Description', required: true },
//         { name: 'amount', label: 'Amount', type: 'number', required: true },
//         { name: 'payment_method', label: 'Payment Method', type: 'select', options: ['cash', 'bank'], defaultValue: 'cash' },
//         { name: 'bank_account_id', label: 'Bank Account', type: 'select', options: banks.map((b) => ({ value: b.id, label: `${b.bank_name} — ${b.account_number}` })), visibleWhen: { field: 'payment_method', equals: ['bank'] } },
//       ]} onClose={() => setFormOpen(false)} onSubmit={handleAdd} />
//       <FormDialog open={catFormOpen} title="Add Expense Category" fields={[
//         { name: 'name', label: 'Category Name', required: true },
//       ]} onClose={() => setCatFormOpen(false)} onSubmit={(vals) => {
//         createCatMut.mutate({ name: String(vals.name) }, { onSuccess: () => setCatFormOpen(false) });
//       }} />
//       <FilterDialog open={filterOpen} fields={[{ name: 'payment_method', label: 'Method', options: ['cash', 'bank'] }]} onApply={(f) => { setMethodFilter(f.payment_method || ''); setPage(1); }} onClose={() => setFilterOpen(false)} />
//     </Box>
//   );
// }
import { useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { PlusCircle, Tag } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import TableToolbar from '@/components/TableToolbar';
import DataTable, { TablePagination } from '@/components/DataTable';
import FormDialog from '@/components/FormDialog';
import FilterDialog from '@/components/FilterDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import EmptyState from '@/components/EmptyState';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import {
  useExpenses,
  useExpenseCategories,
  useCreateExpense,
  useUpdateExpense,
  useCreateExpenseCategory,
  useDeleteExpense,
  type Expense,
} from '@/hooks/useExpenses';
import { useBankAccounts } from '@/hooks/useCashBank';
import { formatCurrency, formatDate } from '@/utils/format';

export default function Expenses() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [formOpen, setFormOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  // Row selected for deletion
  const [deleteRow, setDeleteRow] = useState<{
    id: string;
    description: string;
    amount: number;
  } | null>(null);

  const {
    data: result,
    isLoading,
    isError,
    refetch,
  } = useExpenses({
    page,
    limit: rowsPerPage,
    search: search || undefined,
    payment_method: methodFilter || undefined,
  });

  const { data: categoriesData } = useExpenseCategories();
  const { data: banksData } = useBankAccounts();

  const createMut = useCreateExpense();
  const updateMut = useUpdateExpense();
  const createCatMut = useCreateExpenseCategory();
  const deleteMut = useDeleteExpense();

  const expenses: Expense[] = result?.data ?? [];
  const meta = result?.meta;
  const categories = categoriesData?.data ?? [];
  const banks = banksData?.data ?? [];

  // const handleAdd = (vals: Record<string, string | number>) => {
  //   createMut.mutate(
  //     {
  //       category_id: String(vals.category_id),
  //       description: String(vals.description),
  //       amount: Number(vals.amount),
  //       payment_method: String(vals.payment_method).toLowerCase(),
  //       bank_account_id: vals.bank_account_id || undefined,
  //       date: vals.date,
  //     },
  //     {
  //       onSuccess: () => setFormOpen(false),
  //     }
  //   );
  // };
  const handleSubmit = (vals: Record<string, string | number>) => {
  const body = {
    category_id: String(vals.category_id),
    description: String(vals.description),
    amount: Number(vals.amount),
    payment_method: String(vals.payment_method).toLowerCase(),
    bank_account_id: vals.bank_account_id || undefined,
    date: vals.date,
  };

  if (editingExpense) {
    updateMut.mutate(
      {
        id: editingExpense.id,
        body,
      },
      {
        onSuccess: () => {
          setFormOpen(false);
          setEditingExpense(null);
        },
      }
    );
  } else {
    createMut.mutate(body, {
      onSuccess: () => {
        setFormOpen(false);
      },
    });
  }
};

const handleEdit = (expense: Expense) => {
  setEditingExpense(expense);
  setFormOpen(true);
};

  const handleDelete = () => {
    if (!deleteRow) return;

    deleteMut.mutate(deleteRow.id, {
      onSuccess: () => setDeleteRow(null),
    });
  };

  const handleExport = () => {
    import('@/components/PDFButton').then(({ exportTableToPDF }) => {
      exportTableToPDF(
        'Expenses Report',
        ['Date', 'Category', 'Description', 'Amount', 'Method'],
        expenses.map((e) => [
          formatDate(e.date),
          e.category_id?.name ?? '',
          e.description,
          formatCurrency(e.amount),
          e.payment_method,
        ])
      );
    });
  };

  const columns = [
    {
      id: 'date',
      label: 'Date',
      render: (r: typeof expenses[number]) => formatDate(r.date),
    },
    {
      id: 'category_id',
      label: 'Category',
      render: (r: typeof expenses[number]) => (
        <strong>{r.category_id?.name ?? '—'}</strong>
      ),
    },
    {
      id: 'description',
      label: 'Description',
    },
    {
      id: 'amount',
      label: 'Amount',
      align: 'right' as const,
      render: (r: typeof expenses[number]) => (
        <span
          style={{
            color: '#dc2626',
            fontWeight: 600,
          }}
        >
          {formatCurrency(r.amount)}
        </span>
      ),
    },
    {
      id: 'payment_method',
      label: 'Method',
      render: (r: typeof expenses[number]) => (
        <span style={{ textTransform: 'capitalize' }}>
          {r.payment_method}
        </span>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Expenses"
        subtitle="Track all business expenses by category"
        breadcrumbs={[{ label: 'Expenses' }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Tag size={18} />}
              onClick={() => setCatFormOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Add Category
            </Button>

            <Button
              variant="contained"
              startIcon={<PlusCircle size={18} />}
              onClick={() => setFormOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Add Expense
            </Button>
          </Stack>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onAdd={() => setFormOpen(true)}
        onFilter={() => setFilterOpen(true)}
        onExport={handleExport}
        addLabel="Add Expense"
      />

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : isError ? (
        <ErrorState
          message="Failed to load expenses"
          onRetry={() => refetch()}
        />
      ) : expenses.length === 0 && !search ? (
        <EmptyState
          title="No expenses yet"
          message="Add your first expense to start tracking."
          actionLabel="Add Expense"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <>
          {
          <DataTable
            columns={columns}
            rows={expenses}
            rowKey={(r) => r.id}
            onEdit={handleEdit}
            onDelete={(expense) => {
              setDeleteRow({
                id: expense.id,
                description: expense.description,
                amount: expense.amount,
              });
            }}
          />
          
          }

          <TablePagination
            count={meta?.total ?? expenses.length}
            page={page - 1}
            rowsPerPage={rowsPerPage}
            onPageChange={(p) => setPage(p + 1)}
          />
        </>
      )}

      {/* <FormDialog
        open={formOpen}
        title="Add Expense"
        fields={[
          {
            name: 'date',
            label: 'Date',
            type: 'date',
            required: true,
            defaultValue: new Date().toISOString().slice(0, 10),
          },
          {
            name: 'category_id',
            label: 'Category',
            type: 'select',
            options: categories.map((c) => ({
              value: c.id,
              label: c.name,
            })),
            required: true,
          },
          {
            name: 'description',
            label: 'Description',
            required: true,
          },
          {
            name: 'amount',
            label: 'Amount',
            type: 'number',
            required: true,
          },
          {
            name: 'payment_method',
            label: 'Payment Method',
            type: 'select',
            options: ['cash', 'bank'],
            defaultValue: 'cash',
          },
          {
            name: 'bank_account_id',
            label: 'Bank Account',
            type: 'select',
            options: banks.map((b) => ({
              value: b.id,
              label: `${b.bank_name} — ${b.account_number}`,
            })),
            visibleWhen: {
              field: 'payment_method',
              equals: ['bank'],
            },
          },
        ]}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAdd}
      /> */}

      <FormDialog
        open={formOpen}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        fields={[
          {
            name: 'date',
            label: 'Date',
            type: 'date',
            required: true,
            defaultValue: editingExpense
              ? editingExpense.date.slice(0, 10)
              : new Date().toISOString().slice(0, 10),
          },
          {
            name: 'category_id',
            label: 'Category',
            type: 'select',
            options: categories.map((c) => ({
              value: c.id,
              label: c.name,
            })),
            required: true,
            defaultValue: editingExpense?.category_id?.id ?? '',
          },
          {
            name: 'description',
            label: 'Description',
            required: true,
            defaultValue: editingExpense?.description ?? '',
          },
          {
            name: 'amount',
            label: 'Amount',
            type: 'number',
            required: true,
            defaultValue: editingExpense?.amount ?? 0,
          },
          {
            name: 'payment_method',
            label: 'Payment Method',
            type: 'select',
            options: ['cash', 'bank'],
            defaultValue: editingExpense?.payment_method ?? 'cash',
          },
          {
            name: 'bank_account_id',
            label: 'Bank Account',
            type: 'select',
            options: banks.map((b) => ({
              value: b.id,
              label: `${b.bank_name} — ${b.account_number}`,
            })),
            defaultValue: editingExpense?.bank_account_id?.id ?? '',
            visibleWhen: {
              field: 'payment_method',
              equals: ['bank'],
            },
          },
        ]}
        onClose={() => {
          setFormOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSubmit}
      />

      <FormDialog
        open={catFormOpen}
        title="Add Expense Category"
        fields={[
          {
            name: 'name',
            label: 'Category Name',
            required: true,
          },
        ]}
        onClose={() => setCatFormOpen(false)}
        onSubmit={(vals) => {
          createCatMut.mutate(
            { name: String(vals.name) },
            {
              onSuccess: () => setCatFormOpen(false),
            }
          );
        }}
      />

      <FilterDialog
        open={filterOpen}
        fields={[
          {
            name: 'payment_method',
            label: 'Method',
            options: ['cash', 'bank'],
          },
        ]}
        onApply={(f) => {
          setMethodFilter(f.payment_method || '');
          setPage(1);
        }}
        onClose={() => setFilterOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteRow}
        title="Delete Expense"
        message={
          `Are you sure you want to delete this expense?\n\n` +
          `${deleteRow?.description} — ${formatCurrency(deleteRow?.amount ?? 0)}`
        }
        onConfirm={handleDelete}
        onClose={() => setDeleteRow(null)}
      />
    </Box>
  );
}
