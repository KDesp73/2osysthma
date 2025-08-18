"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Mail, Phone, Instagram, Facebook } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: hook this up to /api/contact or an email service
    console.log("Submitted:", formData)
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Επικοινώνησε μαζί μας!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Στείλε ένα μήνυμα</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="name"
              placeholder="Όνομα"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Textarea
              name="message"
              placeholder="Γράψε εδώ"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </section>

        {/* Contact Links */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Άλλοι τρόποι επικοινωνίας</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500" />
              <a href="mailto:example@email.com" className="hover:underline">
                example@email.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-500" />
              <a href="tel:+302341028348" className="hover:underline">
                +30 2341 028348
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-gray-500" />
              <Link href="https://www.facebook.com/profile.php?id=61577586039297" target="_blank" className="hover:underline">
                Facebook 
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-gray-500" />
              <Link href="https://www.instagram.com/2osystimakilkis" target="_blank" className="hover:underline">
                Instagram
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
