import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import MarinaDetail from "./pages/MarinaDetail";
import Reservations from "./pages/Reservations";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/AuthGuard";
import HostLogin from "./pages/HostLogin";
import HostAuthGuard from "./components/admin/HostAuthGuard";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminBookings from "@/pages/admin/Bookings";
import AdminPayments from "./pages/admin/Payments";
import AdminMarinas from "./pages/admin/Marinas";
import AdminHosts from "./pages/admin/Hosts";
import AdminPreCheckout from "./pages/admin/PreCheckout";

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Index />} />
    <Route path="/discover" element={<Discover />} />
    <Route path="/discover/:slug" element={<MarinaDetail />} />

    {/* User Protected Routes */}
    <Route
      path="/reservations"
      element={
        <AuthGuard>
          <Reservations />
        </AuthGuard>
      }
    />
    <Route
      path="/profile"
      element={
        <AuthGuard>
          <Profile />
        </AuthGuard>
      }
    />

    {/* Host/Admin Routes */}
    <Route path="/host/login" element={<HostLogin />} />
    <Route
      path="/admin/dashboard"
      element={
        <HostAuthGuard>
          <AdminDashboard />
        </HostAuthGuard>
      }
    />
    <Route
      path="/admin/bookings"
      element={
        <HostAuthGuard>
          <AdminBookings />
        </HostAuthGuard>
      }
    />
    <Route
      path="/admin/payments"
      element={
        <HostAuthGuard>
          <AdminPayments />
        </HostAuthGuard>
      }
    />
    <Route
      path="/admin/marinas"
      element={
        <HostAuthGuard>
          <AdminMarinas />
        </HostAuthGuard>
      }
    />
    <Route
      path="/admin/hosts"
      element={
        <HostAuthGuard>
          <AdminHosts />
        </HostAuthGuard>
      }
    />
    <Route
      path="/admin/pre-checkout"
      element={
        <HostAuthGuard>
          <AdminPreCheckout />
        </HostAuthGuard>
      }
    />

    {/* Catch-all route - must be last */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
