"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Re-import Input for the collection filter
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Re-import Select
import { Label } from "@/components/ui/label";
import { useState } from "react";

import { ImageUploadPreview } from "./ImageManager"; // Import the shared interface

interface ImageManageProps {
  collections: string[];
  images: ImageUploadPreview[];
  isSaving: boolean;
  handleDelete: (id: string) => void;
  handleSaveChanges: () => Promise<void>;
  handleDeleteCollection: (collectionName: string) => void;
}

// Helper to construct the image path for display (remains the same)
const getImagePath = (img: ImageUploadPreview): string => {
  if (img.preview.startsWith("blob:")) return img.preview;
  return `/content/images/${img.collection.replace(/\s+/g, "-")}/${img.name}`;
};

export default function ImageManage({
  collections,
  images,
  isSaving,
  handleDelete,
  handleSaveChanges,
  handleDeleteCollection, // New prop
}: ImageManageProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  // Filter images based on the selected collection
  const filteredImages = selectedCollection
    ? images.filter((img) => img.collection === selectedCollection)
    : images;

  const confirmCollectionDelete = (collectionName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the ENTIRE collection "${collectionName}"?\n\nThis will delete all ${images.filter((img) => img.collection === collectionName).length} images in this collection upon saving changes.`,
      )
    ) {
      handleDeleteCollection(collectionName);
      setSelectedCollection(""); // Clear selection after deletion
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Manage Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Collection Deletion UI */}
        <div className="space-y-2 border p-4 rounded-lg bg-red-50/50">
          <Label
            htmlFor="collection-delete"
            className="text-lg font-semibold text-red-700"
          >
            Permanently Delete Collection
          </Label>
          <div className="flex space-x-2">
            <Select
              value={selectedCollection}
              onValueChange={setSelectedCollection}
            >
              <SelectTrigger id="collection-delete" className="flex-1">
                <SelectValue placeholder="-- Select collection to delete --" />
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
              onClick={() => confirmCollectionDelete(selectedCollection)}
              disabled={!selectedCollection || isSaving}
            >
              Delete Collection
            </Button>
          </div>
        </div>

        <h3 className="text-xl font-semibold">
          Image List ({filteredImages.length})
        </h3>

        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img) => (
              <Card key={img.id} className="overflow-hidden space-y-2 p-2">
                <img
                  src={getImagePath(img)}
                  alt={img.name}
                  className="object-cover w-full h-32"
                />

                <p className="text-sm font-medium text-center truncate">
                  {img.name}
                </p>
                <p className="text-xs text-gray-500 text-center">
                  ({img.collection})
                </p>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(img.id)}
                  className="w-full"
                >
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            {selectedCollection
              ? `No images found in the selected collection: ${selectedCollection}`
              : "No images found to manage."}
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
  );
}
