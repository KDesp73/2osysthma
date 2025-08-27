"use client";

import { useState } from "react";

interface UsefulFile {
  file: File | null;
  name: string;        // user-defined title
  description: string;
}

export default function UsefulFileUpload() {
  const [files, setFiles] = useState<UsefulFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Add a new empty file entry
  const addFileEntry = () => {
    setFiles((prev) => [...prev, { file: null, name: "", description: "" }]);
  };

  // Handle file selection
  const handleFileChange = (index: number, file: File | null) => {
    setFiles((prev) => {
      const copy = [...prev];
      copy[index].file = file;
      // Pre-fill the title with the original filename if empty
      if (file && !copy[index].name) copy[index].name = file.name;
      return copy;
    });
  };

  // Handle title editing
  const handleNameChange = (index: number, value: string) => {
    setFiles((prev) => {
      const copy = [...prev];
      copy[index].name = value;
      return copy;
    });
  };

  // Handle description editing
  const handleDescriptionChange = (index: number, value: string) => {
    setFiles((prev) => {
      const copy = [...prev];
      copy[index].description = value;
      return copy;
    });
  };

  // Handle upload
  const handleUpload = async () => {
    const validFiles = files.filter((f) => f.file);
    if (!validFiles.length) return;
    setUploading(true);

    try {
      const filesData = await Promise.all(
        validFiles.map(async (f) => {
          const arrayBuffer = await f.file!.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          const base64 = Buffer.from(uint8).toString("base64");
          return {
            name: f.file!.name,  // original filename
            title: f.name,       // user-defined title
            description: f.description,
            data: base64,
          };
        })
      );

      const res = await fetch("/api/admin/upload-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filesData }),
      });

      if (!res.ok) throw new Error("Upload failed");

      alert("Upload successful!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Useful Files</h1>

      {/* Dynamic file entries */}
      <div className="mb-6 space-y-4">
        {files.map((f, i) => (
          <div key={i} className="border rounded p-2">
            <input
              type="text"
              placeholder="Title"
              className="border rounded p-1 w-full mb-1"
              value={f.name}
              onChange={(e) => handleNameChange(i, e.target.value)}
            />
            <textarea
              placeholder="Description"
              className="border rounded p-1 w-full mb-2"
              value={f.description}
              onChange={(e) => handleDescriptionChange(i, e.target.value)}
            />
            <input
              type="file"
              onChange={(e) =>
                handleFileChange(i, e.target.files ? e.target.files[0] : null)
              }
              className="border rounded p-2 w-full"
            />
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-2">
        <button
          className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600 transition"
          onClick={addFileEntry}
        >
          Add File
        </button>
      </div>

      <button
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Files"}
      </button>
    </div>
  );
}
