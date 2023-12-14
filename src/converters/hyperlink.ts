import { DomNode } from 'html-parse-stringify';
import { TextBlockOptions, generateTextBlocks } from './text.js';
import { DocumentContentBlock } from '../models/blocks/document-body-paragraph.js';

export const generateHyperlinkBlock = (
  anchorElement: DomNode,
  options: TextBlockOptions = {},
): DocumentContentBlock => {
  const textBlocks: DocumentContentBlock[] = [];
  const hyperlinkFormattings = options.textMarks || [];
  let displayText = '';

  let hyperlink: string | undefined =
    anchorElement.attrs?.href || anchorElement.attrs?.title;
  if (hyperlink && hyperlink.startsWith('#')) {
    hyperlink = undefined;
  }
  anchorElement.children?.forEach((child) => {
    textBlocks.push(...generateTextBlocks(child, { ...options, hyperlink }));
  });
  const textBlock = textBlocks[0];
  if (hyperlink && textBlock && textBlock.type === 'Text') {
    textBlocks.forEach((textContent) => {
      if (textContent.type === 'Text') {
        displayText += textContent.text!.text;
        if (textContent.text!.marks) {
          hyperlinkFormattings.push(...textContent.text!.marks);
        }
      }
    });
    textBlock.text!.text = displayText;
    textBlock.text!.hyperlink = hyperlink;
    if (hyperlinkFormattings.length > 0) {
      textBlock.text!.marks = Array.from(new Set(hyperlinkFormattings));
    }
  }
  return textBlock;
};
