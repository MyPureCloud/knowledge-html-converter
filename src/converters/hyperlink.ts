import { DomNode } from 'html-parse-stringify';
import { TextBlockOptions, generateTextBlocks, nbspCharacter } from './text.js';
import { DocumentContentBlock } from '../models/blocks/document-body-paragraph.js';
import { StyleAttribute } from '../models/html/style-attribute.js';
import { DocumentBodyBlockFontSize } from '../index.js';

export const generateHyperlinkBlock = (
  anchorElement: DomNode,
  options: TextBlockOptions = {},
): DocumentContentBlock | null => {
  const textBlocks: DocumentContentBlock[] = [];
  const hyperlinkFormattings = options.textMarks || [];
  let backgroundColor: string | undefined;
  let fontSize: DocumentBodyBlockFontSize | undefined;
  let textColor: string | undefined;
  let blockProperties = {};
  const blockDisplay = 'block';
  let displayText = '';

  let hyperlink: string | undefined =
    anchorElement.attrs?.href || anchorElement.attrs?.title;
  if (hyperlink && hyperlink.startsWith('#')) {
    hyperlink = undefined;
  }
  // validate all the child nodes are block nodes i'e display: block
  const isBlockElement = anchorElement.children?.forEach((child) => {
    child.attrs?.style
      ?.split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk: string) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .every(
        (keyValue) =>
          keyValue &&
          keyValue.length === 2 &&
          keyValue[0] &&
          keyValue[1] &&
          keyValue[0] === StyleAttribute.Display &&
          keyValue[1] === blockDisplay, // is there a element with display != block
      );
  });
  // Generate all the text blocks under anchor element
  anchorElement.children?.forEach((child) => {
    textBlocks.push(...generateTextBlocks(child, { ...options, hyperlink }));
  });
  if (textBlocks.length === 0) {
    return null;
  }
  const textBlock = textBlocks[0];
  if (hyperlink && textBlock && textBlock.type === 'Text') {
    textBlocks.forEach((textContent) => {
      if (textContent.type === 'Text') {
        // Merging the multiple text blocks with different formattings in to a single text block with all assigned formattings.
        // NOTE: Common properties are overrided by the last TextBlock.
        displayText += textContent.text!.text;
        // In case of text blocks with display as block,
        // To treat them as a block element, add a new line after each text block
        // And move all the block level properties on text block to the closest parent block element like paragraph/list item/table cell
        if (isBlockElement) {
          displayText += nbspCharacter;
          blockProperties = Object.assign(
            blockProperties,
            textContent.text!.properties,
          );
        }
        if (textContent.text!.marks) {
          hyperlinkFormattings.push(...textContent.text!.marks);
        }
        if (textContent.text!.properties?.backgroundColor) {
          backgroundColor = textContent.text!.properties.backgroundColor;
        }
        if (textContent.text!.properties?.fontSize) {
          fontSize = textContent.text!.properties.fontSize;
        }
        if (textContent.text!.properties?.textColor) {
          textColor = textContent.text!.properties.textColor;
        }
      }
    });
    textBlock.text!.text = displayText;
    textBlock.text!.hyperlink = hyperlink;
    if (hyperlinkFormattings.length > 0) {
      textBlock.text!.marks = Array.from(new Set(hyperlinkFormattings));
    }
    if (backgroundColor || fontSize || textColor) {
      textBlock.text!.properties = Object.assign(
        {},
        isBlockElement && blockProperties,
        backgroundColor && { backgroundColor },
        fontSize && { fontSize },
        textColor && { textColor },
      );
    }
  }
  return textBlock;
};
