import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography, Grid, useMediaQuery, useTheme, Chip } from '@mui/material';
import { PlusCircle, Package, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
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
import { useProducts, useProductCategories, useCreateProduct, useCreateProductCategory, useUpdateProduct, useDeleteProduct, useAdjustStock, type Product } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/format';

const categoryIdToString = (val: Product['category_id']): string | undefined => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  return val.id;
};

export default function Products() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState<Product | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<{ id: string; name: string } | null>(null);

  const { data: result, isLoading, isError, refetch } = useProducts({ page, limit: rowsPerPage, search: search || undefined, status: statusFilter || undefined });
  const { data: categoriesData } = useProductCategories();
  const createMut = useCreateProduct();
  const createCatMut = useCreateProductCategory();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();
  const adjustMut = useAdjustStock();
  const [catFormOpen, setCatFormOpen] = useState(false);

  const products: Product[] = result?.data ?? [];
  const meta = result?.meta as { total?: number; pages?: number; page?: number; limit?: number } | undefined;
  const categories = categoriesData?.data ?? [];

  const fields = [
    { name: 'name', label: 'Product Name', required: true, defaultValue: editRow?.name },
    { name: 'category_id', label: 'Category', type: 'select' as const, options: categories.map((c) => ({ value: c.id, label: c.name })), required: false, defaultValue: categoryIdToString(editRow?.category_id) },
    { name: 'sku', label: 'SKU', required: true, defaultValue: editRow?.sku },
    { name: 'purchase_price', label: 'Purchase Price', type: 'number' as const, required: true, defaultValue: editRow?.purchase_price },
    { name: 'sale_price', label: 'Sale Price', type: 'number' as const, required: true, defaultValue: editRow?.sale_price },
    { name: 'stock_quantity', label: 'Stock Quantity', type: 'number' as const, required: true, defaultValue: editRow?.stock_quantity },
    { name: 'low_stock_threshold', label: 'Low Stock Threshold', type: 'number' as const, defaultValue: editRow?.low_stock_threshold ?? 10 },
  ];

  const handleSave = (vals: Record<string, string | number>) => {
    const payload = {
      name: String(vals.name), category_id: vals.category_id || undefined, sku: String(vals.sku),
      purchase_price: Number(vals.purchase_price), sale_price: Number(vals.sale_price),
      stock_quantity: Number(vals.stock_quantity), low_stock_threshold: Number(vals.low_stock_threshold),
    };
    if (editRow) updateMut.mutate({ id: editRow.id, body: payload }, { onSuccess: () => setFormOpen(false) });
    else createMut.mutate(payload, { onSuccess: () => setFormOpen(false) });
  };

  const handleDelete = () => { if (deleteRow) deleteMut.mutate(deleteRow.id, { onSuccess: () => setDeleteRow(null) }); };

  const handleExport = () => {
    import('@/components/PDFButton').then(({ exportTableToPDF }) => {
      exportTableToPDF('Products Report', ['ID', 'Product', 'SKU', 'Purchase', 'Sale', 'Stock', 'Status'],
        products.map((p) => [p.id, p.name, p.sku, formatCurrency(p.purchase_price), formatCurrency(p.sale_price), p.stock_quantity, p.status]));
    });
  };

  const getStockStatus = (stock: number, threshold: number): 'In Stock' | 'Low Stock' | 'Out of Stock' => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= threshold) return 'Low Stock';
    return 'In Stock';
  };

  const columns = [
    { id: 'sku', label: 'SKU', render: (r: Product) => <strong>{r.sku}</strong> },
    { id: 'name', label: 'Product', render: (r: Product) => <strong>{r.name}</strong> },
    { id: 'purchase_price', label: 'Purchase', align: 'right' as const, render: (r: Product) => formatCurrency(r.purchase_price) },
    { id: 'sale_price', label: 'Sale', align: 'right' as const, render: (r: Product) => formatCurrency(r.sale_price) },
    { id: 'stock_quantity', label: 'Stock', align: 'right' as const, render: (r: Product) => r.stock_quantity },
    { id: 'status', label: 'Status', render: (r: Product) => <StatusChip status={getStockStatus(r.stock_quantity, r.low_stock_threshold)} /> },
  ];

  return (
    <Box>
      <PageHeader title="Products" subtitle="Track your inventory, prices, and stock levels" breadcrumbs={[{ label: 'Products' }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Tag size={18} />} onClick={() => setCatFormOpen(true)} sx={{ borderRadius: 2 }}>Add Category</Button>
            <Button variant="contained" startIcon={<PlusCircle size={18} />} onClick={() => { setEditRow(null); setFormOpen(true); }} sx={{ borderRadius: 2 }}>Add Product</Button>
          </Stack>
        } />

      <TableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} onAdd={() => { setEditRow(null); setFormOpen(true); }} onFilter={() => setFilterOpen(true)} onExport={handleExport} addLabel="Add Product" />

      {isLoading ? <LoadingSkeleton rows={6} /> : isError ? <ErrorState message="Failed to load products" onRetry={() => refetch()} /> : products.length === 0 && !search ? (
        <EmptyState title="No products yet" message="Add your first product to manage inventory." actionLabel="Add Product" onAction={() => setFormOpen(true)} />
      ) : isMobile ? (
        <Box>
          <Grid container spacing={2}>
            {products.map((p, i) => (
              <Grid item xs={12} sm={6} key={p.id}>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1.5, p: 1, display: 'flex' }}><Package size={20} /></Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{p.name}</Typography>
                            <Chip label={p.sku} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                          </Box>
                        </Stack>
                        <StatusChip status={getStockStatus(p.stock_quantity, p.low_stock_threshold)} />
                      </Stack>
                      <Grid container spacing={1}>
                        <Grid item xs={4}><Typography variant="caption" color="text.secondary">Purchase</Typography><Typography sx={{ fontWeight: 600 }}>{formatCurrency(p.purchase_price)}</Typography></Grid>
                        <Grid item xs={4}><Typography variant="caption" color="text.secondary">Sale</Typography><Typography sx={{ fontWeight: 600, color: 'success.main' }}>{formatCurrency(p.sale_price)}</Typography></Grid>
                        <Grid item xs={4}><Typography variant="caption" color="text.secondary">Stock</Typography><Typography sx={{ fontWeight: 600 }}>{p.stock_quantity}</Typography></Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          <TablePagination count={meta?.total ?? products.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
        </Box>
      ) : (
        <>
          <DataTable columns={columns} rows={products} rowKey={(r) => r.id}
            onEdit={(r) => { setEditRow(r); setFormOpen(true); }}
            onDelete={(r) => setDeleteRow(r)} />
          <TablePagination count={meta?.total ?? products.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
        </>
      )}

      <FormDialog open={formOpen} title={editRow ? 'Edit Product' : 'Add Product'} fields={fields} onClose={() => setFormOpen(false)} onSubmit={handleSave} />
      <FilterDialog open={filterOpen} fields={[{ name: 'status', label: 'Status', options: ['active', 'inactive'] }]} onApply={(f) => { setStatusFilter(f.status || ''); setPage(1); }} onClose={() => setFilterOpen(false)} />
      <FormDialog open={catFormOpen} title="Add Product Category" fields={[
        { name: 'name', label: 'Category Name', required: true },
        { name: 'description', label: 'Description' },
      ]} onClose={() => setCatFormOpen(false)} onSubmit={(vals) => {
        createCatMut.mutate({ name: String(vals.name), description: vals.description ? String(vals.description) : undefined }, { onSuccess: () => setCatFormOpen(false) });
      }} />
      <ConfirmationDialog open={!!deleteRow} title="Delete Product" message={`Delete ${deleteRow?.name}? This action cannot be undone.`} onConfirm={handleDelete} onClose={() => setDeleteRow(null)} />
    </Box>
  );
}
