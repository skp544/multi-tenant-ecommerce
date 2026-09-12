import {
  BarChart3Icon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  MegaphoneIcon,
  PhoneIcon,
  Settings,
  ShieldCheckIcon,
  ShoppingBagIcon,
  Store,
  Truck,
  Users,
} from "lucide-react";

export const SIDEBAR_NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboardIcon },
  { href: "/dashboard/sellers", label: "Sellers", Icon: Store },
  {
    href: "/dashboard/commission-payouts",
    label: "Commission & Payouts",
    Icon: Store,
  },
  {
    href: "/dashboard/global-catalog",
    label: "Global Catalog",
    Icon: LayoutGridIcon,
  },
  {
    href: "/dashboard/delivery-network",
    label: "Delivery Network",
    Icon: Truck,
  },
  { href: "/dashboard/customers", label: "Customers", Icon: Users },
  { href: "/dashboard/orders", label: "Orders", Icon: ShoppingBagIcon },
  { href: "/dashboard/support", label: "Supports", Icon: PhoneIcon },
  { href: "/dashboard/marketing", label: "Marketing", Icon: MegaphoneIcon },
  { href: "/dashboard/reports", label: "Reports", Icon: BarChart3Icon },
  {
    href: "/dashboard/users-permissions",
    label: "Users & Permissions",
    Icon: ShieldCheckIcon,
  },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
];
