"use client";

import { useEffect, useState } from "react";
import Title from "@/components/local/Title";
import LinkCard from "@/components/local/LinkCard";
import FileCard from "@/components/local/FileCard";

const links = [
  {
    name: "Σώμα Ελλήνων Προσκόπων",
    description: "Η επίσημη ιστοσελίδα του Σώματος Ελλήνων Προσκόπων",
    href: "https://www.sep.org.gr/el/normal/home",
  },
  {
    name: "Προσκοπικό Πρατήριο",
    description:
      "Tο ηλεκτρονικό κατάστημα του Προσκοπικού Πρατηρίου του Σώματος Ελλήνων Προσκόπων",
    href: "https://www.scout-shop.gr/",
  },
<<<<<<< Updated upstream
=======
  {
    name: "Στοιχεία Περιπέτειας",
    description: "To Eγκόλπιο του Προσκόπου",
    href: "https://scout-adventure.gr",
  },
>>>>>>> Stashed changes
];

export default function FilesPage() {
  const [files, setFiles] = useState<
    { name: string; description: string; href: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/files")
      .then((res) => res.json())
      .then((data) => setFiles(data.files || []));
  }, []);

  return (
    <>
      <Title name="Αρχεία" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {files.map((file) => (
          <FileCard key={file.href} {...file} />
        ))}
      </div>

      <Title name="Σύνδεσμοι" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((linkItem) => (
          <LinkCard key={linkItem.href} {...linkItem} />
        ))}
      </div>
    </>
  );
}
