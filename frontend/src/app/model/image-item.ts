export interface ImageItem {
  src: string;
  name: string;
  isPublic: boolean;
}

export interface ImageData {
  filename: string;
  id: string;
  likes: number;
  uploadedAt: string;
  url: string;
  public: boolean;
}
