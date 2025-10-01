import { Download, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

interface FileCardProps {
  name: string;
  description: string;
  href: string;
}

export default function FileCard({ name, description, href }: FileCardProps) {
  return (
    <Card key={href} className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5 text-blue-600" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">{description}</p>
        <Link href={href} target="_blank">
          <Button variant="outline" className="flex items-center gap-2 w-full">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// TODO: Merge FileCard with LinkCard
