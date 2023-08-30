import { DocumentBodyBlockType } from './document-body-block';

export interface DocumentBodyVideoBlock {
  type: DocumentBodyBlockType.Video;
  video: {
    url: string;
  };
}
