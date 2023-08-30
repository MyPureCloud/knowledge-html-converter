import { DomNode, DomNodeType } from 'html-parse-stringify';
import { StyleAttribute, Tag } from '../models/html';
import {
  DocumentContentBlock,
  DocumentContentBlockType,
} from '../models/blocks/document-content-block';
import { DocumentBodyBlockFontSize } from '../models/blocks/document-body-block';
import {
  DocumentTextMark,
  DocumentTextProperties,
  DocumentText,
  DocumentTextBlock,
} from '../models/blocks/document-text-block';
import { generateHyperlinkBlock } from './hyperlink';
import { convertRgbToHex, generateImageBlock } from './image';
import { generateVideoBlock } from './video';

export interface TextBlockOptions {
  textMarks?: DocumentTextMark[];
  hyperlink?: string;
  textProperties?: DocumentTextProperties;
  isPreformatted?: boolean;
}

export const generateTextBlocks = (
  domNode: DomNode,
  options: TextBlockOptions = {},
): DocumentContentBlock[] => {
  const arr: DocumentContentBlock[] = [];
  if (domNode.type === DomNodeType.Text) {
    if (domNode.content) {
      arr.push(assignAttributes(domNode.content, options));
    }
  } else if (
    domNode.type === DomNodeType.Tag &&
    domNode.name === Tag.LineBreak
  ) {
    arr.push(assignAttributes('\n'));
  } else if (domNode.type === DomNodeType.Tag && domNode.name === Tag.Image) {
    arr.push(
      generateImageBlock(domNode, {
        hyperlink: options.hyperlink,
        ...options.textProperties,
      }),
    );
  } else if (domNode.type === DomNodeType.Tag && domNode.name === Tag.Anchor) {
    arr.push(generateHyperlinkBlock(domNode, options));
  } else if (domNode.type === DomNodeType.Tag && domNode.name === Tag.IFrame) {
    arr.push(generateVideoBlock(domNode));
  } else {
    const textMarks = options.textMarks ? [...options.textMarks] : [];
    const textMark = htmlTagToTextMark(domNode.name);
    if (textMark) {
      textMarks.push(textMark);
    }
    const textProperties: DocumentTextProperties = options.textProperties
      ? { ...options.textProperties }
      : {};
    if (
      domNode.type === DomNodeType.Tag &&
      domNode.name === Tag.Span &&
      domNode.attrs?.style
    ) {
      Object.assign(
        textProperties,
        generateTextProperties(domNode.attrs.style),
      );
    }
    let children = domNode.children;
    if (!options.isPreformatted) {
      children = shrinkTextNodeWhiteSpaces(children);
    }
    children?.forEach((child) => {
      arr.push(
        ...generateTextBlocks(child, {
          ...options,
          textMarks,
          textProperties,
        }),
      );
    });
    if (!options.isPreformatted) {
      mergeBlankTextBlocks(arr);
    }
  }
  return arr;
};

const textMarksByHtmlTag: Record<string, DocumentTextMark> = {
  strong: DocumentTextMark.Bold,
  em: DocumentTextMark.Italic,
  u: DocumentTextMark.Underline,
  s: DocumentTextMark.Strikethrough,
  sub: DocumentTextMark.Subscript,
  sup: DocumentTextMark.Superscript,
};

export const htmlTagToTextMark = (
  tag: string,
): DocumentTextMark | undefined => {
  return tag ? textMarksByHtmlTag[tag.toLowerCase()] : undefined;
};

export const generateTextProperties = (
  styles: string,
): DocumentTextProperties | undefined => {
  let textProperties: DocumentTextProperties | undefined;
  if (styles) {
    let backgroundColor: string | undefined;
    let fontSize: DocumentBodyBlockFontSize | undefined;
    let textColor: string | undefined;
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk: string) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue: string[]) => {
        if (keyValue.length === 2) {
          if (keyValue[0] === StyleAttribute.BackgroundColor) {
            backgroundColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleAttribute.FontSize) {
            fontSize = getFontSizeName(keyValue[1]);
          }
          if (keyValue[0] === StyleAttribute.TextColor) {
            textColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
        }
      });
    if (backgroundColor || fontSize || textColor) {
      textProperties = Object.assign(
        {},
        backgroundColor && { backgroundColor },
        fontSize && { fontSize },
        textColor && { textColor },
      );
    }
  }
  return textProperties;
};

export const getFontSizeName = (
  htmlFontSizeValue: string,
): DocumentBodyBlockFontSize | undefined => {
  // TODO make this more robust
  switch (htmlFontSizeValue) {
    case '9px':
      return DocumentBodyBlockFontSize.XxSmall;
    case '10px':
      return DocumentBodyBlockFontSize.XSmall;
    case '13.333px':
      return DocumentBodyBlockFontSize.Small;
    case '16px':
      return DocumentBodyBlockFontSize.Medium;
    case '18px':
      return DocumentBodyBlockFontSize.Large;
    case '24px':
      return DocumentBodyBlockFontSize.XLarge;
    case '32px':
      return DocumentBodyBlockFontSize.XxLarge;
    default:
      return undefined;
  }
};

