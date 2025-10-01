export interface FileMetadata {
  filename: string;
  title: string;
  description: string;
}

export interface ImageMetadata {
  path: string;
  index: number;
}

export interface CollectionMetadata {
  name: string;
  date: string;
  images: ImageMetadata[];
}
