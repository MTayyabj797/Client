import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeModeProvider } from '@/contexts/ThemeContext';
import AppProviders from '@/contexts/AppProviders';
import AppLayout from '@/layouts/AppLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import Login from '@/pages/Login';
import Welcome from '@/pages/Welcome';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CustomerLedger from '@/pages/CustomerLedger';
import Suppliers from '@/pages/Suppliers';
import SupplierLedger from '@/pages/SupplierLedger';
import Products from '@/pages/Products';
import Sales from '@/pages/Sales';
import Purchases from '@/pages/Purchases';
import Expenses from '@/pages/Expenses';
import CashBook from '@/pages/CashBook';
import BankAccounts from '@/pages/BankAccounts';
import BankLedger from '@/pages/BankLedger';
import DailyBook from '@/pages/DailyBook';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <AppProviders>
      <ThemeModeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerLedger />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/suppliers/:id" element={<SupplierLedger />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/cash-book" element={<CashBook />} />
              <Route path="/bank-accounts" element={<BankAccounts />} />
              <Route path="/bank-accounts/:id" element={<BankLedger />} />
              <Route path="/daily-book" element={<DailyBook />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeModeProvider>
    </AppProviders>
  );
}
