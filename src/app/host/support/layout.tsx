import HostDashboardLayout from "@/components/host/HostDashboardLayout";

export default function HostSupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HostDashboardLayout>{children}</HostDashboardLayout>;
}
