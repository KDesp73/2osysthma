import Link from "next/link"
import { ReactNode } from "react"

interface LayoutProps {
  children: ReactNode
}

const routes = [
    {
        name: "Τμήματα",
        href: "/"
    },
    {
        name: "Χρήσιμα Αρχεία",
        href: "/files"
    },
    {
        name: "Εικόνες",
        href: "/gallery"
    },
    {
        name: "Blog",
        href: "/blog"
    },
    {
        name: "Επικοινωνία",
        href: "/contact"
    },
];

export default function Layout({ children }: LayoutProps) {
    const title = "2ο Σύστημα Προσκόπων Κιλκίς"

  return (
    <div className="flex min-h-screen flex-col">
      {/* Topbar / Navbar */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold">
          {title}
          </Link>
          <nav className="flex items-center gap-4">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} {title}. All rights reserved.</p>
          <div className="flex gap-4">
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

