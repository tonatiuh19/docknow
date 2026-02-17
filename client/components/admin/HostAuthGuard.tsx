import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkHostAuth } from "@/store/slices/hostAuthSlice";

interface HostAuthGuardProps {
  children: React.ReactNode;
}

const HostAuthGuard: React.FC<HostAuthGuardProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, isLoading, sessionToken } = useAppSelector(
    (state) => state.hostAuth,
  );

  useEffect(() => {
    if (sessionToken && !isAuthenticated) {
      dispatch(checkHostAuth());
    }
  }, [dispatch, sessionToken, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-ocean-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/host/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default HostAuthGuard;
