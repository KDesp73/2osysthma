"use client";

import Image from "next/image";
import { useState } from "react";
import Title from "./Title";
import EmptyState from "./EmptyState";

interface MetadataImage {
  path: string;
  index: number;
}

interface MetadataFolder {
  name: string;
  date: string;
  images: MetadataImage[];
}

interface Props {
  collections: MetadataFolder[];
}

export default function Gallery({ collections }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const hasImages = collections.some((folder) => folder.images.length > 0);

  if (!hasImages) {
    return (
      <>
        <Title name="Gallery" />
        <EmptyState
          title="No images available"
          description="There are currently no images to display."
        />
      </>
    );
  }

  // sort by date (newest first)
  const sortedCollections = [...collections].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <>
      <Title name="Gallery" />
<<<<<<< Updated upstream
      {folders.map(({ folder, displayName, images }) => (
        <section key={folder} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{displayName}</h2>
=======
      {sortedCollections.map(({ name, date, images }) => (
        <section key={name + date} className="mb-12">
          <h2 className="text-2xl font-semibold mb-1">{name}</h2>
          <p className="text-sm text-gray-500 mb-4">{date}</p>
>>>>>>> Stashed changes
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images
              .sort((a, b) => a.index - b.index) // optional: ensure correct order inside each folder
              .map((img) => (
                <div
                  key={img.index}
                  className="overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => setSelectedImage(`/content/images${img.path}`)}
                >
                  <Image
                    src={`/content/images${img.path}`}
                    alt={`${name} - ${img.index}`}
                    width={500}
                    height={500}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
          </div>
        </section>
      ))}

      {/* Modal / Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <Image
            src={selectedImage}
            alt="Expanded Image"
            width={1200}
            height={1200}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </>
  );
}
