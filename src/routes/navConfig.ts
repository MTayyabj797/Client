import {
  LayoutDashboard, Users, Truck, Package, ShoppingCart, FileText, Wallet,
  Landmark, BookOpen, BarChart3, Settings, type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Suppliers', path: '/suppliers', icon: Truck },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Sales', path: '/sales', icon: ShoppingCart },
  { label: 'Purchases', path: '/purchases', icon: FileText },
  { label: 'Expenses', path: '/expenses', icon: Wallet },
  { label: 'Cash Book', path: '/cash-book', icon: Wallet },
  { label: 'Bank Accounts', path: '/bank-accounts', icon: Landmark },
  { label: 'Daily Book', path: '/daily-book', icon: BookOpen },
  // { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];
