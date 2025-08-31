"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Image, Users, Settings, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import Loading from "./Loading";

interface Props {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuthUser();
  if (loading) return <Loading />;

  const username = user?.username;

  const operations = [
    { label: "Posts", icon: <FileText className="h-5 w-5" />, path: "/admin/dashboard/posts" },
    { label: "Content", icon: <Image className="h-5 w-5" />, path: "/admin/dashboard/content" },
    { label: "Settings", icon: <Settings className="h-5 w-5" />, path: "/admin/dashboard/settings" },
  ];

  const filteredOperations =
    username === "admin" ? operations : operations.filter((op) => op.label !== "Users");

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

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
          fixed top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 z-30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:relative
        `}
      >
        <h2 className="text-xl font-bold mb-4 px-4 pt-6">{username || "Guest"}</h2>
        <nav className="flex-1 flex flex-col gap-2 px-2">
          {filteredOperations.map((op) => (
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

        {/* Logout button at the bottom */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2 mx-2 mb-4 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-auto p-6">{children}</main>

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
