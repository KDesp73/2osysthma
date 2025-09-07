import React from "react"
import SocialButtons from "./SocialButtons"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import ContactLinks from "./ContactLinks"

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">2ο Σύστημα Προσκόπων Κιλκίς</h3>
          <p className="text-gray-600 text-sm">
              Εδώ και 50 χρόνια είμαστε μια παρέα που μεγαλώνει, γελάει, εξερευνά, παίζει και προσφέρει
          </p>
          <SocialButtons />
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Γρήγοροι Σύνδεσμοι</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/depts" className="text-gray-600 hover:text-[#f08e7f] transition-colors">
                Τμήματα
              </Link>
            </li>
            <li>
              <Link href="/useful" className="text-gray-600 hover:text-[#f08e7f] transition-colors">
                Χρήσιμα
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="text-gray-600 hover:text-[#f08e7f] transition-colors">
                Εικόνες
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-gray-600 hover:text-[#f08e7f] transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-600 hover:text-[#f08e7f] transition-colors">
                Επικοινωνία
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact / Newsletter */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Επικοινωνία</h3>
          <ContactLinks />
        </div>

      </div>

      {/* Bottom copyright */}
      <div className="border-t border-gray-200 mt-8 py-4 text-center text-gray-500 text-sm select-none">
        &copy; {new Date().getFullYear()} 2ο Σύστημα Προσκόπων Κιλκίς. All rights reserved.
      </div>
    </footer>
  )
}
