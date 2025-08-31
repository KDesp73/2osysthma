import Gallery from "@/components/local/Gallery";
import { getAllImages, FolderImages } from "@/lib/images";

export default function GalleryPage() {
  const folders: FolderImages[] = getAllImages();

  return <Gallery folders={folders} />;
}
