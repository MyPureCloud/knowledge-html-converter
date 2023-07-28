import { AstElement } from 'html-parse-stringify';
import { BlockTypes, StyleProperties, TagNames } from '../tags';
import { ImageBlock } from './image';
import { FontSize, TextBlocks, generateTextBlocks } from './text';
import { VideoBlock } from './video';

export interface ParagraphBlock {
  type: BlockTypes.Paragraph;
  paragraph: {
    blocks: (TextBlocks | ImageBlock | VideoBlock)[];
    properties?: ParagraphProperties;
  };
}

export interface ParagraphProperties {
  fontType?: TagNames;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: FontSize;
  indentation?: number;
  align?: AlignType;
}

export enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
  Justify = 'justify'
}

export const generateParagraphBlock = (blockData: AstElement): ParagraphBlock => {
  const paragraphBlock: ParagraphBlock = {
    type: BlockTypes.Paragraph,
    paragraph: {
      blocks: []
    }
  };
  const children = blockData.children;
  const fontType = Object.keys(TagNames)[
    Object.values(TagNames).indexOf(blockData.name as unknown as TagNames)
  ] as TagNames;
  const properties = generateProperties(blockData.attrs);
  if (properties) {
    paragraphBlock.paragraph.properties = { ...properties, fontType };
  } else {
    paragraphBlock.paragraph.properties = { fontType };
  }

  children?.forEach((child: AstElement) => {
    paragraphBlock.paragraph.blocks.push(...generateTextBlocks(child));
  });
  return paragraphBlock;
};

const generateProperties = (attrs: any): ParagraphProperties | undefined => {
  let paragraphProperties: ParagraphProperties | undefined;
  let indentation: number | undefined;
  let align: AlignType | undefined;
  const styles: string = attrs?.style;
  if (styles) {
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue) => {
        if (keyValue.length === 2) {
          if (keyValue[0] === StyleProperties.Indentation) {
            // remove the em from the value
            indentation = Number(keyValue[1].replace(/\s*em\s*/g, ''));
          }
          if (keyValue[0] === StyleProperties.Align) {
            align = keyValue[1] as AlignType;
          }
        }
      });
    if (indentation || align) {
      paragraphProperties = Object.assign({}, indentation && { indentation }, align && { align });
    }
  }
  return paragraphProperties;
};
