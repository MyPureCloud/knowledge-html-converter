import { DomNode, DomNodeType } from 'html-parse-stringify';
import { StyleAttribute, Tag } from '../models/html';
import {
  DocumentBodyBlockType,
  DocumentBodyBlockAlignType,
  DocumentBodyBlockFontSize,
  DocumentBodyBlockFontType,
} from '../models/blocks/document-body-block';
import { convertRgbToHex } from './image';
import {
  DocumentBodyList,
  DocumentBodyListBlockProperties,
  DocumentBodyListBlock,
  DocumentBodyListItemProperties,
  DocumentBodyListBlockType,
  DocumentBodyBlockOrderedType,
  DocumentBodyBlockUnorderedType,
  DocumentListContentBlockType,
  DocumentListContentBlock,
} from '../models/blocks/document-body-list';
import {
  DocumentContentBlock,
  DocumentContentBlockType,
} from '../models/blocks/document-body-paragraph';
import {
  generateTextBlocks,
  getFontSizeName,
  removeBlankEdgeTextBlocks,
  shrinkTextNodeWhiteSpaces,
  trimEdgeTextNodes,
} from './text';
import { cssTextAlignToAlignType, htmlTagToFontType } from './paragraph';

export const generateList = (
  listElement: DomNode,
  listType:
    | DocumentBodyBlockType.OrderedList
    | DocumentBodyBlockType.UnorderedList,
): DocumentBodyList | undefined => {
  const list: DocumentBodyList = {
    blocks: [],
  };
  const properties = generateListProperties(listElement.attrs?.style, listType);
  if (properties) {
    list.properties = properties;
  }

  listElement.children
    ?.filter((child) => child.type === DomNodeType.Tag)
    .forEach((listItemElement) => {
      const listItemBlock = generateListItemBlock(listItemElement, listType);
      list.blocks.push(listItemBlock);
    });
  return list.blocks.length ? list : undefined;
};

const generateListProperties = (
  styles: string | undefined,
  listType:
    | DocumentBodyBlockType.OrderedList
    | DocumentBodyBlockType.UnorderedList,
): DocumentBodyListBlockProperties | DocumentBodyListItemProperties => {
  let properties;
  if (styles) {
    let orderedType: DocumentBodyBlockOrderedType | undefined;
    let unorderedType: DocumentBodyBlockUnorderedType | undefined;
    let fontSize: DocumentBodyBlockFontSize | undefined;
    let textColor: string | undefined;
    let backgroundColor: string | undefined;
    let align: DocumentBodyBlockAlignType | undefined;
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue) => {
        if (keyValue.length === 2) {
          if (keyValue[0] === StyleAttribute.ListStyleType) {
            if (listType === DocumentBodyBlockType.OrderedList) {
              orderedType = cssListStyleTypeToOrderedType(keyValue[1]);
            } else if (listType === DocumentBodyBlockType.UnorderedList) {
              unorderedType = cssListStyleTypeToUnorderedType(keyValue[1]);
            }
          }
          if (keyValue[0] === StyleAttribute.FontSize) {
            fontSize = getFontSizeName(keyValue[1]);
          }
          if (keyValue[0] === StyleAttribute.TextColor) {
            textColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleAttribute.BackgroundColor) {
            backgroundColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleAttribute.TextAlign) {
            align = cssTextAlignToAlignType(keyValue[1]);
          }
        }
      });
    if (
      orderedType ||
      unorderedType ||
      fontSize ||
      textColor ||
      backgroundColor ||
      align
    ) {
      properties = Object.assign(
        {},
        orderedType && { orderedType },
        unorderedType && { unorderedType },
        fontSize && { fontSize },
        textColor && { textColor },
        backgroundColor && { backgroundColor },
        align && { align },
      );
    }
  }
  return properties;
};

