"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Trash2,
  Loader2,
  Save,
  Pencil,
  RotateCcw,
  XCircle,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// --- Types ---
interface FileMetadata {
  filename: string;
  title: string;
  description: string;
}

interface EditableFile extends FileMetadata {
  id: string;
  originalTitle: string;
  originalDescription: string;
  isDeleted: boolean;
  isEditing: boolean;
  isChanged: boolean;
}

interface FileManageProps {
  initialFiles: FileMetadata[];
  isSaving: boolean;
  onSave: (newMetadata: FileMetadata[], pathsToDelete: string[]) => void;
}

// --- Component ---
const FileManage: React.FC<FileManageProps> = ({
  initialFiles,
  isSaving,
  onSave,
}) => {
  const [editableFiles, setEditableFiles] = useState<EditableFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [isRevertAllVisible, setIsRevertAllVisible] = useState(false);

  useEffect(() => {
    const mapped: EditableFile[] = initialFiles.map((file) => ({
      ...file,
      id: file.filename,
      originalTitle: file.title,
      originalDescription: file.description,
      isDeleted: false,
      isEditing: false,
      isChanged: false,
    }));
    setEditableFiles(mapped);
  }, [initialFiles]);

  const filteredFiles = useMemo(() => {
    return editableFiles.filter((file) => {
      const matchesSearch = searchTerm
        ? file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.filename.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesDeleteFilter = showDeleted ? file.isDeleted : !file.isDeleted;
      return matchesSearch && matchesDeleteFilter;
    });
  }, [editableFiles, searchTerm, showDeleted]);

  const pendingChanges = useMemo(() => {
    const has = editableFiles.some((f) => f.isChanged || f.isDeleted);
    setIsRevertAllVisible(has);
    return has;
  }, [editableFiles]);

  // --- Handlers ---
  const handleToggleEdit = (id: string) =>
    setEditableFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, isEditing: !f.isEditing } : f,
      ),
    );

  const handleChange = (
    id: string,
    field: "title" | "description",
    value: string,
  ) =>
    setEditableFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, [field]: value };
          const changed =
            updated.title !== updated.originalTitle ||
            updated.description !== updated.originalDescription;
          return { ...updated, isChanged: changed };
        }
        return f;
      }),
    );

  const handleToggleDelete = (id: string) =>
    setEditableFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, isDeleted: !f.isDeleted } : f,
      ),
    );

  const handleRevert = (id: string) =>
    setEditableFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              title: f.originalTitle,
              description: f.originalDescription,
              isDeleted: false,
              isEditing: false,
              isChanged: false,
            }
          : f,
      ),
    );

  const handleRevertAll = () => {
    const reverted = initialFiles.map((f) => ({
      ...f,
      id: f.filename,
      originalTitle: f.title,
      originalDescription: f.description,
      isDeleted: false,
      isEditing: false,
      isChanged: false,
    }));
    setEditableFiles(reverted);
  };

  const handleSaveClick = () => {
    if (!pendingChanges || isSaving) return;
    const newMetadata = editableFiles
      .filter((f) => !f.isDeleted)
      .map(({ filename, title, description }) => ({
        filename,
        title,
        description,
      }));
    const toDelete = editableFiles.filter((f) => f.isDeleted).map((f) => f.filename);
    onSave(newMetadata, toDelete);
  };

  // --- Render ---
  return (
    <div className="p-6 md:p-10 min-h-screen space-y-8">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Manage Files</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search (Title, File, Description)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isRevertAllVisible && (
                <Button
                  onClick={handleRevertAll}
                  variant="secondary"
                  disabled={isSaving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Undo All
                </Button>
              )}
              <Button
                onClick={handleSaveClick}
                disabled={isSaving || !pendingChanges}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes (
                    {editableFiles.filter((f) => f.isChanged || f.isDeleted).length})
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Show Deleted */}
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={() => setShowDeleted(!showDeleted)}
            />
            <Label htmlFor="show-deleted" className="text-sm">
              Show files for deletion (
              {editableFiles.filter((f) => f.isDeleted).length})
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No files found.</p>
            <p className="text-sm">Try changing the filters or your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className={`relative ${
                file.isDeleted
                  ? "border-destructive bg-destructive/5"
                  : file.isChanged
                  ? "border-yellow-500/50 bg-yellow-50"
                  : ""
              }`}
            >
              <CardContent className="space-y-4 p-5">
                {/* Status */}
                {(file.isDeleted || file.isChanged) && (
                  <span
                    className={`absolute top-0 right-0 -mt-2 -mr-2 px-3 py-1 text-xs font-semibold rounded-full ${
                      file.isDeleted
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-yellow-500 text-white"
                    }`}
                  >
                    {file.isDeleted ? "TO BE DELETED" : "MODIFIED"}
                  </span>
                )}

                {/* Filename */}
                <p className="text-xs font-mono text-muted-foreground">
                  {file.filename}
                </p>

                {/* Title */}
                <div>
                  <Label htmlFor={`title-${file.id}`}>Title</Label>
                  <Input
                    id={`title-${file.id}`}
                    value={file.title}
                    disabled={!file.isEditing || file.isDeleted}
                    onChange={(e) => handleChange(file.id, "title", e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor={`desc-${file.id}`}>Description</Label>
                  <Textarea
                    id={`desc-${file.id}`}
                    rows={3}
                    value={file.description}
                    disabled={!file.isEditing || file.isDeleted}
                    onChange={(e) =>
                      handleChange(file.id, "description", e.target.value)
                    }
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  {(file.isChanged || file.isDeleted) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRevert(file.id)}
                      disabled={isSaving}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Undo
                    </Button>
                  )}
                  {!file.isDeleted && (
                    <Button
                      variant={file.isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleEdit(file.id)}
                      disabled={isSaving}
                    >
                      {file.isEditing ? (
                        <XCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <Pencil className="h-4 w-4 mr-1" />
                      )}
                      {file.isEditing ? "Submit" : "Edit"}
                    </Button>
                  )}
                  <Button
                    variant={file.isDeleted ? "secondary" : "destructive"}
                    size="sm"
                    onClick={() => handleToggleDelete(file.id)}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {file.isDeleted ? "Undo deletion" : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileManage;
