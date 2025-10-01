"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Title from "@/components/local/Title";
import ContactLinks from "@/components/local/ContactLinks";
import Map from "@/components/local/Map";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

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
            <p className="mt-2 text-green-600">
              Το μήνυμά σας στάλθηκε επιτυχώς!
            </p>
          )}
          {status === "error" && (
            <p className="mt-2 text-red-600">
              Σφάλμα κατά την αποστολή. Προσπαθήστε ξανά.
            </p>
          )}
        </section>

        {/* Contact Links */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Άλλοι τρόποι επικοινωνίας
          </h2>
          <ContactLinks />
        </section>
      </div>
    </>
  );
}
