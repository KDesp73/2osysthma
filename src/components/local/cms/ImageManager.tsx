"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropResult } from "@hello-pangea/dnd";
import ImageUpload from "./ImageUpload";
import ImageManage from "./ImageManage";

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

export interface ImageUploadPreview {
  id: string;
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

  // ============= Upload Handlers =============
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files).map((file) => ({
      id: file.name + Date.now(), // Generate temporary stable ID
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      collection: collection || newCollection,
      isNew: true,
      originalPath: "",
      originalCollection: "",
    })) as ImageUploadPreview[];

    setUploadImages((prev) => [...prev, ...filesArray]);
  };

  const handleUpload = async () => {
    if (!uploadImages.length) return;
    setUploading(true);

    let finalCollection = newCollection || collection;
    if (!finalCollection) {
      console.error("Please select or create a collection");
      setUploading(false);
      return;
    }

    try {
      const filesData = await Promise.all(
        uploadImages.map(async (img) => {
          const arrayBuffer = await img.file!.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          const binary = Array.from(uint8, (b) => String.fromCharCode(b)).join(
            "",
          );
          const base64 = btoa(binary);

          return {
            type: "image",
            name: img.file!.name.replace(/\s+/g, "_"),
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

      console.log("Upload successful! Refreshing...");

      window.location.reload();
    } catch (err) {
      console.error("Upload failed: " + (err as Error).message);
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

  /**
   * Marks an individual image for deletion by setting the isDeleted flag.
   * @param id The stable ID (original path) of the image.
   */
  const handleDelete = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, isDeleted: true } : img)),
    );
  };

  /**
   * Marks all images within a specified collection for deletion and removes the collection name.
   * @param collectionName The name of the collection to delete.
   */
  const handleDeleteCollection = (collectionName: string) => {
    // 1. Update images: Mark all images belonging to the collection as deleted
    setImages((prev) =>
      prev.map((img) =>
        img.collection === collectionName ? { ...img, isDeleted: true } : img,
      ),
    );
    // 2. Update collections: Remove the collection name from the list
    setCollections((prev) => prev.filter((c) => c !== collectionName));
  };

  // Note: handleRename and handleCollectionChange are retained but their effect
  // on 'actions' is removed from handleSaveChanges as per user request (no moves/renames).
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

    // Exclude deleted and new images from the final active list
    const currentActiveImages = images.filter(
      (img) => !img.isDeleted && !img.isNew,
    );
    const actions: Array<{
      type: string;
      path?: string;
    }> = [];

    // A. Deletions: Build delete actions for images no longer present
    originalImages.forEach((original) => {
      const isStillPresent = images.some(
        (img) => img.id === original.id && !img.isDeleted,
      );
      if (!isStillPresent) {
        const remotePath = original.originalPath.replace(
          "/content/images/",
          "public/content/images/",
        );

        // Add the delete action to the array
        actions.push({
          type: "delete",
          path: remotePath,
        });
      }
    });

    // B. Moves/Renames logic removed as per user request.

    // C. Final Metadata for Reorder/Updates
    const newMetadata = currentActiveImages.map((img, index) => ({
      path: `/content/images/${img.collection}/${img.name}`,
      collection: img.collection,
      index: index,
    }));

    // --- CONSOLIDATED API CALL ---
    // Pass ALL actions (now only delete) and metadata to the edit-images endpoint.
    try {
      const res = await fetch("/api/admin/edit-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass the full actions array
        body: JSON.stringify({ actions: actions, newMetadata }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      console.log("Changes saved! Refreshing...");
      window.location.reload();
    } catch (err) {
      console.error("Save failed:", (err as Error).message);
      console.warn(
        "If this error relates to GitHub, ensure the required access is configured for the API route.",
      );
    } finally {
      setIsSaving(false);
    }
  };

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
          <ImageUpload
            collections={collections}
            collection={collection}
            setCollection={setCollection}
            newCollection={newCollection}
            setNewCollection={setNewCollection}
            uploadImages={uploadImages}
            handleFilesChange={handleFilesChange}
            handleUpload={handleUpload}
            uploading={uploading}
          />
        </TabsContent>

        <TabsContent value="manage">
          <ImageManage
            collections={collections}
            images={activeImages}
            isSaving={isSaving}
            handleDelete={handleDelete}
            handleDeleteCollection={handleDeleteCollection}
            handleSaveChanges={handleSaveChanges}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
