import { AstElement } from 'html-parse-stringify';
import { TextMark, TextBlock } from '../models/blocks/text';
import { generateTextBlocks } from './text';
import { ContentBlock, ContentBlockType } from '../models/blocks/content-block';

export const generateHyperlinkBlock = (
  anchorElement: AstElement,
  marks: TextMark[] = [],
): TextBlock => {
  const textBlocks: ContentBlock[] = [];
  const hyperlinkFormattings = marks;
  let displayText = '';

  const hyperlink: string | undefined =
    anchorElement.attrs?.href || anchorElement.attrs?.title;
  anchorElement.children?.forEach((child) => {
    textBlocks.push(...generateTextBlocks(child, { hyperlink }));
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
