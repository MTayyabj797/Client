import { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Wallet, Users, Truck, Banknote, Landmark, BookOpen, FileText, Printer, Download, X,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { reportService } from '@/api/services';
import { exportTableToPDF, printDocument } from '@/components/PDFButton';

const reportConfigs = [
  { id: 'sales', title: 'Sales Report', icon: ShoppingCart, color: '#2563eb', endpoint: 'sales' },
  { id: 'expense', title: 'Expense Report', icon: Wallet, color: '#dc2626', endpoint: 'expenses' },
  { id: 'customer', title: 'Customer Report', icon: Users, color: '#0891b2', endpoint: 'customer-summary' },
  { id: 'supplier', title: 'Supplier Report', icon: Truck, color: '#d97706', endpoint: 'supplier-summary' },
  { id: 'cash', title: 'Cash Report', icon: Banknote, color: '#16a34a', endpoint: 'cash-flow' },
  { id: 'bank', title: 'Bank Report', icon: Landmark, color: '#6366f1', endpoint: 'cash-flow' },
  { id: 'daily', title: 'Daily Book Report', icon: BookOpen, color: '#7c3aed', endpoint: 'cash-flow' },
];

interface ReportRow {
  [key: string]: unknown;
}

export default function Reports() {
  const [preview, setPreview] = useState<{ title: string; rows: ReportRow[]; columns: string[] } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const params = { from: from || undefined, to: to || undefined };

  const fetchReport = async (report: typeof reportConfigs[number]) => {
    setLoading(report.id);
    setError('');
    try {
      const response = await reportService[report.id === 'expense' ? 'expenses' : report.id === 'customer' ? 'customerSummary' : report.id === 'supplier' ? 'supplierSummary' : 'cashFlow'](params);
      const rows = (response.data ?? []) as ReportRow[];
      const columns = rows.length > 0 ? Object.keys(rows[0]).filter((k) => k !== '__v') : ['No Data'];
      setPreview({ title: report.title, rows, columns });
    } catch (err) {
      setError(`Failed to load ${report.title}`);
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async (report: typeof reportConfigs[number]) => {
    try {
      const blob = await reportService.downloadPdf(report.endpoint, params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError(`Failed to download ${report.title} PDF`);
    }
  };

  const handlePrint = (report: typeof reportConfigs[number]) => {
    if (preview && preview.title === report.title) {
      const rowsHtml = preview.rows.slice(0, 50).map((r) => `<tr><td>${preview.columns.map((c) => String(r[c] ?? '')).join('</td><td>')}</td></tr>`).join('');
      printDocument(report.title, `<h1>${report.title}</h1><p class="sub">Period: ${from || 'All'} to ${to || 'All'}</p><table><thead><tr>${preview.columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table>`);
    } else {
      printDocument(report.title, `<h1>${report.title}</h1><p class="sub">Period: ${from || 'All'} to ${to || 'All'}</p><p>Click Preview to load data first.</p>`);
    }
  };

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Generate and export business reports" breadcrumbs={[{ label: 'Reports' }]} />

      {error && <ErrorState message={error} onRetry={() => setError('')} />}

      <Grid container spacing={2.5}>
        {reportConfigs.map((report, i) => {
          const Icon = report.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <Box sx={{ bgcolor: `${report.color}1a`, color: report.color, borderRadius: 2, p: 1.25, display: 'flex' }}>
                        <Icon size={24} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{report.title}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <TextField size="small" type="date" label="From" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      <TextField size="small" type="date" label="To" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" startIcon={<FileText size={16} />} onClick={() => fetchReport(report)} disabled={loading === report.id} sx={{ borderRadius: 2, flex: 1 }}>{loading === report.id ? 'Loading…' : 'Preview'}</Button>
                      <Button size="small" variant="outlined" startIcon={<Printer size={16} />} onClick={() => handlePrint(report)} sx={{ borderRadius: 2 }}>Print</Button>
                      <Button size="small" variant="contained" startIcon={<Download size={16} />} onClick={() => handleDownload(report)} sx={{ borderRadius: 2 }}>PDF</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {preview && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
              {preview.title} Preview
              <Button onClick={() => setPreview(null)} sx={{ minWidth: 'auto', p: 0.5 }}><X size={20} /></Button>
            </DialogTitle>
            <DialogContent>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label={`From: ${from || 'All'}`} size="small" />
                <Chip label={`To: ${to || 'All'}`} size="small" />
                <Chip label={`${preview.rows.length} records`} size="small" color="primary" variant="outlined" />
              </Stack>
              {preview.rows.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No data available for this report.</Typography>
              ) : (
                <Box sx={{ overflowX: 'auto', border: 1, borderColor: 'divider', borderRadius: 2 }}>
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <Box component="thead" sx={{ bgcolor: 'action.hover' }}>
                      <Box component="tr">
                        {preview.columns.map((c) => (
                          <Box component="th" key={c} sx={{ textAlign: 'left', p: 1.5, fontWeight: 700, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>{c}</Box>
                        ))}
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {preview.rows.slice(0, 10).map((row, idx) => (
                        <Box component="tr" key={idx} sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                          {preview.columns.map((c) => (
                            <Box component="td" key={c} sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', whiteSpace: 'nowrap' }}>{String(row[c] ?? '')}</Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
              {preview.rows.length > 10 && <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Showing first 10 of {preview.rows.length} records. Download PDF for full report.</Typography>}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button variant="outlined" startIcon={<Printer size={18} />} onClick={() => handlePrint({ title: preview.title } as typeof reportConfigs[number])} sx={{ borderRadius: 2 }}>Print</Button>
              <Button variant="contained" startIcon={<Download size={18} />} onClick={() => { exportTableToPDF(preview.title, preview.columns, preview.rows.map((r) => preview.columns.map((c) => String(r[c] ?? '')))); }} sx={{ borderRadius: 2 }}>Download PDF</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
