"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "./AdminDashboardLayout";

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
