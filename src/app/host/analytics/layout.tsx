import HostDashboardLayout from "@/components/host/HostDashboardLayout";

export default function HostAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HostDashboardLayout>{children}</HostDashboardLayout>;
}
