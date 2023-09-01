export interface DocumentBodyVideoBlock {
  type: 'Video';
  video: DocumentBodyVideo;
}

export interface DocumentBodyVideo {
  url: string;
}
