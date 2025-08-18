import fs from "fs";
import path from "path";

export interface FolderImages {
  folder: string;       // original folder name (with date)
  displayName: string;  // folder name without date
  date: string;         // extracted date
  images: string[];
}

// Reads all folders inside public/content/images and their images
export function getAllImages(): FolderImages[] {
  const imagesPath = path.join(process.cwd(), "public/content/images");

  const folders = fs.readdirSync(imagesPath, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);

  const result: FolderImages[] = folders.map((folder) => {
    const folderPath = path.join(imagesPath, folder);
    const images = fs.readdirSync(folderPath)
      .filter((file) => /\.(png|jpe?g|webp|gif|avif)$/.test(file));

    // extract date and display name
    const match = folder.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    const date = match ? match[1] : "0000-00-00";
    const displayName = match ? match[2] : folder;

    return { folder, displayName, date, images };
  });

  // sort by date descending
  result.sort((a, b) => (a.date < b.date ? 1 : -1));

  return result;
}