const generateListItemBlock = (
  listItemElement: DomNode,
  listType:
    | DocumentBodyBlockType.OrderedList
    | DocumentBodyBlockType.UnorderedList,
): DocumentBodyListBlock => {
  const listItemBlock: DocumentBodyListBlock = {
    type: DocumentBodyListBlockType.ListItem,
    blocks: [],
  };

  if (listItemElement.attrs?.style) {
    listItemBlock.properties = generateListProperties(
      listItemElement.attrs?.style,
      listType,
    );
  }
  const fontType = getFontType(listItemElement);
  if (fontType) {
    listItemBlock.properties = listItemBlock.properties || {};
    listItemBlock.properties.fontType = fontType;
  }
  const isPreformatted = fontType === DocumentBodyBlockFontType.Preformatted;
  let children = listItemElement.children;
  if (!isPreformatted) {
    children = shrinkTextNodeWhiteSpaces(trimEdgeTextNodes(children));
  }

  children?.forEach((child: DomNode) => {
    if (child.name === Tag.OrderedList) {
      const list = generateList(child, DocumentBodyBlockType.OrderedList);
      if (list) {
        listItemBlock.blocks.push({
          type: DocumentListContentBlockType.OrderedList,
          list,
        });
      }
    } else if (child.name === Tag.UnorderedList) {
      const list = generateList(child, DocumentBodyBlockType.UnorderedList);
      if (list) {
        listItemBlock.blocks.push({
          type: DocumentListContentBlockType.UnorderedList,
          list,
        });
      }
    } else {
      listItemBlock.blocks.push(
        ...generateTextBlocks(child, { isPreformatted }).map(
          documentContentBlockToDocumentListContentBlock,
        ),
      );
    }
  });
  removeBlankEdgeTextBlocks(listItemBlock.blocks);
  if (!listItemBlock.blocks.length) {
    listItemBlock.blocks.push(createEmptyTextBlock());
  }
  return listItemBlock;
};

const getFontType = (
  listItemElement: DomNode,
): DocumentBodyBlockFontType | undefined => {
  const children = listItemElement.children || [];
  for (let i = 0; i < children.length; i++) {
    if (children[i].type === DomNodeType.Tag) {
      const fontType = htmlTagToFontType(children[i].name);
      if (fontType) {
        return fontType;
      }
    }
  }
};

const orderedTypesByCssListStyleType: Record<
  string,
  DocumentBodyBlockOrderedType
> = {
  'lower-alpha': DocumentBodyBlockOrderedType.LowerAlpha,
  'lower-greek': DocumentBodyBlockOrderedType.LowerGreek,
  'lower-roman': DocumentBodyBlockOrderedType.LowerRoman,
  'upper-alpha': DocumentBodyBlockOrderedType.UpperAlpha,
  'upper-roman': DocumentBodyBlockOrderedType.UpperRoman,
  none: DocumentBodyBlockOrderedType.None,
};

const cssListStyleTypeToOrderedType = (
  listStyleType: string,
): DocumentBodyBlockOrderedType | undefined => {
  return listStyleType
    ? orderedTypesByCssListStyleType[listStyleType.toLowerCase()]
    : undefined;
};

const unorderedTypesByCssListStyleType: Record<
  string,
  DocumentBodyBlockUnorderedType
> = {
  normal: DocumentBodyBlockUnorderedType.Normal, // TODO 'normal' is not a list-style-type value
  square: DocumentBodyBlockUnorderedType.Square,
  circle: DocumentBodyBlockUnorderedType.Circle,
  none: DocumentBodyBlockUnorderedType.None,
};

const cssListStyleTypeToUnorderedType = (
  listStyleType: string,
): DocumentBodyBlockUnorderedType | undefined => {
  return listStyleType
    ? unorderedTypesByCssListStyleType[listStyleType.toLowerCase()]
    : undefined;
};

const createEmptyTextBlock = (): DocumentListContentBlock => {
  return {
    type: DocumentListContentBlockType.Text,
    text: {
      text: ' ',
    },
  };
};

const documentContentBlockToDocumentListContentBlock = (
  block: DocumentContentBlock,
): DocumentListContentBlock => {
  return {
    type: documentContentBlockTypeToDocumentListContentBlockType(block.type),
    text: block.text,
    image: block.image,
    video: block.video,
  };
};

const documentContentBlockTypeToDocumentListContentBlockType = (
  type: DocumentContentBlockType,
): DocumentListContentBlockType => {
  switch (type) {
    case DocumentContentBlockType.Text:
      return DocumentListContentBlockType.Text;
    case DocumentContentBlockType.Image:
      return DocumentListContentBlockType.Image;
    case DocumentContentBlockType.Video:
      return DocumentListContentBlockType.Video;
  }
};
