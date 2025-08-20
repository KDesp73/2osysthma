"use client";

import PostEditor from "@/components/local/PostEditor";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
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

  if (authenticated === null)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
      </header>

      <section className="bg-white rounded-xl shadow p-6 space-y-4 max-w-5xl w-full">
        <PostEditor />
      </section>
    </div>
  );
}
