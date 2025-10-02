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

// Interfaces
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
  id: string; // FIX: Stable unique ID for dnd (set to path on load)
  file?: File;
  preview: string;
  name: string;
  collection: string;
  isNew?: boolean;
  // Fields to track original state for diffing
  originalPath: string;
  originalCollection: string;
  isDeleted?: boolean; // Track deletions locally
}

export default function ImageManager() {
  const [collections, setCollections] = useState<string[]>([]);
  // Store the current state (modified)
  const [images, setImages] = useState<ImageUploadPreview[]>([]);
  // Store the original state (for calculating diffs/moves)
  const [originalImages, setOriginalImages] = useState<ImageUploadPreview[]>(
    [],
  );
  const [isSaving, setIsSaving] = useState(false);

  // Upload tab state
  const [uploading, setUploading] = useState(false);
  const [uploadImages, setUploadImages] = useState<ImageUploadPreview[]>([]);
  const [collection, setCollection] = useState<string>("");
  const [newCollection, setNewCollection] = useState<string>("");

  // Load collections + existing images
  useEffect(() => {
    (async () => {
      try {
        const metaRes = await fetch("/content/images/metadata.json");
        const data: MetadataFolder[] = await metaRes.json();

        setCollections(data.map((f) => f.name));

        const existing: ImageUploadPreview[] = data.flatMap((folder) =>
          folder.images.map((img) => {
            const fileName = img.path.split("/").pop() || "";
            return {
              id: img.path, // Use path as stable ID
              preview: img.path,
              name: fileName,
              collection: folder.name,
              originalPath: img.path,
              originalCollection: folder.name,
            };
          }),
        );

        // IMPORTANT: Set both states
        setImages(existing);
        setOriginalImages(existing);
      } catch (e) {
        console.error("Failed to load metadata:", e);
      }
    })();
  }, []);

  // ============= Upload Handlers  =============
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files).map((file) => ({
      id: file.name + Date.now(), // Generate temporary stable ID
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      collection: collection || newCollection,
      isNew: true,
      originalPath: "", // New files don't have an original path
      originalCollection: "",
    }));

    setUploadImages((prev) => [...prev, ...filesArray]);
  };

  const handleUpload = async () => {
    if (!uploadImages.length) return;
    setUploading(true);

    let finalCollection = newCollection || collection;
    if (!finalCollection) {
      alert("Please select or create a collection");
      setUploading(false);
      return;
    }

    try {
      const filesData = await Promise.all(
        uploadImages.map(async (img) => {
          // Base64 encoding logic is correct for sending to API
          const arrayBuffer = await img.file!.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          const binary = Array.from(uint8, (b) => String.fromCharCode(b)).join(
            "",
          );
          const base64 = btoa(binary);

          return {
            type: "image",
            name: img.file!.name.replace(/\s+/g, "_"), // Sanitize filename
            collection: finalCollection,
            data: base64,
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

      // Clear and refresh states
      setUploadImages([]);
      if (newCollection && !collections.includes(newCollection)) {
        setCollections((prev) => [...prev, newCollection]);
      }
      setNewCollection("");
      setCollection("");

      // Simple page reload is best here to fully resync images/metadata
      // For a complex app, you'd integrate the new uploads into the `images` state
      window.location.reload();
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
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

  const handleDelete = (id: string) => {
    // Mark as deleted, but keep in state until saved to calculate diff
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, isDeleted: true } : img)),
    );
  };

  const handleRename = (id: string, newName: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, name: newName.replace(/\s+/g, "_") } : img,
      ),
    );
  };

  const handleCollectionChange = (id: string, val: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, collection: val } : img)),
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);

    // 1. Filter out permanently deleted images (i.e., new files that were staged then deleted)
    const currentActiveImages = images.filter(
      (img) => !img.isDeleted && !img.isNew,
    );

    // 2. Identify all required actions (Delete, Rename/Move/Reorder)
    const actions: Array<{
      type: string;
      path?: string;
      oldPath?: string;
      newPath?: string;
    }> = [];
    const currentImagePaths = new Set(
      currentActiveImages.map((img) => img.originalPath),
    );

    // A. Deletions: Images present in original state but not in current active state
    originalImages.forEach((original) => {
      const isStillPresent = images.some(
        (img) => img.id === original.id && !img.isDeleted,
      );
      if (!isStillPresent) {
        actions.push({
          type: "delete",
          path: original.originalPath.replace(
            "/content/images/",
            "public/content/images/",
          ),
        });
      }
    });

    // B. Moves/Renames: Images still present but with changed path or collection
    currentActiveImages.forEach((current, index) => {
      const original = originalImages.find((img) => img.id === current.id);

      // This should only run for existing images, not new uploads
      if (!original) return;

      const newRemotePath = `public/content/images/${current.collection}/${current.name}`;
      const oldRemotePath = original.originalPath.replace(
        "/content/images/",
        "public/content/images/",
      );

      // Check for path change (rename or move collection)
      if (oldRemotePath !== newRemotePath) {
        actions.push({
          type: "move",
          oldPath: oldRemotePath,
          newPath: newRemotePath,
        });
      }

      // Reordering is implicit and handled by rebuilding the metadata.json based on the final order
    });

    // C. Reorder/Metadata Update: Always send the final list to rebuild metadata.json
    const newMetadata = currentActiveImages.map((img) => ({
      // Use the final path, whether original or new/moved
      path: img.preview.startsWith("http")
        ? img.preview.replace("/content/images", "")
        : `/content/images/${img.collection}/${img.name}`,
      collection: img.collection,
    }));

    if (
      actions.length === 0 &&
      newMetadata.every(
        (item, i) => item.path === originalImages[i]?.originalPath,
      )
    ) {
      alert("No changes detected.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/edit-images", {
        // NEW dedicated endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actions, newMetadata }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      alert("Changes saved! Refreshing...");
      window.location.reload(); // Full refresh to sync state
    } catch (err) {
      alert("Save failed: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // ============= Render =============
  const activeImages = images.filter((img) => !img.isDeleted);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="manage">
            Manage ({activeImages.length})
          </TabsTrigger>
        </TabsList>

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
              {activeImages.length > 0 ? (
                <DragDropContext onDragEnd={handleReorder}>
                  <Droppable droppableId="images" direction="horizontal">
                    {(provided) => (
                      <div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {activeImages.map((img, i) => (
                          // FIX: Use stable ID for key and draggableId
                          <Draggable
                            key={img.id}
                            draggableId={img.id}
                            index={i}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="overflow-hidden space-y-2 p-2"
                              >
                                <img
                                  // Use the static path here, preview is just the URL.
                                  src={
                                    img.preview.startsWith("http")
                                      ? img.preview
                                      : `/content/images/${img.collection.replace(/\s+/g, "-")}/${img.name}`
                                  }
                                  alt={img.name}
                                  className="object-cover w-full h-32"
                                />
                                <Input
                                  value={img.name}
                                  onChange={(e) =>
                                    handleRename(img.id, e.target.value)
                                  }
                                  className="text-sm"
                                />
                                <Select
                                  value={img.collection}
                                  onValueChange={(val) =>
                                    handleCollectionChange(img.id, val)
                                  }
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
                                  onClick={() => handleDelete(img.id)}
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

              <Button
                onClick={handleSaveChanges}
                className="w-full"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
