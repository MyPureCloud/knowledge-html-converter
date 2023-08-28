import { DomNode } from 'html-parse-stringify';
import { TextBlock } from '../models/blocks/text';
import {
  TextBlockOptions,
  generateTextBlocks,
  shrinkTextNodeWhiteSpaces,
} from './text';
import { ContentBlock, ContentBlockType } from '../models/blocks/content-block';

export const generateHyperlinkBlock = (
  anchorElement: DomNode,
  options: TextBlockOptions = {},
): TextBlock => {
  const textBlocks: ContentBlock[] = [];
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
  if (hyperlink && textBlock && textBlock.type === ContentBlockType.Text) {
    textBlocks.forEach((textContent) => {
      if (textContent.type === ContentBlockType.Text) {
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
  return textBlock as TextBlock;
};
