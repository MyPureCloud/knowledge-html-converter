import { DomNode } from 'html-parse-stringify';
import { DocumentTextBlock } from '../models/blocks/document-text-block';
import {
  TextBlockOptions,
  generateTextBlocks,
  shrinkTextNodeWhiteSpaces,
} from './text';
import {
  DocumentContentBlock,
  DocumentContentBlockType,
} from '../models/blocks/document-content-block';

export const generateHyperlinkBlock = (
  anchorElement: DomNode,
  options: TextBlockOptions = {},
): DocumentTextBlock => {
  const textBlocks: DocumentContentBlock[] = [];
  const hyperlinkFormattings = options.textMarks || [];
  let displayText = '';

  let hyperlink: string | undefined =
    anchorElement.attrs?.href || anchorElement.attrs?.title;
  if (hyperlink && hyperlink.startsWith('#')) {
    hyperlink = undefined;
  }
  let children = anchorElement.children;
  if (!options.isPreformatted) {
    children = shrinkTextNodeWhiteSpaces(children);
  }
  children?.forEach((child) => {
    textBlocks.push(...generateTextBlocks(child, { ...options, hyperlink }));
  });
  const textBlock = textBlocks[0];
  if (
    hyperlink &&
    textBlock &&
    textBlock.type === DocumentContentBlockType.Text
  ) {
    textBlocks.forEach((textContent) => {
      if (textContent.type === DocumentContentBlockType.Text) {
        displayText += textContent.text.text;
        if (textContent.text.marks) {
          hyperlinkFormattings.push(...textContent.text.marks);
        }
      }
    });
    textBlock.text.text = displayText;
    textBlock.text.hyperlink = hyperlink;
    if (hyperlinkFormattings.length > 0) {
      textBlock.text.marks = Array.from(new Set(hyperlinkFormattings));
    }
  }
  return textBlock as DocumentTextBlock;
};
