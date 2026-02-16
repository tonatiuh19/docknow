import React, { useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { checkAuthStatus } from "@/store/slices/authSlice";
import { motion } from "framer-motion";
import { Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      // No token, redirect to home
      navigate("/", { replace: true });
      return;
    }

    if (!isAuthenticated && !user) {
      // Token exists but user not loaded, validate the auth status
      dispatch(checkAuthStatus());
    }
  }, [dispatch, navigate, isAuthenticated, user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-ocean-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying authentication...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your access.
          </p>
        </motion.div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to access this page. Please sign in to
            continue.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800"
            >
              Go to Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/discover")}
              className="w-full"
            >
              Browse Marinas
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default AuthGuard;
