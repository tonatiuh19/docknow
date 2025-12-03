import HostDashboardLayout from "@/components/host/HostDashboardLayout";

export default function HostMarinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HostDashboardLayout>{children}</HostDashboardLayout>;
}
