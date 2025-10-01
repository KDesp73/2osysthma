import { LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

interface LinkCardProps {
  name: string;
  description: string;
  href: string;
}

export default function LinkCard({ name, description, href }: LinkCardProps) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-green-600" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">{description}</p>
        <Link href={href} target="_blank">
          <Button variant="outline" className="flex items-center gap-2 w-full">
            Open Link
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
