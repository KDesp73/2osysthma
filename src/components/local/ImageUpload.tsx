"use client";

import { useEffect, useState } from "react";

interface ImageUploadPreview {
  file: File;
  preview: string;
}

export default function ImageUpload() {
  const [images, setImages] = useState<ImageUploadPreview[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [collection, setCollection] = useState<string>("");
  const [newCollection, setNewCollection] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // fetch collections from API
    fetch("/api/admin/collections")
      .then((res) => res.json())
      .then((data) => setCollections(data.collections || []));
  }, []);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...filesArray]);
  };

    const handleUpload = async () => {
      if (!images.length) return;
      setUploading(true);

      let finalCollection = newCollection || collection;
      if (!finalCollection) {
        alert("Please select or create a collection");
        setUploading(false);
        return;
      }

      // Prepend date if creating a new collection
      if (newCollection) {
        const datePrefix = new Date().toISOString().split("T")[0]; // e.g., "2025-08-27"
        finalCollection = `${datePrefix}-${newCollection}`;
      }

      try {
        const filesData = await Promise.all(
          images.map(async (img) => {
            const arrayBuffer = await img.file.arrayBuffer();
            const uint8 = new Uint8Array(arrayBuffer);
            const base64 = Buffer.from(uint8).toString("base64");
            return {
              name: `${finalCollection}/${img.file.name}`,
              data: base64,
            };
          })
        );

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: filesData }),
        });

        if (!res.ok) throw new Error("Upload failed");

        alert("Upload successful!");
        setImages([]);
        setNewCollection("");
        setCollection("");
      } catch (err) {
        console.error(err);
        alert("Upload failed");
      } finally {
        setUploading(false);
      }
    };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Images</h1>

      {/* Collection selection */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Choose collection</label>
        <select
          className="border rounded p-2 w-full mb-2"
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
        >
          <option value="">-- Select existing collection --</option>
          {collections.map((c) => {
            const displayName = c.includes("-") ? c.split("-").slice(3).join("-") : c;
            return (
              <option key={c} value={c}>
                {displayName}
              </option>
            );
          })}
        </select>

        <label className="block font-semibold mb-2">Or create new collection</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          placeholder="New collection name"
          value={newCollection}
          onChange={(e) => setNewCollection(e.target.value)}
        />
      </div>

      {/* File input */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Select images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFilesChange}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* Preview images */}
      {images.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div key={i} className="border rounded overflow-hidden">
              <img src={img.preview} alt={img.file.name} className="object-cover w-full h-32" />
              <p className="text-sm text-center p-1 truncate">{img.file.name}</p>
            </div>
          ))}
        </div>
      )}

      <button
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

