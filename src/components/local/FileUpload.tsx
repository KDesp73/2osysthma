"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { X } from "lucide-react";

interface PendingFile {
  file: File;
  name: string;
  description: string;
}

export default function FileUpload() {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        name: file.name,
        description: "",
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }

  function updateFile(index: number, field: "name" | "description", value: string) {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Convert file to base64 string
  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const uint8 = new Uint8Array(reader.result as ArrayBuffer);
        resolve(Buffer.from(uint8).toString("base64"));
      };
      reader.onerror = (err) => reject(err);
    });

  async function uploadFiles() {
    if (!files.length) return;
    setUploading(true);

    try {
      const filesData = await Promise.all(
        files.map(async (f) => ({
          type: "file",
          name: f.file.name,
          title: f.name,
          description: f.description,
          data: await fileToBase64(f.file),
        }))
      );

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: filesData }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");

      alert("Upload successful!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <input
            type="file"
            multiple
            className="block w-full text-sm"
            onChange={handleFileChange}
          />

          {/* List of added files with name & description */}
          {files.length > 0 && (
            <div className="space-y-4">
              {files.map((f, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-muted/30 p-4 space-y-3 relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filename</label>
                    <p>{f.file.name}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={f.name}
                      onChange={(e) =>
                        updateFile(index, "name", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={f.description}
                      onChange={(e) =>
                        updateFile(index, "description", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
