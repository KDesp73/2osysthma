"use client";

import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import FileUpload from "./FileUpload";
import FileManage from "./FileManage";

// --- Core Interfaces ---
export interface FileMetadata {
  filename: string;
  title: string;
  description: string;
}
// ------------------------

export default function FileManager() {
  const [initialFiles, setInitialFiles] = useState<FileMetadata[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load metadata on mount
  useEffect(() => {
    (async () => {
      try {
        const metaRes = await fetch("/content/files/metadata.json");
        const data: FileMetadata[] = await metaRes.json();
        setInitialFiles(data);
      } catch (e) {
        console.error("Failed to load metadata:", e);
        setInitialFiles([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Save handler
  const handleSaveMetadata = async (
    newMetadata: FileMetadata[],
    pathsToDelete: string[],
  ) => {
    setIsSaving(true);

    const actions = pathsToDelete.map((filename) => ({
      type: "delete",
      path: `public/content/files/${filename}`,
    }));

    const newFileMetadata = newMetadata.map((file, index) => ({
      ...file,
      index,
      path: `/content/files/${file.filename}`,
    }));

    try {
      const res = await fetch("/api/admin/edit-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actions, newMetadata: newFileMetadata }),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Unknown error");
      window.location.reload();
    } catch (err) {
      console.error("Save failed:", (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading Files...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted p-1">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="manage">
            Manage ({initialFiles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <FileUpload />
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <FileManage
            initialFiles={initialFiles}
            isSaving={isSaving}
            onSave={handleSaveMetadata}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
