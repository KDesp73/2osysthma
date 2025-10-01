"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface MetadataImage {
  path: string;
  index: number;
}

interface MetadataFolder {
  name: string;
  date: string;
  images: MetadataImage[];
}

interface ImageUploadPreview {
  file?: File; // optional, if editing existing image no file
  preview: string;
  name: string;
  collection: string;
  isNew?: boolean;
}

export default function ImageManager() {
  const [collections, setCollections] = useState<string[]>([]);
  const [images, setImages] = useState<ImageUploadPreview[]>([]);

  // Upload tab state
  const [uploading, setUploading] = useState(false);
  const [uploadImages, setUploadImages] = useState<ImageUploadPreview[]>([]);
  const [collection, setCollection] = useState<string>("");
  const [newCollection, setNewCollection] = useState<string>("");

  // Load collections + existing images
  useEffect(() => {
    (async () => {
      const metaRes = await fetch("/content/images/metadata.json");
      const data: MetadataFolder[] = await metaRes.json();
      setCollections(data.map((f) => f.name));

      const existing: ImageUploadPreview[] = data.flatMap((folder) =>
        folder.images.map((img) => ({
          preview: img.path,
          name: img.path.split("/").pop() || "",
          collection: folder.name,
        })),
      );

      setImages(existing);
    })();
  }, []);

  // ============= Upload Handlers =============
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      collection: collection || newCollection || "",
      isNew: true,
    }));

    setUploadImages((prev) => [...prev, ...filesArray]);
  };

  const handleUpload = async () => {
    if (!uploadImages.length) return;
    setUploading(true);

    let finalCollection = newCollection || collection;
    if (newCollection) {
      const datePrefix = new Date().toISOString().split("T")[0];
      finalCollection = `${datePrefix}-${newCollection}`;
    }

    if (!finalCollection) {
      alert("Please select or create a collection");
      setUploading(false);
      return;
    }

    try {
      const filesData = await Promise.all(
        uploadImages.map(async (img) => {
          const targetCollection = img.collection || finalCollection;
          const arrayBuffer = await img.file!.arrayBuffer();
          return {
            type: "image",
            name: img.name,
            collection: targetCollection,
            data: arrayBuffer,
          };
        }),
      );

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: filesData }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      alert("Upload successful!");
      setUploadImages([]);
      setNewCollection("");
      setCollection("");
    } catch (err) {
      alert("Upload failed: " + err);
    } finally {
      setUploading(false);
    }
  };

  // ============= Manage Handlers =============
  const handleReorder = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setImages(reordered);
  };

  const handleDelete = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRename = (idx: number, newName: string) => {
    setImages((prev) =>
      prev.map((img, i) =>
        i === idx ? { ...img, name: newName.replace(/\s+/g, "_") } : img,
      ),
    );
  };

  const handleSaveChanges = async () => {
    try {
      const edits = images.map((img) => ({
        type: "move",
        from: img.preview.replace("/content/images", ""),
        to: `${img.collection}/${img.name}`,
      }));

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: edits }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      alert("Changes saved!");
    } catch (err) {
      alert("Save failed: " + err);
    }
  };

  // ============= Render =============
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Upload Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="collection">Choose collection</Label>
                  <Select
                    value={collection}
                    onValueChange={(val) => setCollection(val)}
                  >
                    <SelectTrigger id="collection">
                      <SelectValue placeholder="-- Select existing collection --" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="new-collection">
                    Or create new collection
                  </Label>
                  <Input
                    id="new-collection"
                    type="text"
                    placeholder="New collection name"
                    value={newCollection}
                    onChange={(e) => setNewCollection(e.target.value)}
                  />
                </div>
              </div>

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

              {uploadImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadImages.map((img, i) => (
                    <Card key={i} className="overflow-hidden">
                      <img
                        src={img.preview}
                        alt={img.name}
                        className="object-cover w-full h-32"
                      />
                      <p className="text-sm text-center p-2 truncate">
                        {img.name}
                      </p>
                    </Card>
                  ))}
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Upload Images"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Manage Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {images.length > 0 ? (
                <DragDropContext onDragEnd={handleReorder}>
                  <Droppable droppableId="images" direction="horizontal">
                    {(provided) => (
                      <div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {images.map((img, i) => (
                          <Draggable key={i} draggableId={String(i)} index={i}>
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="overflow-hidden space-y-2 p-2"
                              >
                                <img
                                  src={img.preview}
                                  alt={img.name}
                                  className="object-cover w-full h-32"
                                />
                                <Input
                                  value={img.name}
                                  onChange={(e) =>
                                    handleRename(i, e.target.value)
                                  }
                                  className="text-sm"
                                />
                                <Select
                                  value={img.collection}
                                  onValueChange={(val) => {
                                    setImages((prev) =>
                                      prev.map((p, idx) =>
                                        idx === i
                                          ? { ...p, collection: val }
                                          : p,
                                      ),
                                    );
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Collection" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {collections.map((c) => (
                                      <SelectItem key={c} value={c}>
                                        {c}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(i)}
                                >
                                  Delete
                                </Button>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <p className="text-gray-500 text-center">
                  No images found in metadata.json
                </p>
              )}

              <Button onClick={handleSaveChanges} className="w-full">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
