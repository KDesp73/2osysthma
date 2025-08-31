"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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

    if (newCollection) {
      const datePrefix = new Date().toISOString().split("T")[0];
      finalCollection = `${datePrefix}-${newCollection}`;
    }

    try {
      const filesData = await Promise.all(
        images.map(async (img) => {
          const arrayBuffer = await img.file.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          const base64 = Buffer.from(uint8).toString("base64");
          return {
            type: "image",
            name: `${finalCollection}/${img.file.name}`,
            data: base64,
          };
        })
      );

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: filesData }),
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Collection Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="collection">Choose collection</Label>
              <Select value={collection} onValueChange={(val) => setCollection(val)}>
                <SelectTrigger id="collection">
                  <SelectValue placeholder="-- Select existing collection --" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((c) => {
                    const displayName = c.includes("-") ? c.split("-").slice(3).join("-") : c;
                    return (
                      <SelectItem key={c} value={c}>
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="new-collection">Or create new collection</Label>
              <Input
                id="new-collection"
                type="text"
                placeholder="New collection name"
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
              />
            </div>
          </div>

          {/* File input */}
          <div>
            <Label htmlFor="file-upload">Select images</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
            />
          </div>

          {/* Preview images */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {images.map((img, i) => (
                <Card key={i} className="overflow-hidden">
                  <img src={img.preview} alt={img.file.name} className="object-cover w-full h-32" />
                  <p className="text-sm text-center p-2 truncate">{img.file.name}</p>
                </Card>
              ))}
            </div>
          )}

          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload Images"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
