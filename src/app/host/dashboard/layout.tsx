import HostDashboardLayout from "@/components/host/HostDashboardLayout";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HostDashboardLayout>{children}</HostDashboardLayout>;
}
