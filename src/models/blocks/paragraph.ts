import { AlignType } from './align-type';
import { BlockType } from './block';
import { ContentBlock } from './content-block';
import { FontType } from './font-type';
import { FontSize } from './text';

export interface ParagraphBlock {
  type: BlockType.Paragraph;
  paragraph: {
    blocks: ContentBlock[];
    properties?: ParagraphProperties;
  };
}

export interface ParagraphProperties {
  align?: AlignType;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: FontSize;
  fontType?: FontType;
  indentation?: number;
}
