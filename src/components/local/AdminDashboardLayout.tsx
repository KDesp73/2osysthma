"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Image, Users, Settings, Menu } from "lucide-react";
import { useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const operations = [
    { label: "Posts", icon: <FileText className="h-5 w-5" />, path: "/admin/dashboard/posts" },
    { label: "Images", icon: <Image className="h-5 w-5" />, path: "/admin/dashboard/images" },
    { label: "Users", icon: <Users className="h-5 w-5" />, path: "/admin/dashboard/users" },
    { label: "Settings", icon: <Settings className="h-5 w-5" />, path: "/admin/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="absolute bottom-5 right-4 lg:hidden z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-gray-900 text-white rounded-md"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 z-30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:relative lg:flex lg:flex-col
        `}
      >
        <h2 className="text-xl font-bold mb-4 px-4 pt-6">Admin</h2>
        <nav className="flex-1 flex flex-col gap-2 px-2">
          {operations.map((op) => (
            <Link
              key={op.label}
              href={op.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === op.path
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {op.icon}
              <span>{op.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-auto p-6">
        {children}
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 lg:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
