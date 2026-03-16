"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

interface UseAuthRedirectOptions {
  shouldRedirect?: boolean;
}

export const useAuthRedirect = ({
  shouldRedirect = true,
}: UseAuthRedirectOptions = {}) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!shouldRedirect || loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/dashboards/admin");
    } else if (user.role === "STAFF") {
      router.replace("/dashboards/staff");
    } else {
      router.replace("/dashboards/customer");
    }
  }, [user, loading, router, shouldRedirect]);
};
