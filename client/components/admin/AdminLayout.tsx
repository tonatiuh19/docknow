import React, { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  Building2,
  ClipboardCheck,
  Menu,
  X,
  LogOut,
  Anchor,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutHost } from "@/store/slices/hostAuthSlice";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { host } = useAppSelector((state) => state.hostAuth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Calendar",
      href: "/admin/bookings",
      icon: Calendar,
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: DollarSign,
    },
    {
      name: "Marina Management",
      href: "/admin/marinas",
      icon: Building2,
    },
    {
      name: "Host Management",
      href: "/admin/hosts",
      icon: User,
    },
    {
      name: "Pre-Checkout",
      href: "/admin/pre-checkout",
      icon: ClipboardCheck,
    },
  ];

  const handleLogout = async () => {
    await dispatch(logoutHost());
    navigate("/host/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar for desktop */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 288 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-navy-950 shadow-2xl z-40 group"
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Logo */}
          <div className="relative flex items-center justify-between px-6 py-6">
            <div
              className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src="https://garbrix.com/navios/assets/images/logo.png"
                  alt="DockNow"
                  className="w-12 h-12 object-contain"
                />
              </div>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h1 className="text-xl font-bold text-white">DockNow</h1>
                  <p className="text-xs text-ocean-300">Host Dashboard</p>
                </motion.div>
              )}
            </div>

            {/* Collapse button - Only visible on hover */}
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="fixed left-[264px] top-8 w-6 h-6 bg-ocean-500 hover:bg-ocean-600 rounded-full flex items-center justify-center shadow-lg transition-all z-[60] opacity-0 group-hover:opacity-100"
              style={{ left: isCollapsed ? "68px" : "264px" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-white" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-white" />
              )}
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                    active
                      ? "bg-gradient-ocean text-white shadow-lg shadow-ocean-500/30"
                      : "text-navy-300 hover:bg-navy-800 hover:text-white"
                  }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <motion.span
                    animate={{
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : "auto",
                    }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-navy-800 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-navy-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-navy-800 transition-colors">
                  <div className="w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                    {host?.full_name?.charAt(0) || "H"}
                  </div>
                  <motion.div
                    animate={{
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : "auto",
                    }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 text-left overflow-hidden"
                  >
                    <p className="text-sm font-semibold text-white truncate">
                      {host?.full_name}
                    </p>
                    <p className="text-xs text-navy-400 truncate">
                      {host?.email}
                    </p>
                  </motion.div>
                  {!isCollapsed && (
                    <ChevronDown className="w-4 h-4 text-navy-400 flex-shrink-0" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-navy-950 shadow-2xl z-50 lg:hidden flex flex-col"
            >
              {/* Logo */}
              <div className="flex items-center justify-between px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                    <img
                      src="https://garbrix.com/navios/assets/images/logo.png"
                      alt="DockNow"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">DockNow</h1>
                    <p className="text-xs text-ocean-300">Host Dashboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-navy-800 transition-colors"
                >
                  <X className="w-5 h-5 text-navy-300" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-gradient-ocean text-white shadow-lg shadow-ocean-500/30"
                          : "text-navy-300 hover:bg-navy-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User Info */}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-navy-900">
                  <div className="w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    {host?.full_name?.charAt(0) || "H"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {host?.full_name}
                    </p>
                    <p className="text-xs text-navy-400 truncate">
                      {host?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full text-red-400 border-red-800 hover:bg-red-950 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className={`transition-[padding] duration-300 ease-in-out ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}`}
      >
        {/* Top bar - Floating */}
        <header className="fixed top-4 right-4 z-30 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-navy-600" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-navy-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-ocean-500 rounded-full"></span>
            </button>

            {/* Mobile user menu */}
            <div className="">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                      {host?.full_name?.charAt(0) || "H"}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-semibold text-navy-900">
                      {host?.full_name}
                    </p>
                    <p className="text-xs text-navy-500">{host?.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-slate-600 focus:text-slate-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 pt-20 sm:pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
