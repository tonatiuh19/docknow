import HostDashboardLayout from "@/components/host/HostDashboardLayout";

export default function HostPaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HostDashboardLayout>{children}</HostDashboardLayout>;
}
