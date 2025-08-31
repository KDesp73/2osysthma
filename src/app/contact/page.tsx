"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Mail, Phone, Instagram, Facebook, Pin } from "lucide-react"
import Title from "@/components/local/Title"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const [status, setStatus] = useState<null | "success" | "error">(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setStatus("success")
        setFormData({ name: "", email: "", message: "" })
      } else {
        setStatus("error")
      }
    } catch (error) {
      console.error("Submit error:", error)
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>

      <Title name="Επικοινώνησε μαζί μας!" />
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>

          {status === "success" && (
            <p className="mt-2 text-green-600">Το μήνυμά σας στάλθηκε επιτυχώς!</p>
          )}
          {status === "error" && (
            <p className="mt-2 text-red-600">Σφάλμα κατά την αποστολή. Προσπαθήστε ξανά.</p>
          )}
        </section>

        {/* Contact Links */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Άλλοι τρόποι επικοινωνίας</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500" />
              <a href="mailto:2p_kilkis@sep.org.gr" className="hover:underline">
                2p_kilkis@sep.org.gr
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Pin className="h-5 w-5 text-gray-500" />
              <a href="https://maps.app.goo.gl/riqzmUYBYEczAer39" className="hover:underline">
                Παπαγιαννάκου 1, Κιλκίς, 61100
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-500" />
              <a href="tel:+306981927806" className="hover:underline">
                +30 698 192 7806 (Στάθης Ιορδανίδης)
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
    </>
  )
}
