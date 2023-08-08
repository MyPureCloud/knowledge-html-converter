import { AstElement } from 'html-parse-stringify';
import { BlockType } from '../models/blocks/block-type';
import { ImageBlock } from '../models/blocks/image';
import { TextMark, TextBlocks } from '../models/blocks/text';
import { VideoBlock } from '../models/blocks/video';
import { generateTextBlocks } from './text';

export const generateHyperlinkBlock = (
  anchorElement: AstElement,
  marks: TextMark[] = [],
): TextBlocks => {
  const textBlocks: (TextBlocks | ImageBlock | VideoBlock)[] = [];
  const hyperlinkFormattings = marks;
  let displayText = '';

  const hyperlink = anchorElement.attrs?.href || anchorElement.attrs?.title;
  anchorElement.children?.forEach((child) => {
    textBlocks.push(...generateTextBlocks(child, [], { hyperlink }));
  });
  const textBlock = textBlocks[0];
  if (hyperlink && textBlock && textBlock.type === BlockType.TextBlocks) {
    textBlocks.forEach((textContent) => {
      if (textContent.type === BlockType.TextBlocks) {
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
  return textBlock as TextBlocks;
};
