"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: Array<"ADMIN" | "STAFF" | "CUSTOMER">;
}

export default function PrivateRoute({
  children,
  allowedRoles,
}: PrivateRouteProps) {
  const router = useRouter();
  const { user, loading, checkAuth } = useAuthContext();

  useEffect(() => {
    // Re-check auth when component mounts
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("No user found, redirecting to login");
        router.replace("/auth/login");
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          console.log(`Role ${user.role} not allowed`);

          switch (user.role) {
            case "ADMIN":
              router.replace("/dashboards/admin");
              break;
            case "STAFF":
              router.replace("/dashboards/staff");
              break;
            case "CUSTOMER":
              router.replace("/dashboards/customer");
              break;
            default:
              router.replace("/auth/login");
          }
          return;
        }
      }
    }
  }, [user, loading, router, allowedRoles]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if user exists and roles match
  if (!user) return null;

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return null;
  }

  return <>{children}</>;
}
