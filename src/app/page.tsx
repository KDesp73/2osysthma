import Map from '@/components/local/Map';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Banner */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg mb-8">
        <img
          src="/banner.jpg"
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title & Description */}
      <div className="max-w-2xl text-center my-8 px-4">
        <h1 className="text-3xl font-bold mb-8">
            Καλωσήρθατε στο 2ο Σύστημα Προσκόπων Κιλκίς!
        </h1>
        <p className="text-lg text-gray-700 mb-8">
            Εδώ και 50 χρόνια είμαστε μια παρέα που μεγαλώνει, γελάει, εξερευνά, παίζει και προσφέρει
        </p>

        <ul className="space-y-4 list-none mb-10">
            <li className="flex items-start">
                <span className="block w-3 h-3 rounded-full bg-yellow-500 mr-2 mt-1 shrink-0"></span>
                <p className="text-lg text-gray-700">
                    Οι μικροί μας στην Αγέλη (Α΄– Δ΄ Δημοτικού) μαθαίνουν να συνεργάζονται μέσα από παιχνίδι και φαντασία.
                </p>
            </li>

            <li className="flex items-start">
                <span className="block w-3 h-3 rounded-full bg-green-500 mr-2 mt-1 shrink-0"></span>
                <p className="text-lg text-gray-700">
                    Η Ομάδα (Ε΄ Δημοτικού – Β΄ Γυμνασίου) ζει τις πρώτες μεγάλες εξερευνήσεις και περιπέτειες.
                </p>
            </li>

            <li className="flex items-start">
                <span className="block w-3 h-3 rounded-full bg-red-500 mr-2 mt-1 shrink-0"></span>
                <p className="text-lg text-gray-700">
                    Η Κοινότητα Ανιχνευτών (Γ΄ Γυμνασίου – Γ΄ Λυκείου) παίρνει πρωτοβουλίες, σχεδιάζει δράσεις και αφήνει το δικό της αποτύπωμα στην κοινωνία.
                </p>
            </li>
        </ul>
      </div>

      {/*
      <StitchSeparator 
          repeat={20} minAngle={0} maxAngle={0} size={250}
      />
      */}

      <Map />
    </div>
  );
}
