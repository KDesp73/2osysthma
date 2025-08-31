"use client";

import { useRouter } from "next/navigation";
import { FileText, Image, Settings, Github } from "lucide-react";
import GitHistory from "@/components/local/GitHistory";


export default function AdminDashboard() {
  const router = useRouter();

  const operations = [
    { label: "Posts", icon: <FileText className="h-8 w-8 mb-2" />, path: "/admin/dashboard/posts" },
    { label: "Content", icon: <Image className="h-8 w-8 mb-2" />, path: "/admin/dashboard/content" },
    { label: "Settings", icon: <Settings className="h-8 w-8 mb-2" />, path: "/admin/dashboard/settings" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </header>

      {/* Operations Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {operations.map((op) => (
          <button
            key={op.label}
            onClick={() => router.push(op.path)}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            {op.icon}
            <span className="text-lg font-semibold">{op.label}</span>
          </button>
        ))}
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <GitHistory />
      </section>
    </div>
  );
}
