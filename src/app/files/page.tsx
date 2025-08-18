import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { File, Download } from "lucide-react"
import Link from "next/link"
import Title from "@/components/local/Title"

const files = [
  {
    name: "Ατομικό Δελτίο Υγείας",
    description: "",
    href: "/content/files/deltio-ygeias.pdf",
  },
  {
    name: "Guidelines",
    description: "Documentation and usage guidelines.",
    href: "/files/guidelines.docx",
  },
  {
    name: "Presentation Slides",
    description: "Slides from the last team meeting.",
    href: "/files/presentation.pptx",
  },
]

export default function FilesPage() {
  return (
    <>
      <Title name="Χρήσιμα Αρχεία" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </>
  )
}

