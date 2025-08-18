import Gallery from "@/components/local/Gallery";
import { getAllImages, FolderImages } from "@/lib/images";

export default function GalleryPage() {
  const folders: FolderImages[] = getAllImages(); // server-side

  return <Gallery folders={folders} />;
}
