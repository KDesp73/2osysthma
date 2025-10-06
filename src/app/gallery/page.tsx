"use client";

import { useEffect, useState } from "react";
import Gallery from "@/components/local/Gallery";

interface MetadataImage {
  path: string;
  index: number;
}

interface MetadataFolder {
  name: string;
  date: string;
  images: MetadataImage[];
}

export default function GalleryPage() {
  const [collections, setCollections] = useState<MetadataFolder[]>([]);

  useEffect(() => {
    fetch("/content/images/metadata.json")
      .then((res) => res.json())
      .then((data: MetadataFolder[]) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setCollections(sorted);
      })
      .catch((err) => console.error("Failed to load metadata.json", err));
  }, []);

  return <Gallery collections={collections} />;
}
