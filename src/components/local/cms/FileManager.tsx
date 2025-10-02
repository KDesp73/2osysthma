"use client";

import { useEffect, useState } from "react";
// Assuming Tabs components exist at this path
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "./FileUpload"; // Existing black-box component
import FileManage from "./FileManage"; // Component created in previous turn

// --- New Core Interfaces for Files ---
// Matches the structure of /content/files/metadata.json
export interface FileMetadata {
  filename: string;
  title: string;
  description: string;
}
// ------------------------------------

export default function FileManager() {
  // Stores the initial files loaded from metadata.json
  const [initialFiles, setInitialFiles] = useState<FileMetadata[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Upload Tab State (Simplified since FileUpload is a black box) ---
  // Retaining minimal state fields based on the original template for potential FileUpload compatibility
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<any[]>([]);
  const [collection, setCollection] = useState<string>("");
  const [newCollection, setNewCollection] = useState<string>("");

  // 1. Load existing files metadata
  useEffect(() => {
    (async () => {
      try {
        // Fetch file metadata instead of image metadata
        const metaRes = await fetch("/content/files/metadata.json");
        const data: FileMetadata[] = await metaRes.json();

        setInitialFiles(data);
      } catch (e) {
        console.error(
          "Failed to load file metadata (assuming file not created yet):",
          e,
        );
        // Handle case where metadata file doesn't exist or fails to parse
        setInitialFiles([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 2. Handle Save Changes from FileManage component
  const handleSaveMetadata = async (
    newMetadata: FileMetadata[],
    pathsToDelete: string[],
  ) => {
    setIsSaving(true);

    // Map filenames to the remote paths required for deletion (e.g., public/content/files/...)
    const actions = pathsToDelete.map((filename) => ({
      type: "delete",
      // Assuming files are stored in public/content/files/
      path: `public/content/files/${filename}`,
    }));

    // The new metadata is the final list of active files with updated title/description
    // We add an index field for the backend API for consistency, and a generic path.
    const newFileMetadata = newMetadata.map((file, index) => ({
      ...file,
      index: index,
      path: `/content/files/${file.filename}`,
    }));

    try {
      const res = await fetch("/api/admin/edit-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actions, newMetadata: newFileMetadata }),
      });

      if (!res.ok)
        throw new Error(
          (await res.json()).error || "Unknown error during save.",
        );

      console.log("File metadata and deletions saved! Refreshing...");
      // Reload the page to reset state and show the new initial files
      window.location.reload();
    } catch (err) {
      console.error("Save failed:", (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // Placeholder function for FileUpload (assuming it manages its own state and API)
  const handleUpload = () => {
    console.log(
      "Upload initiated. Please ensure the FileUpload component handles the API call and triggers a page refresh upon success.",
    );
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500 font-semibold">
        Loading files...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        Διαχειριστής Αρχείων
      </h1>
      <p className="text-gray-600">
        Ανεβάστε νέα έγγραφα ή διαχειριστείτε τα μεταδεδομένα και τις διαγραφές
        των υπαρχόντων αρχείων.
      </p>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1">
          <TabsTrigger
            value="upload"
            className="font-semibold text-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition duration-200"
          >
            Ανέβασμα Νέων Αρχείων
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="font-semibold text-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition duration-200"
          >
            Διαχείριση Υπαρχόντων ({initialFiles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="upload"
          className="mt-6 border p-6 rounded-xl bg-white shadow-lg"
        >
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
