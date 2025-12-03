import HostDashboardLayout from "@/components/host/HostDashboardLayout";

export default function HostGuestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HostDashboardLayout>{children}</HostDashboardLayout>;
}
