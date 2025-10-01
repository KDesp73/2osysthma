"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Image,
  Settings,
  Menu,
  LogOut,
  Home,
  Info,
  X,
} from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import Loading from "./Loading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

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
    { label: "Home", icon: <Home className="h-5 w-5" />, path: "/admin/dashboard" },
    {
      label: "Content",
      icon: <Image className="h-5 w-5" />,
      path: "/admin/dashboard/content",
      children: [
        { label: "Posts", path: "/admin/dashboard/content/posts" },
        { label: "Images", path: "/admin/dashboard/content/images" },
        { label: "Files", path: "/admin/dashboard/content/files" },
      ],
    },
    { label: "Useful", icon: <Info className="h-5 w-5" />, path: "/admin/dashboard/useful" },
    { label: "Settings", icon: <Settings className="h-5 w-5" />, path: "/admin/dashboard/settings" },
  ];

  const filteredOperations = username === "admin"
    ? operations
    : operations.filter((op) => op.label !== "Users");

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 lg:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-background text-foreground flex flex-col transform transition-transform duration-300 z-30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:relative lg:flex-shrink-0
        `}
      >
        <div className="flex justify-between items-center px-4 pt-6 pb-4">
            <h2 className="text-xl font-bold">{username || "Guest"}</h2>
            <Button
                variant="ghost"
                onClick={() => setSidebarOpen(false)}
                className="p-2 lg:hidden" // Hide close button on desktop
            >
                <X className="h-6 w-6" />
            </Button>
        </div>

        <nav className="flex-1 flex flex-col gap-2 px-2 overflow-y-auto">
          {filteredOperations.map((op) => {
            if (op.children) {
              return (
                <Accordion type="single" collapsible key={op.label}>
                  <AccordionItem value={op.label}>
                    <AccordionTrigger className="flex items-center justify-between px-3 py-2 rounded-lg text-foreground data-[state=open]:bg-secondary hover:bg-secondary/80 hover:text-white">
                      <div className="flex items-center gap-3">
                        {op.icon}
                        <span>{op.label}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col ml-4 mt-1 gap-1">
                      {op.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.path}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            pathname === child.path
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-secondary hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            } else {
              return (
                <Link
                  key={op.label}
                  href={op.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === op.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {op.icon}
                  <span>{op.label}</span>
                </Link>
              );
            }
          })}
        </nav>

        {/* Logout button */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2 mx-2 mb-4 w-[90%] self-center"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile/Desktop Header */}
        <header className="sticky top-0 z-10 p-4 bg-white border-b lg:hidden flex justify-between items-center shadow-sm">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <Button
                variant="secondary"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2"
            >
                <Menu className="h-6 w-6" />
            </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
