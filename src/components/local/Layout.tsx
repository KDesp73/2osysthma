import Link from "next/link"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface LayoutProps {
  children: ReactNode
}

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
            <Link href="/contact" className="text-sm font-medium hover:underline">
              Contact
            </Link>
            <Link href="/files" className="text-sm font-medium hover:underline">
              Useful Files
            </Link>
            <Link href="/personnel" className="text-sm font-medium hover:underline">
              Personnel
            </Link>
            <Link href="/blog" className="text-sm font-medium hover:underline">
              Blog
            </Link>
            <Link href="/images" className="text-sm font-medium hover:underline">
              Images
            </Link>
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

