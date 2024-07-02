import { DomNode, DomNodeType } from 'html-parse-stringify';
import { StyleAttribute } from '../models/html/style-attribute.js';
import { Tag } from '../models/html/tag.js';
import { DocumentContentBlock } from '../models/blocks/document-body-paragraph.js';
import { DocumentBodyBlockFontSize } from '../models/blocks/document-body-block.js';
import {
  DocumentTextMarks,
  DocumentTextProperties,
  DocumentText,
  DocumentTextBlock,
} from '../models/blocks/document-text.js';
import { generateHyperlinkBlock } from './hyperlink.js';
import { generateImageBlock } from './image.js';
import { generateVideoBlock } from './video.js';
import { parseColorString } from '../utils/color.js';
import { convertPixelsToEM, getLength } from '../utils/length.js';
import { getBlockProperties } from '../utils/block.js';
import { HtmlConverterOptions } from '../models/options/html-converter-options.js';

export interface TextBlockOptions {
  textMarks?: DocumentTextMarks[];
  hyperlink?: string;
  textProperties?: DocumentTextProperties;
}

const lineBreak = '<br>';
export const lineBreakInApi = '\n';
// TinyMCE in the article editor generates an nbsp character for empty paragraphs, list items, table cells
export const nbspCharacter = '\u00a0';
const nbspPlaceholder = '&nbsp-encoded;';

export const generateTextBlocks = (
  domNode: DomNode,
  converterOptions: HtmlConverterOptions,
  options: TextBlockOptions = {},
): DocumentContentBlock[] => {
  const arr: DocumentContentBlock[] = [];
  if (domNode.type === DomNodeType.Text) {
    if (domNode.content) {
      arr.push(generateTextBlock(domNode.content, options));
    }
  } else if (
    domNode.type === DomNodeType.Tag &&
    domNode.name === Tag.LineBreak
  ) {
    arr.push(generateTextBlock(lineBreak));
  } else if (domNode.type === DomNodeType.Tag && domNode.name === Tag.Image) {
    arr.push(
      generateImageBlock(
        domNode,
        converterOptions,
        options.textProperties,
        options.hyperlink,
      ),
    );
  } else if (domNode.type === DomNodeType.Tag && domNode.name === Tag.Anchor) {
    const link = generateHyperlinkBlock(domNode, converterOptions, options);
    if (link) {
      arr.push(link);
    }
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
    domNode.children?.forEach((child) => {
      arr.push(
        ...generateTextBlocks(child, converterOptions, {
          ...options,
          textMarks,
          textProperties,
        }),
      );
    });
  }
  return arr;
};

export const generateTextBlock = (
  text: string,
  options: TextBlockOptions = {},
): DocumentTextBlock => {
  return {
    type: 'Text',
    text: generateDocumentText(text, options),
  };
};

export const generateEmptyTextBlock = (): DocumentTextBlock => {
  return generateTextBlock(nbspCharacter);
};

const generateDocumentText = (
  text: string,
  options: TextBlockOptions = {},
): DocumentText => {
  const documentText: DocumentText = {
    text: '',
  };
  documentText.text = text;
  if (
    options.textProperties &&
    Object.getOwnPropertyNames(options.textProperties).length
  ) {
    documentText.properties = options.textProperties;
  }
  if (options.textMarks && options.textMarks.length) {
    documentText.marks = [...new Set(options.textMarks)];
  }
  return documentText;
};

const textMarksByHtmlTag: Record<string, DocumentTextMarks> = {
  strong: DocumentTextMarks.Bold,
  em: DocumentTextMarks.Italic,
  u: DocumentTextMarks.Underline,
  s: DocumentTextMarks.Strikethrough,
  strike: DocumentTextMarks.Strikethrough,
  sub: DocumentTextMarks.Subscript,
  sup: DocumentTextMarks.Superscript,
};

