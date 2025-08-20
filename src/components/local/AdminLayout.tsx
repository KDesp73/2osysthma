"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home } from "lucide-react";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();
    const page = usePathname();

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
    // Loading state while checking auth
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  // Render children only if authenticated
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-8">
      {(page !== "/admin/dashboard") ? (<Button
        variant="default"
        onClick={() => {router.push("/admin/dashboard")}}
      >
        <Home /> Home
      </Button>) : <></>}
      {children}
    </div>
  );
}
