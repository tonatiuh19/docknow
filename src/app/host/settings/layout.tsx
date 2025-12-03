import HostDashboardLayout from "@/components/host/HostDashboardLayout";

export default function HostSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HostDashboardLayout>{children}</HostDashboardLayout>;
}