export const htmlTagToTextMark = (
  tag: string | undefined,
): DocumentTextMarks | undefined => {
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
    let display: string = ''; // To handle block display
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk: string) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .filter(
        (keyValue) =>
          keyValue && keyValue.length === 2 && keyValue[0] && keyValue[1],
      ) //filter valid properties
      .map(([key, value]: string[]) => {
        if (key === StyleAttribute.BackgroundColor) {
          backgroundColor = parseColorString(value);
        }
        if (key === StyleAttribute.FontSize) {
          fontSize = getFontSizeName(value);
        }
        if (key === StyleAttribute.TextColor) {
          textColor = parseColorString(value);
        }
        if (key === StyleAttribute.Display) {
          display = value;
        }
      });
    // In case of text blocks with display as block,
    // To treat them as a block element, add a new line after each text block
    // And move all the block level properties on text block to the closest parent block element like paragraph/list item/table cell
    let blockProperties;
    if (display?.toLowerCase() === 'block') {
      blockProperties = getBlockProperties(styles);
    }
    if (backgroundColor || fontSize || textColor || blockProperties) {
      textProperties = Object.assign(
        {},
        blockProperties,
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
  const emFontSize = getLength(htmlFontSizeValue);

  if (!emFontSize) {
    return undefined;
  }

  if (emFontSize <= convertPixelsToEM(9)) {
    return DocumentBodyBlockFontSize.XxSmall;
  } else if (emFontSize <= convertPixelsToEM(10)) {
    return DocumentBodyBlockFontSize.XSmall;
  } else if (emFontSize <= convertPixelsToEM(13.3333)) {
    return DocumentBodyBlockFontSize.Small;
  } else if (emFontSize <= convertPixelsToEM(16)) {
    return DocumentBodyBlockFontSize.Medium;
  } else if (emFontSize <= convertPixelsToEM(18)) {
    return DocumentBodyBlockFontSize.Large;
  } else if (emFontSize <= convertPixelsToEM(24)) {
    return DocumentBodyBlockFontSize.XLarge;
  } else {
    return DocumentBodyBlockFontSize.XxLarge;
  }
};

const blankRegex = /^\s*$/;
const leadingWhiteSpaceRegex = /^\s+/;
const trailingWhiteSpaceRegex = /\s+$/;

/**
 * Applies text block post processing:
 * - Merge adjacent text blocks when they have the same formatting.
 * - Replace adjacent white space characters with a single space character.
 * - Remove leading/trailing white spaces from text blocks when the
 *   previous/next block either has trailing/leading white space or
 *   represents an html block element.
 * - Replace '<br>' with '\n' to indicate line break to the knowledge api.
 */
export const postProcessTextBlocks = (
  blocks: Omit<DocumentContentBlock, 'type'>[] = [],
): void => {
  encodeNbspCharactersToPlaceholderLiterals(blocks);
  mergeTextBlocks(blocks);

  shrinkTextBlockWhiteSpaces(blocks);
  removeTextBlockEdgeWhiteSpaces(blocks);

  replaceLineBreakStrings(blocks);
  decodeNbspCharactersFromPlaceholderLiterals(blocks);
};

/**
 * Encodes '\u00a0' (non-breaking space) characters to the '&converter-nbsp-character;' string literals,
 * so that these characters are kept when squeezing white spaces.
 * TinyMCE generates such characters for empty paragraphs
 */
const encodeNbspCharactersToPlaceholderLiterals = (
  blocks: Omit<DocumentContentBlock, 'type'>[] = [],
): void => {
  replaceTextBlockStrings(
    blocks,
    new RegExp(nbspCharacter, 'g'),
    nbspPlaceholder,
  );
};

/**
 * Decodes '&converter-nbsp-character;' literals to '\u00a0' (non-breaking space) characters.
 */
const decodeNbspCharactersFromPlaceholderLiterals = (
  blocks: Omit<DocumentContentBlock, 'type'>[] = [],
): void => {
  replaceTextBlockStrings(
    blocks,
    new RegExp(nbspPlaceholder, 'g'),
    nbspCharacter,
  );
};

const replaceTextBlockStrings = (
  blocks: Omit<DocumentContentBlock, 'type'>[] = [],
  from: RegExp,
  to: string,
): void => {
  blocks.forEach((block) => {
    if (block.text) {
      block.text.text = block.text.text.replace(from, to);
    }
  });
};

/**
 * Merges adjacent text blocks when they have the same formatting.
 */
const mergeTextBlocks = (
  blocks: Omit<DocumentContentBlock, 'type'>[] = [],
): void => {
  for (let i = 0; i < blocks.length - 1; i++) {
    if (!blocks[i].text || !blocks[i + 1].text) {
      continue;
    }
    const current = blocks[i].text!;
    const next = blocks[i + 1].text!;
    // Don't merge the line break text block with others
    if (current.text === lineBreak || next.text === lineBreak) {
      continue;
    }
    if (
      hyperlinksEqual(current.hyperlink, next.hyperlink) &&
      textMarksEqual(current.marks, next.marks) &&
      textPropertiesEqual(current.properties, next.properties)
    ) {
      current.text = current.text + next.text;
      blocks.splice(i + 1, 1);
      --i;
    }
  }
};

const hyperlinksEqual = (
  link1: string | undefined,
  link2: string | undefined,
): boolean => (!link1 && !link2) || link1 === link2;

const textMarksEqual = (
  m1: DocumentTextMarks[] | undefined,
  m2: DocumentTextMarks[] | undefined,
): boolean => {
  m1 = m1 || [];
  m2 = m2 || [];
  if (m1.length === 0 && m2.length === 0) {
    return true;
  }
  if (m1.length !== m2.length) {
    return false;
  }
  const sorted1 = [...m1].sort();
  const sorted2 = [...m2].sort();
  return sorted1.every((val, index) => val === sorted2[index]);
};

const textPropertiesEqual = (
  p1: DocumentTextProperties = {},
  p2: DocumentTextProperties = {},
) => {
  return (
    p1.backgroundColor === p2.backgroundColor &&
    p1.fontSize === p2.fontSize &&
    p1.textColor === p2.textColor
  );
};

/**
 * Replaces adjacent white space characters with a single space character.
 */
const shrinkTextBlockWhiteSpaces = (
  blocks: Omit<DocumentContentBlock, 'type'>[] = [],
): void => {
  blocks.forEach((block) => {
    if (block.text && /\s+/.test(block.text.text)) {
      block.text.text = block.text.text.replace(/\s+/g, ' ');
    }
  });
};

/**
 * Removes leading/trailing white spaces from text blocks when the
 * previous/next block either has trailing/leading white space or
 * represents an html block element.
 */
const removeTextBlockEdgeWhiteSpaces = (
  blocks: Omit<DocumentContentBlock, 'type'>[] = [],
): void => {
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (!blocks[i].text) {
      continue;
    }
    const currentText = blocks[i].text!;
    const textToLeft = blocks[i - 1]?.text;
    if (
      trailingWhiteSpaceRegex.test(currentText.text) &&
      (i === blocks.length - 1 || !isInlineElement(blocks[i + 1]))
    ) {
      currentText.text = currentText.text.replace(trailingWhiteSpaceRegex, '');
    }
    if (
      leadingWhiteSpaceRegex.test(currentText.text) &&
      (i === 0 ||
        !isInlineElement(blocks[i - 1]) ||
        (textToLeft && trailingWhiteSpaceRegex.test(textToLeft.text)))
    ) {
      currentText.text = currentText.text.replace(leadingWhiteSpaceRegex, '');
    }
    if (!currentText.text) {
      blocks.splice(i, 1);
    }
  }
};

