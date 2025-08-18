"use client"

import Image from "next/image"
import Link from "next/link"
import { ReactNode, useState } from "react"
import { Menu, X } from "lucide-react"

interface LayoutProps {
  children: ReactNode
}

const routes = [
  { name: "Τμήματα", href: "/" },
  { name: "Χρήσιμα Αρχεία", href: "/files" },
  { name: "Εικόνες", href: "/gallery" },
  { name: "Blog", href: "/blog" },
  { name: "Επικοινωνία", href: "/contact" },
]

export default function Layout({ children }: LayoutProps) {
  const title = "2ο Σύστημα Προσκόπων Κιλκίς"
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Topbar / Navbar */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={160}
              height={40}
              priority
            />
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="text-sm font-medium hover:underline"
              >
                {route.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="flex flex-col px-4 py-2 gap-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="text-sm font-medium hover:underline"
                  onClick={() => setMenuOpen(false)}
                >
                  {route.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 text-sm text-gray-600 gap-2 md:gap-0">
          <p>© {new Date().getFullYear()} {title}. All rights reserved.</p>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