const assignAttributes = (
  text: string,
  options: TextBlockOptions = {},
): DocumentTextBlock => {
  const txt: DocumentText = {
    text: '',
  };
  txt.text = text;
  if (
    options.textProperties &&
    Object.getOwnPropertyNames(options.textProperties).length
  ) {
    txt.properties = options.textProperties;
  }
  if (options.textMarks && options.textMarks.length) {
    txt.marks = [...new Set(options.textMarks)];
  }

  const textBlock: DocumentTextBlock = {
    type: DocumentContentBlockType.Text,
    text: txt,
  };

  return textBlock;
};

const blankRegex = /^\s*$/;
const leadingWhiteSpaceRegex = /^\s+/;
const trailingWhiteSpaceRegex = /\s+$/;

/**
 * Removes leading and trailing blank text nodes,
 * then removes leading white spaces from the first text node
 * and trailing white spaces from the last text node.
 * Keeps one node if all nodes are blank text nodes.
 */
export const trimEdgeTextNodes = (domNodes: DomNode[] = []): DomNode[] => {
  const nodes = [...domNodes];
  removeBlankEdgeTextNodes(nodes);
  removeEdgeWhiteSpaces(nodes);
  return nodes;
};

const removeBlankEdgeTextNodes = (nodes: DomNode[]): void => {
  while (nodes.length > 1 && isBlankTextNode(nodes[0])) {
    nodes.shift();
  }
  while (nodes.length > 1 && isBlankTextNode(nodes[nodes.length - 1])) {
    nodes.pop();
  }
};

const removeEdgeWhiteSpaces = (nodes: DomNode[]): void => {
  if (nodes.length) {
    if (
      nodes[0].type === DomNodeType.Text &&
      leadingWhiteSpaceRegex.test(nodes[0].content!) &&
      !blankRegex.test(nodes[0].content!)
    ) {
      nodes[0] = {
        ...nodes[0],
        content: nodes[0].content!.replace(leadingWhiteSpaceRegex, ''),
      };
    }
    if (
      nodes[nodes.length - 1] &&
      nodes[nodes.length - 1].type === DomNodeType.Text &&
      trailingWhiteSpaceRegex.test(nodes[nodes.length - 1].content!) &&
      !blankRegex.test(nodes[nodes.length - 1].content!)
    ) {
      nodes[nodes.length - 1] = {
        ...nodes[nodes.length - 1],
        content: nodes[nodes.length - 1].content!.replace(
          trailingWhiteSpaceRegex,
          '',
        ),
      };
    }
  }
};

const isBlankTextNode = (node: DomNode): boolean =>
  node.type === DomNodeType.Text &&
  (!node.content || blankRegex.test(node.content));

/**
 * Replaces consecutive white space characters with a single space character.
 */
export const shrinkTextNodeWhiteSpaces = (
  domNodes: DomNode[] = [],
): DomNode[] => {
  const nodes = [...domNodes];
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].type === DomNodeType.Text && /\s+/.test(nodes[i].content!)) {
      nodes[i] = {
        ...nodes[i],
        content: nodes[i].content!.replace(/\s+/g, ' '),
      };
    }
  }
  return nodes;
};

/**
 * Removes leading and trailing blank textblocks.
 * Keeps one node if all nodes are blank text nodes.
 */
export const removeBlankEdgeTextBlocks = (
  blocks: DocumentContentBlock[] = [],
): void => {
  while (
    blocks.length > 1 &&
    isBlankTextBlock(blocks[0] as DocumentTextBlock)
  ) {
    blocks.shift();
  }
  while (
    blocks.length > 1 &&
    isBlankTextBlock(blocks[blocks.length - 1] as DocumentTextBlock)
  ) {
    blocks.pop();
  }
};

const isBlankTextBlock = (textBlock: DocumentTextBlock): boolean =>
  textBlock.text &&
  (!textBlock.text.text || blankRegex.test(textBlock.text.text));

/**
 * Removes text blocks that are blank and either
 * the previous text block ends with white space or
 * the next text block starts with white space.
 * @param blocks
 */
export const mergeBlankTextBlocks = (
  blocks: DocumentContentBlock[] = [],
): void => {
  for (let i = 0; i < blocks.length; i++) {
    const textBlock = asTextBlock(blocks[i]);
    if (!textBlock || !isBlankTextBlock(textBlock)) {
      continue;
    }
    const previousTextBlock = i > 0 ? asTextBlock(blocks[i - 1]) : undefined;
    const nextTextBlock =
      i < blocks.length - 1 ? asTextBlock(blocks[i + 1]) : undefined;
    if (
      (previousTextBlock &&
        trailingWhiteSpaceRegex.test(previousTextBlock.text.text)) ||
      (nextTextBlock && leadingWhiteSpaceRegex.test(nextTextBlock.text.text))
    ) {
      blocks.splice(i, 1);
      i--;
    }
  }
};

const asTextBlock = (
  block: DocumentContentBlock,
): DocumentTextBlock | undefined => {
  return (block as DocumentTextBlock).type === DocumentContentBlockType.Text &&
    (block as DocumentTextBlock).text
    ? (block as DocumentTextBlock)
    : undefined;
};

export const createEmptyTextBlock = (): DocumentTextBlock => {
  return {
    type: DocumentContentBlockType.Text,
    text: {
      text: ' ',
    },
  };
};
