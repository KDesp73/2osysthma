"use client";

import { useRouter } from "next/navigation";
import { FileText, Image, Users, Settings } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  const operations = [
    { label: "Posts", icon: <FileText className="h-8 w-8 mb-2" />, path: "/admin/dashboard/posts" },
    { label: "Images", icon: <Image className="h-8 w-8 mb-2" />, path: "/admin/dashboard/images" },
    { label: "Users", icon: <Users className="h-8 w-8 mb-2" />, path: "/admin/dashboard/users" },
    { label: "Settings", icon: <Settings className="h-8 w-8 mb-2" />, path: "/admin/dashboard/settings" },
  ];

  return (<>
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full px-6">
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
    </>
  );
}
