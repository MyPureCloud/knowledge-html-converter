import { DomNode, DomNodeType } from 'html-parse-stringify';
import { StyleAttribute, Tag } from '../models/html';
import { ContentBlock, ContentBlockType } from '../models/blocks/content-block';
import {
  TextMark,
  FontSize,
  TextProperties,
  Text,
  TextBlock,
  htmlTagToTextMark,
} from '../models/blocks/text';
import { generateHyperlinkBlock } from './hyperlink';
import { convertRgbToHex, generateImageBlock } from './image';
import { generateVideoBlock } from './video';

export interface TextBlockOptions {
  textMarks?: TextMark[];
  hyperlink?: string;
  textProperties?: TextProperties;
  isPreformatted?: boolean;
}

export const generateTextBlocks = (
  domNode: DomNode,
  options: TextBlockOptions = {},
): ContentBlock[] => {
  const arr: ContentBlock[] = [];
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
    const textProperties: TextProperties = options.textProperties
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

export const generateTextProperties = (
  styles: string,
): TextProperties | undefined => {
  let textProperties: TextProperties | undefined;
  if (styles) {
    let backgroundColor: string | undefined;
    let fontSize: FontSize | undefined;
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
): FontSize | undefined => {
  // TODO make this more robust
  switch (htmlFontSizeValue) {
    case '9px':
      return FontSize.XxSmall;
    case '10px':
      return FontSize.XSmall;
    case '13.333px':
      return FontSize.Small;
    case '16px':
      return FontSize.Medium;
    case '18px':
      return FontSize.Large;
    case '24px':
      return FontSize.XLarge;
    case '32px':
      return FontSize.XxLarge;
    default:
      return undefined;
  }
};

const assignAttributes = (
  text: string,
  options: TextBlockOptions = {},
): TextBlock => {
  const txt: Text = {
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

  const textBlock: TextBlock = {
    type: ContentBlockType.Text,
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
 */
export const removeBlankEdgeTextBlocks = (
  blocks: ContentBlock[] = [],
): void => {
  while (blocks[0] && isBlankTextBlock(blocks[0] as TextBlock)) {
    blocks.shift();
  }
  while (
    blocks.length &&
    isBlankTextBlock(blocks[blocks.length - 1] as TextBlock)
  ) {
    blocks.pop();
  }
};

const isBlankTextBlock = (textBlock: TextBlock): boolean =>
  textBlock.text &&
  (!textBlock.text.text || blankRegex.test(textBlock.text.text));

/**
 * Removes text blocks that are blank and either
 * the previous text block ends with white space or
 * the next text block starts with white space.
 * @param blocks
 */
export const mergeBlankTextBlocks = (blocks: ContentBlock[] = []): void => {
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

const asTextBlock = (block: ContentBlock): TextBlock | undefined => {
  return (block as TextBlock).type === ContentBlockType.Text &&
    (block as TextBlock).text
    ? (block as TextBlock)
    : undefined;
};

export const createEmptyTextBlock = (): TextBlock => {
  return {
    type: ContentBlockType.Text,
    text: {
      text: ' ',
    },
  };
};
