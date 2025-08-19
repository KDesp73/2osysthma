export default function Departments() {
  const departments = [
    {
      name: "Αγέλη",
      ages: "6 - 10 ετών",
      schedule: "Σάββατο 13:00 - 14:30",
      staff: ["Αρχηγός Αγέλης: Κωνσταντίνος Δεσποινίδης", "Υπαρχηγοί: Λουκάς Χαλκίδης"],
    },
    {
      name: "Ομάδα",
      ages: "11 - 14 ετών",
      schedule: "Σάββατο 17:00 - 18:30",
      staff: ["Αρχηγός Ομάδας: Ηλίας Σουμελίδης", "Υπαρχηγοί: Ηλίας Τσιρώνης, Βασιλική Ζώγκα"],
    },
    {
      name: "Κοινότητα",
      ages: "15 - 18 ετών",
      schedule: "Κατόπιν συνεννόησης",
      staff: ["Αρχηγός Κοινότητας: Αλέξης Ιορδανίδης", "Υπαρχηγοί: Χρήστος Ιορδανίδης, Ουρανία Ακριτίδου, Νεφέλη Βεργίδου"],
    },
    {
      name: "Δίκτυο",
      ages: "18 - 25 ετών",
      schedule: "Κατόπιν συνεννόησης",
      staff: ["Αρχηγός Δικτύου: Θεώδορος Παπαδόπουλος"],
    },
  ];

  const systemLeaders = {
    chief: "Αρχηγός Συστήματος: Στάθης Ιορδανίδης",
    deputies: ["Υπαρχηγοί Συστήματος: Άρτεμις Παχιαδάκη, Χρήστος Μωυσίδης"],
  };

  return (
    <div className="p-6">
      {/* Banner */}
      <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg mb-8">
        <img
          src="/banner.jpg"
          alt="Banner"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Τα Τμήματά μας</h1>
        </div>
      </div>

      {/* Departments List */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {departments.map((dep) => (
          <div
            key={dep.name}
            className="bg-white shadow-md rounded-xl p-6 flex flex-col"
          >
            <h2 className="text-2xl font-semibold mb-2">{dep.name}</h2>
            <p className="text-gray-700 mb-1"><strong>Ηλικίες:</strong> {dep.ages}</p>
            <p className="text-gray-700 mb-1"><strong>Συγκεντρώσεις:</strong> {dep.schedule}</p>
            <div className="mt-2">
              <strong>Επιτελείο:</strong>
              <ul className="list-disc list-inside text-gray-700 mt-1">
                {dep.staff.map((member, idx) => (
                  <li key={idx}>{member}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* System Leaders */}
      <div className="bg-gray-100 rounded-xl p-6 shadow-inner">
        <h2 className="text-2xl font-semibold mb-2">Αρχηγός & Υπαρχηγοί Συστήματος</h2>
        <ul className="list-disc list-inside text-gray-700 mt-1">
          <li className="text-gray-800 mb-1">{systemLeaders.chief}</li>
          <li className="text-gray-800">{systemLeaders.deputies.join(", ")}</li>
        </ul>
      </div>
    </div>
  );
}
