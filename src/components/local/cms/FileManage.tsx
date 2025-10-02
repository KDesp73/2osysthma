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

// --- Type Definitions ---

/**
 * Interface for the file structure found in metadata.json
 */
interface FileMetadata {
  filename: string; // The physical name, e.g., deltio-ygeias.pdf
  title: string; // The display title
  description: string; // The display description
}

/**
 * Internal interface used for managing editable state within the component
 */
interface EditableFile extends FileMetadata {
  id: string; // Stable unique ID (use filename)
  originalTitle: string;
  originalDescription: string;
  isDeleted: boolean;
  isEditing: boolean;
  isChanged: boolean;
}

interface FileManageProps {
  /** The initial list of files loaded from the metadata.json */
  initialFiles: FileMetadata[];
  /** State from the parent component indicating if an API call is ongoing */
  isSaving: boolean;
  /** Function to call when the user clicks 'Save Changes'
   * @param newMetadata The final array of active FileMetadata objects (title/description updated).
   * @param pathsToDelete Array of filenames to be deleted.
   */
  onSave: (newMetadata: FileMetadata[], pathsToDelete: string[]) => void;
}

// --- Main Component ---

const FileManage: React.FC<FileManageProps> = ({
  initialFiles,
  isSaving,
  onSave,
}) => {
  // Initialize state with a richer structure for tracking edits and deletions
  const [editableFiles, setEditableFiles] = useState<EditableFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [isRevertAllVisible, setIsRevertAllVisible] = useState(false);

  // Effect to initialize state when props change (e.g., after a successful save)
  useEffect(() => {
    const mappedFiles: EditableFile[] = initialFiles.map((file) => ({
      ...file,
      id: file.filename,
      originalTitle: file.title,
      originalDescription: file.description,
      isDeleted: false,
      isEditing: false,
      isChanged: false,
    }));
    setEditableFiles(mappedFiles);
  }, [initialFiles]);

  // Calculate derived state
  const filteredFiles = useMemo(() => {
    return editableFiles.filter((file) => {
      const matchesSearch = searchTerm
        ? file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.filename.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesDeleteFilter = showDeleted
        ? file.isDeleted
        : !file.isDeleted;

      return matchesSearch && matchesDeleteFilter;
    });
  }, [editableFiles, searchTerm, showDeleted]);

  // Check if any files have pending changes (edit or deletion)
  const pendingChanges = useMemo(() => {
    const hasChanges = editableFiles.some((f) => f.isChanged || f.isDeleted);
    setIsRevertAllVisible(hasChanges);
    return hasChanges;
  }, [editableFiles]);

  // --- Handlers for File Actions ---

  /** Toggles the editing mode for a specific file. */
  const handleToggleEdit = (id: string) => {
    setEditableFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, isEditing: !file.isEditing } : file,
      ),
    );
  };

  /** Updates the title or description of a file in state. */
  const handleChange = (
    id: string,
    field: "title" | "description",
    value: string,
  ) => {
    setEditableFiles((prev) =>
      prev.map((file) => {
        if (file.id === id) {
          const updatedFile = { ...file, [field]: value };
          // Determine if the file has changed from its original state
          const changed =
            updatedFile.title !== updatedFile.originalTitle ||
            updatedFile.description !== updatedFile.originalDescription;
          return { ...updatedFile, isChanged: changed };
        }
        return file;
      }),
    );
  };

  /** Toggles the 'isDeleted' flag for a file. */
  const handleToggleDelete = (id: string) => {
    setEditableFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, isDeleted: !file.isDeleted } : file,
      ),
    );
  };

  /** Reverts all changes for a single file. */
  const handleRevert = (id: string) => {
    setEditableFiles((prev) =>
      prev.map((file) => {
        if (file.id === id) {
          return {
            ...file,
            title: file.originalTitle,
            description: file.originalDescription,
            isDeleted: false,
            isEditing: false,
            isChanged: false,
          };
        }
        return file;
      }),
    );
  };

  /** Reverts all pending changes across all files. */
  const handleRevertAll = () => {
    const revertedFiles = initialFiles.map((file) => ({
      ...file,
      id: file.filename,
      originalTitle: file.title,
      originalDescription: file.description,
      isDeleted: false,
      isEditing: false,
      isChanged: false,
    }));
    setEditableFiles(revertedFiles);
  };

  // --- Final Save Handler ---

  /** Prepares the data structure and calls the parent's onSave function. */
  const handleSaveClick = () => {
    if (!pendingChanges || isSaving) return;

    // 1. Collect all files that are NOT marked for deletion and return their final structure
    const newMetadata: FileMetadata[] = editableFiles
      .filter((f) => !f.isDeleted)
      .map((f) => ({
        filename: f.filename,
        title: f.title,
        description: f.description,
      }));

    // 2. Collect the paths (filenames) of files marked for deletion
    const pathsToDelete: string[] = editableFiles
      .filter((f) => f.isDeleted)
      .map((f) => f.filename);

    onSave(newMetadata, pathsToDelete);
  };

  // --- Render Logic ---

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      <h1 className="text-3xl font-extrabold mb-2 text-blue-800">
        Διαχείριση Αρχείων
      </h1>
      <p className="text-gray-600 mb-6">
        Επεξεργαστείτε τον τίτλο και την περιγραφή των αρχείων ή επιλέξτε τα για
        διαγραφή.
      </p>

      {/* Controls Area */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          {/* Search Bar */}
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Αναζήτηση (Τίτλος, Αρχείο, Περιγραφή)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Save and Revert Buttons */}
          <div className="flex space-x-3 w-full sm:w-auto">
            {isRevertAllVisible && (
              <button
                onClick={handleRevertAll}
                disabled={isSaving}
                title="Αναίρεση Όλων των Αλλαγών"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition duration-200 ${
                  isSaving
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-yellow-500 text-white hover:bg-yellow-600 active:shadow-none shadow-md"
                }`}
              >
                <RotateCcw className="w-5 h-5" />
                <span className="hidden sm:inline">Αναίρεση Όλων</span>
              </button>
            )}
            <button
              onClick={handleSaveClick}
              disabled={isSaving || !pendingChanges}
              title="Αποθήκευση Αλλαγών"
              className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-bold transition duration-200 shadow-lg ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : pendingChanges
                    ? "bg-green-600 text-white hover:bg-green-700 active:shadow-none"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Αποθήκευση...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>
                    Αποθήκευση Αλλαγών (
                    {
                      editableFiles.filter((f) => f.isChanged || f.isDeleted)
                        .length
                    }
                    )
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Deleted Files Toggle */}
        <div className="flex items-center pt-2">
          <input
            id="show-deleted"
            type="checkbox"
            checked={showDeleted}
            onChange={() => setShowDeleted(!showDeleted)}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label
            htmlFor="show-deleted"
            className="ml-2 text-sm font-medium text-gray-700"
          >
            Εμφάνιση αρχείων προς Διαγραφή (
            {editableFiles.filter((f) => f.isDeleted).length})
          </label>
        </div>
      </div>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl bg-white">
          <p className="text-xl font-medium">Δεν βρέθηκαν αρχεία.</p>
          <p className="text-sm">
            Δοκιμάστε να αλλάξετε την αναζήτηση ή το φίλτρο διαγραφής.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFiles.map((file) => {
            const isEdited = file.isChanged;
            const isDeleted = file.isDeleted;
            const isEditing = file.isEditing;

            return (
              <div
                key={file.id}
                className={`p-5 rounded-xl transition-all duration-300 border shadow-md relative ${
                  isDeleted
                    ? "bg-red-50 border-red-300 opacity-60"
                    : isEdited
                      ? "bg-yellow-50 border-yellow-300"
                      : "bg-white border-gray-200"
                }`}
              >
                {/* Status Indicator */}
                {(isEdited || isDeleted) && (
                  <span
                    className={`absolute top-0 right-0 mt-[-10px] mr-[-10px] px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                      isDeleted
                        ? "bg-red-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {isDeleted ? "ΠΡΟΣ ΔΙΑΓΡΑΦΗ" : "ΕΠΕΞΕΡΓΑΣΜΕΝΟ"}
                  </span>
                )}

                {/* Filename Display */}
                <p className="text-xs font-mono text-gray-500 mb-3 p-1 bg-gray-100 rounded inline-block">
                  {file.filename}
                </p>

                <div className="space-y-3">
                  {/* Title Field */}
                  <div>
                    <label className="text-sm font-semibold block mb-1 text-gray-700">
                      Τίτλος:
                    </label>
                    <input
                      type="text"
                      value={file.title}
                      onChange={(e) =>
                        handleChange(file.id, "title", e.target.value)
                      }
                      disabled={!isEditing || isDeleted}
                      className={`w-full p-2 border rounded-lg ${
                        isEditing && !isDeleted
                          ? "bg-white border-blue-400"
                          : "bg-gray-100 border-gray-200"
                      }`}
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="text-sm font-semibold block mb-1 text-gray-700">
                      Περιγραφή:
                    </label>
                    <textarea
                      value={file.description}
                      onChange={(e) =>
                        handleChange(file.id, "description", e.target.value)
                      }
                      disabled={!isEditing || isDeleted}
                      rows={3}
                      className={`w-full p-2 border rounded-lg resize-none ${
                        isEditing && !isDeleted
                          ? "bg-white border-blue-400"
                          : "bg-gray-100 border-gray-200"
                      }`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 mt-4">
                  {/* Revert Button */}
                  {(isEdited || isDeleted) && (
                    <button
                      onClick={() => handleRevert(file.id)}
                      disabled={isSaving}
                      title="Αναίρεση Αλλαγών"
                      className="flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Αναίρεση
                    </button>
                  )}

                  {/* Edit / Done Button */}
                  {!isDeleted && (
                    <button
                      onClick={() => handleToggleEdit(file.id)}
                      disabled={isSaving}
                      title={
                        isEditing ? "Ολοκλήρωση Επεξεργασίας" : "Επεξεργασία"
                      }
                      className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-50 ${
                        isEditing
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      {isEditing ? (
                        <XCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <Pencil className="w-4 h-4 mr-1" />
                      )}
                      {isEditing ? "Ολοκλήρωση" : "Επεξεργασία"}
                    </button>
                  )}

                  {/* Delete/Restore Button */}
                  <button
                    onClick={() => handleToggleDelete(file.id)}
                    disabled={isSaving}
                    title={isDeleted ? "Αναίρεση Διαγραφής" : "Διαγραφή"}
                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-50 ${
                      isDeleted
                        ? "bg-red-400 text-white hover:bg-red-500"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {isDeleted ? "Αναίρεση Διαγραφής" : "Διαγραφή"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileManage;
