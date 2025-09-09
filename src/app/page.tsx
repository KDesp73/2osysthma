"use client";

import { motion } from "framer-motion";
import Map from "@/components/local/Map";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Banner with animated overlay */}
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg mb-8">
        <img
          src="/banner.jpg"
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/40"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Καλωσήρθατε στο 2ο Σύστημα Προσκόπων Κιλκίς!
          </h1>
        </motion.div>
      </div>

      {/* Title & Description */}
      <div className="max-w-2xl text-center my-8 px-4">
        <h2 className="text-xl text-gray-700 mb-8">
          Εδώ και 50 χρόνια είμαστε μια παρέα που μεγαλώνει, γελάει, εξερευνά,
          παίζει και προσφέρει
        </h2>

        <ul className="space-y-6 list-none mb-10">
          {[
            {
              color: "bg-yellow-500",
              text: "Οι μικροί μας στην Αγέλη (Α΄– Δ΄ Δημοτικού) μαθαίνουν να συνεργάζονται μέσα από παιχνίδι και φαντασία.",
            },
            {
              color: "bg-green-500",
              text: "Η Ομάδα (Ε΄ Δημοτικού – Β΄ Γυμνασίου) ζει τις πρώτες μεγάλες εξερευνήσεις και περιπέτειες.",
            },
            {
              color: "bg-red-500",
              text: "Η Κοινότητα Ανιχνευτών (Γ΄ Γυμνασίου – Γ΄ Λυκείου) παίρνει πρωτοβουλίες, σχεδιάζει δράσεις και αφήνει το δικό της αποτύπωμα στην κοινωνία.",
            },
          ].map(({ color, text }, i) => (
            <motion.li
              key={i}
              whileHover={{ scale: 1.03, x: 6 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-start bg-gray-50 p-4 rounded-xl shadow-sm"
            >
              <span
                className={`block w-3 h-3 rounded-full ${color} mr-3 mt-2 shrink-0`}
              />
              <p className="text-lg text-gray-700">{text}</p>
            </motion.li>
          ))}
        </ul>
      </div>

      <Map />
    </div>
  );
}
