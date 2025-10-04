import FileCard from "@/components/local/FileCard";
import LinkCard from "@/components/local/LinkCard";

interface ResourceItem {
  name: string;
  description: string;
  href: string;
}

export default function DashboardUseful() {
  const links: ResourceItem[] = [
    {
      name: "2η Αγέλη",
      description: "Google Drive",
      href: "https://drive.google.com/drive/u/2/folders/1iEOhUoxajRh0Ghv_Jz36p0jbs0Sv2Yw4",
    },
    {
      name: "Ονομαστική Κατάσταση Συστήματος",
      description: "",
      href: "https://docs.google.com/spreadsheets/d/1NafMecUgSjX426n4YWxJXKmGbzJQnOcUj855VFdxnaE/edit?gid=0#gid=0",
    },
    {
      name: "Φωτογραφίες Συστήματος",
      description: "",
      href: "https://drive.google.com/drive/folders/18qYat54ML9BHkgOKldZ6coskDTBX1vBs",
    },
    {
      name: "e-sep",
      description:
        "Σύστημα Διαχείρισης Ηλεκτρονικών Υπηρεσιών του Σώματος Ελλήνων Προσκόπων",
      href: "https://e-sep.eu/app/sso/web/",
    },
{
  name: "Νέο Πρόγραμμα",
  description: "Drive με αρχεία για το νέο πρόγραμμα",
  href: "https://drive.google.com/drive/folders/167Wwxl-t-fZGH6EsIExfq0fT5t5pAUDU"
}
  ];

  const files: ResourceItem[] = [];

  return (
    <div className="max-w-3xl mx-auto space-y-10 px-4">
      <section>
        <h2 className="text-xl font-semibold mb-4">Αρχεία</h2>
        {files.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {files.map((file) => (
              <FileCard key={file.href} {...file} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Δεν υπάρχουν διαθέσιμα αρχεία.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Σύνδεσμοι</h2>
        {links.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {links.map((link) => (
              <LinkCard key={link.href} {...link} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Δεν υπάρχουν σύνδεσμοι.</p>
        )}
      </section>
    </div>
  );
}
