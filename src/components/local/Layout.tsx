"use client"

import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"
import { Menu } from "lucide-react"
import Footer from "./Footer"
import { usePathname } from "next/navigation"
import AdminLayout from "./AdminLayout"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface LayoutProps {
  children: ReactNode
}

const routes = [
  { name: "Τμήματα", href: "/depts" },
  { name: "Χρήσιμα", href: "/useful" },
  { name: "Εικόνες", href: "/gallery" },
  { name: "Blog", href: "/blog" },
  { name: "Επικοινωνία", href: "/contact" },
]

export default function Layout({ children }: LayoutProps) {
  const title = "2ο Σύστημα Προσκόπων Κιλκίς"
  const path = usePathname()

  if (path.startsWith("/admin/")) {
    if (path === "/admin/login") return children
    return <AdminLayout>{children}</AdminLayout>
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Topbar */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.webp" alt={title} width={160} height={40} priority />
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex flex-1 justify-center">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-6">
                {routes.map((route) => (
                  <NavigationMenuItem key={route.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={route.href}
                        className="px-3 py-1 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                      >
                        {route.name}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>{title}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="rounded-md px-4 py-2 hover:bg-accent hover:text-accent-foreground font-medium transition-colors"
                  >
                    {route.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
