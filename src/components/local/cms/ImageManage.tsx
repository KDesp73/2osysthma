"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ImageUploadPreview } from "./ImageManager";
import { useConfirm } from "../ConfirmContext";

interface ImageManageProps {
  collections: string[];
  images: ImageUploadPreview[];
  isSaving: boolean;
  handleDelete: (id: string) => void;
  handleSaveChanges: () => Promise<void>;
  handleDeleteCollection: (collectionName: string) => void;
}

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
  handleDeleteCollection,
}: ImageManageProps) {
  const confirm = useConfirm();
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  const filteredImages = selectedCollection
    ? images.filter((img) => img.collection === selectedCollection)
    : images;

  const confirmCollectionDelete = async (collectionName: string) => {
    if (
      await confirm({
        title: "Delete entire collection?",
        message: `Are you sure you want to delete the ENTIRE collection "${collectionName}"?\n\nThis will delete all ${images.filter((img) => img.collection === collectionName).length} images in this collection upon saving changes.`,
        confirmText: "Delete",
        cancelText: "Cancel",
      })
    ) {
      handleDeleteCollection(collectionName);
      setSelectedCollection("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Manage Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Delete Collection */}
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-destructive">
              Permanently Delete Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Select
                value={selectedCollection}
                onValueChange={setSelectedCollection}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select collection..." />
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
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">
            Images ({filteredImages.length})
          </h3>

          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((img) => (
                <Card key={img.id} className="overflow-hidden shadow-sm">
                  <img
                    src={getImagePath(img)}
                    alt={img.name}
                    className="object-cover w-full h-32"
                  />
                  <CardContent className="space-y-1 p-3 text-center">
                    <p className="text-sm font-medium truncate">{img.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {img.collection}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(img.id)}
                      className="w-full"
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">
              {selectedCollection
                ? `No images found in "${selectedCollection}".`
                : "No images available to manage."}
            </p>
          )}
        </div>

        {/* Save Button */}
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