const isInlineElement = (block: Omit<DocumentContentBlock, 'type'>): boolean =>
  !!(block.text || block.image || block.video);

/**
 * Replaces '<br>' with '\n' to indicate line break to the knowledge api.
 */
const replaceLineBreakStrings = (
  blocks: Omit<DocumentContentBlock, 'type'>[] = [],
): void => {
  blocks.forEach((block) => {
    if (block.text && block.text.text === lineBreak) {
      block.text.text = lineBreakInApi;
    }
  });
};

/**
 * Removes leading and trailing blank textblocks.
 * Keeps one node if all nodes are blank text nodes.
 */
export const removeBlankEdgeTextBlocks = (
  blocks: Omit<DocumentContentBlock, 'type'>[] = [],
): void => {
  while (blocks.length > 0 && isBlankTextBlock(blocks[0])) {
    blocks.shift();
  }
  while (blocks.length > 0 && isBlankTextBlock(blocks[blocks.length - 1])) {
    blocks.pop();
  }
};

const isBlankTextBlock = (
  contentBlock: Omit<DocumentContentBlock, 'type'>,
): boolean => !!contentBlock.text && isBlankDocumentText(contentBlock.text);

const isBlankDocumentText = (documentText: DocumentText): boolean =>
  !documentText.text || blankRegex.test(documentText.text);
