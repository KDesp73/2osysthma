import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { File, Link as LinkIcon, Download } from "lucide-react"
import Link from "next/link"
import Title from "@/components/local/Title"

const files = [
  {
    name: "Ατομικό Δελτίο Υγείας",
    description: "TODO",
    href: "/content/files/deltio-ygeias.pdf",
  },
]

const links = [
  {
    name: "Σώμα Ελλήνων Προσκόπων",
    description: "Η επίσημη ιστοσελίδα του Σώματος Ελλήνων Προσκόπων",
    href: "https://www.sep.org.gr/el/normal/home",
  },
  {
    name: "Προσκοπικό Πρατήριο",
    description: "Tο ηλεκτρονικό κατάστημα του Προσκοπικού Πρατηρίου του Σώματος Ελλήνων Προσκόπων",
    href: "https://www.scout-shop.gr/",
  },
]

export default function FilesPage() {
  return (
    <>
      <Title name="Αρχεία" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {files.map((file) => (
          <Card key={file.href} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5 text-blue-600" />
                {file.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">{file.description}</p>
              <Link href={file.href} target="_blank">
                <Button variant="outline" className="flex items-center gap-2 w-full">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Title name="Σύνδεσμοι" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((linkItem) => (
          <Card key={linkItem.href} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-green-600" />
                {linkItem.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">{linkItem.description}</p>
              <Link href={linkItem.href} target="_blank">
                <Button variant="outline" className="flex items-center gap-2 w-full">
                  Open Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
