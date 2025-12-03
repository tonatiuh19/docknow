import HostDashboardLayout from "@/components/host/HostDashboardLayout";

export default function HostBookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HostDashboardLayout>{children}</HostDashboardLayout>;
}
