import HostDashboardLayout from "@/components/host/HostDashboardLayout";

export default function HostFeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HostDashboardLayout>{children}</HostDashboardLayout>;
}
