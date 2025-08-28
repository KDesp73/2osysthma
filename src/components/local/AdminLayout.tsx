"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "./AdminDashboardLayout";
import Loading from "./Loading";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/check-token");
        if (!res.ok) {
          router.push("/admin/login");
          return;
        }
        setAuthenticated(true);
      } catch {
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

  if (authenticated === null) {
    return <Loading />;
  }

  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
