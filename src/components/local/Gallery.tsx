"use client";

import Image from "next/image";
import { useState } from "react";
import { FolderImages } from "@/lib/images";

interface Props {
  folders: FolderImages[];
}

export default function Gallery({ folders }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Gallery</h1>

      {folders.map(({ folder, displayName, images }) => (
        <section key={folder} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{displayName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img}
                className="overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedImage(`/content/images/${folder}/${img}`)}
              >
                <Image
                  src={`/content/images/${folder}/${img}`}
                  alt={img}
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
    </main>
  );
}
