"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import LoadingSpinner from "@/components/LoadingSpinner";

interface HostAuthGuardProps {
  children: React.ReactNode;
}

export default function HostAuthGuard({ children }: HostAuthGuardProps) {
  const router = useRouter();
  const { hostIsAuthenticated, hostAuthLoading, checkHostAuth } = useStore();

  useEffect(() => {
    checkHostAuth();
  }, [checkHostAuth]);

  useEffect(() => {
    if (hostAuthLoading === "succeeded" && !hostIsAuthenticated) {
      router.push("/host/login");
    }
  }, [hostIsAuthenticated, hostAuthLoading, router]);

  if (hostAuthLoading === "loading" || hostAuthLoading === "idle") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hostIsAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
