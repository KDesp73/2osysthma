import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react"; // remove icon
import { ImageUploadPreview } from "./ImageManager";

interface ImageUploadProps {
  collections: string[];
  collection: string;
  setCollection: (val: string) => void;
  newCollection: string;
  setNewCollection: (val: string) => void;
  uploadImages: ImageUploadPreview[];
  handleFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => Promise<void>;
  removeImage: (index: number) => void;
  uploading: boolean;
}

export default function ImageUpload({
  collections,
  collection,
  setCollection,
  newCollection,
  setNewCollection,
  uploadImages,
  handleFilesChange,
  handleUpload,
  removeImage,
  uploading,
}: ImageUploadProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Upload Images</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Collection Selection */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="collection">Choose collection</Label>
            <Select
              value={collection}
              onValueChange={(val) => {
                setCollection(val);
                setNewCollection("");
              }}
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
            <Label htmlFor="new-collection">Or create new collection</Label>
            <Input
              id="new-collection"
              type="text"
              placeholder="New collection name"
              value={newCollection}
              onChange={(e) => {
                setNewCollection(e.target.value);
                setCollection("");
              }}
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
        {uploadImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadImages.map((img, i) => (
              <div key={i} className="relative group">
                <Card className="overflow-hidden">
                  <img
                    src={img.preview}
                    alt={img.name}
                    className="object-cover w-full h-32"
                  />
                  <p className="text-sm text-center p-2 truncate">{img.name}</p>
                </Card>

                {/* Remove button */}
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? "Uploading..." : "Upload Images"}
        </Button>
      </CardContent>
    </Card>
  );
}
