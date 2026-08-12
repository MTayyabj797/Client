import { Grid, Card, CardContent, Typography, Box, Stack, Chip } from '@mui/material';
import { useTheme } from '@mui/material';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Wallet, Landmark, AlertCircle, AlertTriangle, Users, Truck, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import LoadingSkeleton, { CardGridSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import StatusChip from '@/components/StatusChip';
import { useDashboardSummary, useDashboardCharts } from '@/hooks/useDashboard';
import { formatCurrency, formatDate } from '@/utils/format';
import type { DailyEntry } from '@/api/services';

const statusMap: Record<string, 'Paid' | 'Partial' | 'Unpaid'> = {
  paid: 'Paid', partial: 'Partial', unpaid: 'Unpaid', cancelled: 'Unpaid',
};

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const grid = theme.palette.divider;
  const text = theme.palette.text.secondary;

  const summaryQuery = useDashboardSummary();
  const chartsQuery = useDashboardCharts();

  if (summaryQuery.isLoading) {
    return (
      <Box>
        <PageHeader title="Dashboard" subtitle="Overview of your shop's financial activity" breadcrumbs={[{ label: 'Dashboard' }]} />
        <CardGridSkeleton count={8} />
        <Box sx={{ mt: 2 }}><LoadingSkeleton rows={6} /></Box>
      </Box>
    );
  }

  if (summaryQuery.isError) {
    return (
      <Box>
        <PageHeader title="Dashboard" subtitle="Overview of your shop's financial activity" breadcrumbs={[{ label: 'Dashboard' }]} />
        <ErrorState message="Failed to load dashboard data" onRetry={() => summaryQuery.refetch()} />
      </Box>
    );
  }

  const s = summaryQuery.data!;
  const cards = [
    { title: "Today's Sales", value: formatCurrency(s.todays_sales), icon: TrendingUp, color: 'success' as const },
    { title: "Today's Expenses", value: formatCurrency(s.todays_expenses), icon: ShoppingCart, color: 'error' as const },
    { title: 'Cash in Hand', value: formatCurrency(s.cash_in_hand), icon: Wallet, color: 'primary' as const },
    { title: 'Bank Balance', value: formatCurrency(s.total_bank_balance), icon: Landmark, color: 'secondary' as const },
    { title: 'Pending Receivables', value: formatCurrency(s.total_receivables), icon: AlertCircle, color: 'warning' as const },
    { title: 'Pending Payables', value: formatCurrency(s.total_payables), icon: AlertTriangle, color: 'error' as const },
    { title: 'Total Customers', value: String(s.bank_balances?.length ?? 0), icon: Users, color: 'info' as const },
    { title: 'Total Suppliers', value: String(s.bank_balances?.length ?? 0), icon: Truck, color: 'primary' as const },
  ];

  const charts = chartsQuery.data;
  const monthlyRevenue = charts?.monthly_sales?.map((m: { month: string; sales: number }) => ({ name: m.month.slice(5), revenue: m.sales })) ?? [];
  const monthlyExpenses = charts?.monthly_expenses?.map((m: { month: string; expenses: number }) => ({ name: m.month.slice(5), amount: m.expenses })) ?? [];
  const cashFlowData = charts?.cash_flow?.map((m: { month: string; cash_in: number; cash_out: number; net: number }) => ({ name: m.month.slice(5), inflow: m.cash_in, outflow: m.cash_out })) ?? [];
  const revenueTarget = charts?.monthly_sales?.map((m: { month: string; sales: number }) => ({ name: m.month.slice(5), revenue: m.sales, target: 0 })) ?? [];

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Overview of your shop's financial activity" breadcrumbs={[{ label: 'Dashboard' }]} />

      <Grid container spacing={2}>
        {cards.map((card, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.title}>
            <StatCard {...card} delay={i * 0.04} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={8}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Revenue & Expense Trend</Typography>
                    <Typography variant="body2" color="text.secondary">Last 12 months performance</Typography>
                  </Box>
                  <Chip label="Monthly" size="small" color="primary" variant="outlined" />
                </Stack>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                      <XAxis dataKey="name" stroke={text} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={text} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${grid}`, background: theme.palette.background.paper, fontSize: 13 }} />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke={theme.palette.success.main} strokeWidth={2.5} fill="url(#revG)" />
                      {monthlyExpenses.length > 0 && <Line type="monotone" data={monthlyExpenses} dataKey="amount" name="Expense" stroke={theme.palette.error.main} strokeWidth={2.5} dot={false} />}
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} lg={4}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Expense Trend</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Monthly expenses</Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={monthlyExpenses} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                      <XAxis dataKey="name" stroke={text} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={text} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${grid}`, background: theme.palette.background.paper, fontSize: 13 }} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                      <Bar dataKey="amount" name="Expense" fill={theme.palette.error.main} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Cash Flow</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Monthly inflow vs outflow</Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <AreaChart data={cashFlowData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="inG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="outG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                      <XAxis dataKey="name" stroke={text} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={text} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${grid}`, background: theme.palette.background.paper, fontSize: 13 }} />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Area type="monotone" dataKey="inflow" name="Inflow" stroke={theme.palette.primary.main} strokeWidth={2.5} fill="url(#inG)" />
                      <Area type="monotone" dataKey="outflow" name="Outflow" stroke={theme.palette.warning.main} strokeWidth={2.5} fill="url(#outG)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Monthly Sales</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Sales over time</Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={revenueTarget} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                      <XAxis dataKey="name" stroke={text} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={text} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${grid}`, background: theme.palette.background.paper, fontSize: 13 }} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Bar dataKey="revenue" name="sales" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="target" name="Target" fill={isDark ? '#334155' : '#cbd5e1'} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Transactions</Typography>
            <Stack spacing={1}>
              {s.recent_transactions?.slice(0, 6).map((t: DailyEntry) => (
                <Stack
                  key={t.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ py: 1.25, px: 2, borderRadius: 2, bgcolor: 'action.hover', flexWrap: 'wrap', gap: 1 }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1.5, p: 1, display: 'flex' }}>
                      <ShoppingCart size={16} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{t.ref_type || t.description}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.description} · {formatDate(t.date)}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(t.debit || t.credit)}</Typography>
                    <StatusChip status={t.debit > 0 ? 'Unpaid' : 'Paid'} />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
